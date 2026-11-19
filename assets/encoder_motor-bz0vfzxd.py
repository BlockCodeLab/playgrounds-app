"""
encoder_motor.py
emakefun em_esp32_encoder_motor（Arduino C++ v1.2.0）的 MicroPython 移植

与官方 em_esp32_encoder_motor（MicroPython v2.0.0）对齐的要点：
  1. 调度：所有实例共用一个 50 ms 硬件定时器，init() 后自动跑测速与 PID，
     主循环不需要再调 update()（与 C++ 的后台线程行为一致）。
  2. 编码器：machine.Encoder（ESP32 PCNT 硬件正交解码），每实例独占一个单元。
  3. PWM：10 位 / 250 Hz，有符号占空比 -1023..1023。
  4. 控制律：duty = P*err + I*∫err，D 只保存不使用（与 C++ v1.2.0 一致）。
  5. 命名：以官方蛇形接口为主（run_pwm_duty / pulse_count / speed / ...），
     同时保留 Arduino 同名接口（RunPwmDuty / EncoderPulseCount / SpeedRpm / ...）。

固件要求：MicroPython >= 1.29（ESP32 端口，提供 machine.Encoder）。
更低版本会自动退化为 Pin.irq 软件解码，此时 m.decoder 返回 'irq'。
"""

import time

from machine import PWM, Pin, Timer

try:  # ESP32 PCNT 硬件正交解码
    from machine import Encoder as _HwEncoder
except ImportError:
    _HwEncoder = None

__version__ = "0.2.0"  # 本移植版本
kLibVersion = "1.2.0"  # 对应的 Arduino 库版本

kPwmResolution = 10
kPwmFrequency = 250
kMaxPwmDuty = 1023
kVersionMajor = 1
kVersionMinor = 2
kVersionPatch = 0

DEFAULT_PPR = 12
DEFAULT_REDUCTION_RATIO = 90
PHASE_RELATION_A_PHASE_LEADS = 0
PHASE_RELATION_B_PHASE_LEADS = 1
PWM_RESOLUTION_BITS = 10
PWM_FREQUENCY_HZ = 250
MAX_PWM_DUTY = 1023
SPEED_UPDATE_PERIOD_MS = 50
DEAD_RPM_ZONE = 10

A_PHASE_LEADS = PHASE_RELATION_A_PHASE_LEADS
B_PHASE_LEADS = PHASE_RELATION_B_PHASE_LEADS

DUTY_MAX = MAX_PWM_DUTY
_PWM_U16_MAX = 65535

# MAKER-ESP32-PRO 四路电机/编码器引脚: 通道 -> (电机+, 电机-, 编码器A, 编码器B)
BOARD_MAKER_ESP32_PRO = {
    0: (27, 13, 18, 19),  # E0 / M0
    1: (4, 2, 5, 23),  # E1 / M1
    2: (17, 12, 35, 36),  # E2 / M2  (35/36 只能输入、无内部上拉)
    3: (15, 14, 34, 39),  # E3 / M3  (34/39 只能输入、无内部上拉)
}


def _clamp(v, lo, hi):
    if v < lo:
        return lo
    if v > hi:
        return hi
    return v


_HW_IDS = set()


def _alloc_hw_id():
    for i in range(8):
        if i not in _HW_IDS:
            _HW_IDS.add(i)
            return i
    return None


# 共享心跳：所有实例共用一个硬件定时器
_instances = []
_tick_timer = None
_TIMER_IDS = (0, 1, 2, 3)
_AUTO = [True]  # True = 定时器自动驱动；False = 手动调 update()


def use_timer(enable=True):
    """选择调度方式。

    True（默认）：init() 后由共享硬件定时器每 50 ms 自动跑测速与 PID，
                 主循环不需要调用 update()，与 C++ 后台线程行为一致。
    False       ：关闭定时器，改为手动在主循环里调用 update()。
    """
    _AUTO[0] = bool(enable)
    if not enable:
        _stop_timer()


def _shared_tick(timer):
    now = time.ticks_ms()
    for inst in tuple(_instances):
        try:
            inst._tick(now)
        except Exception:
            pass  # 单个实例出错不能拖垮其它实例的闭环


def _start_timer():
    global _tick_timer
    if _tick_timer is not None:
        return True
    last = None
    for tid in _TIMER_IDS:
        try:
            t = Timer(tid)
            t.init(
                period=SPEED_UPDATE_PERIOD_MS,
                mode=Timer.PERIODIC,
                callback=_shared_tick,
            )
            _tick_timer = t
            return True
        except Exception as exc:
            last = exc
    _tick_timer = None
    raise RuntimeError("no free hardware timer: %s" % last)


def _stop_timer():
    global _tick_timer
    if _tick_timer is not None:
        try:
            _tick_timer.deinit()
        except Exception:
            pass
        _tick_timer = None


def _register(inst):
    if inst not in _instances:
        _instances.append(inst)
    if _AUTO[0]:
        _start_timer()


def _unregister(inst):
    if inst in _instances:
        _instances.remove(inst)
    if not _instances:
        _stop_timer()


class Motor:
    """两路 PWM 电机驱动，对应 ``em::Motor``。

    ``run_pwm_duty(d)``：d>0 驱动正极引脚，d<0 驱动负极引脚，范围 ±1023。
    ``stop()`` 短路制动：释放 PWM，两脚拉高（GPIO）。与官方 mpy 库一致，
    绕开「LEDC 从分数占空比跳到满占空比可能被忽略」的固件差异。
    ``coast()`` 自由滑行：两脚输出 0。``deinit()`` 关停：两脚拉低，无驱动电流。
    """

    def __init__(
        self,
        positive_pin,
        negative_pin,
        pwm_frequency=PWM_FREQUENCY_HZ,
        pwm_resolution=PWM_RESOLUTION_BITS,
        freq=None,
    ):
        self.positive_pin = positive_pin
        self.negative_pin = negative_pin
        self.pwm_frequency = pwm_frequency if freq is None else freq
        self.pwm_resolution = pwm_resolution
        self.max_duty = (1 << pwm_resolution) - 1
        self._p = None
        self._n = None
        self._u16 = False
        self._duty = 0

    # PWM 通道按需创建，stop() 时释放

    def _ensure_pwm(self):
        if self._p is None:
            self._p = PWM(Pin(self.positive_pin), freq=self.pwm_frequency)
            self._n = PWM(Pin(self.negative_pin), freq=self.pwm_frequency)
            self._u16 = hasattr(self._p, "duty_u16")
            self._duty = 0

    def _release_pwm(self):
        for pwm in (self._p, self._n):
            if pwm is not None:
                try:
                    pwm.deinit()
                except Exception:
                    pass
        self._p = None
        self._n = None

    def _write(self, pwm, v):
        if self._u16:
            pwm.duty_u16(v * _PWM_U16_MAX // self.max_duty)
        else:
            pwm.duty(v)

    def init(self):
        """初始化后处于制动状态（与 C++ Motor::Init() 末尾调用 Stop() 一致）。"""
        self.deinit()
        self.stop()
        return self

    def deinit(self):
        """关停：释放 PWM，两脚拉低，无驱动电流。"""
        self._release_pwm()
        Pin(self.positive_pin, Pin.OUT, value=0)
        Pin(self.negative_pin, Pin.OUT, value=0)
        self._duty = 0

    def run_pwm_duty(self, pwm_duty):
        """有符号占空比，范围 ±max_duty（默认 ±1023），越界自动限幅。"""
        d = _clamp(int(pwm_duty), -self.max_duty, self.max_duty)
        self._ensure_pwm()
        self._duty = d
        if d >= 0:
            self._write(self._p, d)
            self._write(self._n, 0)
        else:
            self._write(self._p, 0)
            self._write(self._n, -d)
        return d

    @property
    def pwm_duty(self):
        return self._duty

    def stop(self):
        """短路制动：释放 PWM 通道，两脚作为 GPIO 输出高。"""
        self._duty = 0
        self._release_pwm()
        Pin(self.positive_pin, Pin.OUT, value=1)
        Pin(self.negative_pin, Pin.OUT, value=1)

    def coast(self):
        """自由滑行：两脚输出 0（PWM 0%）。"""
        self._duty = 0
        self._ensure_pwm()
        self._write(self._p, 0)
        self._write(self._n, 0)

    duty = run_pwm_duty
    brake = stop

    def current_duty(self):
        return self._duty

    # Arduino 同名
    Init = init
    RunPwmDuty = run_pwm_duty
    Stop = stop

    def PwmDuty(self):
        return self._duty


class EncoderMotor:
    """带编码器的电机：测速 + 速度闭环，对应 ``em::EncoderMotor``。

    ``init()`` 之后由共享定时器自动运行，不需要手动调用 ``update()``。
    """

    def __init__(
        self,
        positive_pin,
        negative_pin,
        a_pin,
        b_pin,
        ppr=DEFAULT_PPR,
        reduction_ratio=DEFAULT_REDUCTION_RATIO,
        phase_relation=PHASE_RELATION_A_PHASE_LEADS,
        encoder_id=None,
        reduction=None,
        phase=None,
        freq=PWM_FREQUENCY_HZ,
        period_ms=SPEED_UPDATE_PERIOD_MS,
        irq_hard=False,
    ):
        # 兼容旧参数名
        if reduction is not None:
            reduction_ratio = reduction
        if phase is not None:
            phase_relation = phase

        self.motor = Motor(positive_pin, negative_pin, freq=freq)
        self.positive_pin = positive_pin
        self.negative_pin = negative_pin
        self.a_pin_no = a_pin
        self.b_pin_no = b_pin
        self.ppr = ppr
        self.reduction_ratio = reduction_ratio
        self.total_ppr = ppr * reduction_ratio
        self.period_ms = period_ms
        self.irq_hard = irq_hard
        self.encoder_id_arg = encoder_id

        # PID（默认值与 C++ v1.2.0 一致，D 不参与运算）
        self.p = 3.0
        self.i = 1.0
        self.d = 1.0
        self.dead_rpm = DEAD_RPM_ZONE
        self._max_integral = float(self.motor.max_duty)

        # 死区前馈：默认 0（纯 PI，与原库一致）
        self.ff = {1: [0.0, 0.0], -1: [0.0, 0.0]}
        self.duty_max = {1: self.motor.max_duty, -1: self.motor.max_duty}

        self._phase = phase_relation
        self._b_level = 1 if phase_relation == A_PHASE_LEADS else 0
        self._a = None
        self._b = None
        self._count = 0
        self._last_count = 0
        self._last_ms = 0
        self._rpm = 0
        self._target = 0
        self._integral = 0.0
        self._closed = False
        self._inited = False

        self.use_hw = True
        self._enc = None
        self._hw = False
        self._offset = 0
        self.hw_id = None

    def init(
        self,
        ppr=DEFAULT_PPR,
        reduction_ratio=DEFAULT_REDUCTION_RATIO,
        phase_relation=PHASE_RELATION_A_PHASE_LEADS,
    ):
        if self._inited:
            self.deinit()
        self.motor.init()
        self._count = 0
        self._last_count = 0
        self._last_ms = time.ticks_ms()
        self._rpm = 0
        self._integral = 0.0

        self.ppr = ppr
        self.reduction_ratio = reduction_ratio
        self.total_ppr = ppr * reduction_ratio
        self._phase = phase_relation
        self._b_level = 1 if phase_relation == A_PHASE_LEADS else 0

        if _HwEncoder is not None and self.use_hw:
            try:
                hid = self.encoder_id_arg
                if hid is None:
                    hid = _alloc_hw_id()
                elif hid in _HW_IDS:
                    raise ValueError("PCNT unit %d already in use" % hid)
                else:
                    _HW_IDS.add(hid)
                if hid is not None:
                    self.hw_id = hid
                    self._enc = self._open_encoder()
                    self._offset = self._enc.value()
                    self._hw = True
                    self._inited = True
                    _register(self)
                    return self
            except Exception:
                if self.hw_id is not None and self.encoder_id_arg is None:
                    _HW_IDS.discard(self.hw_id)
                self.hw_id = None
                self._enc = None
                self._hw = False

        # 回退：软件中断解码（老固件）
        self._a = self._make_input(self.a_pin_no)
        self._b = self._make_input(self.b_pin_no)
        try:
            self._a.irq(trigger=Pin.IRQ_FALLING, handler=self._on_a, hard=self.irq_hard)
        except TypeError:
            self._a.irq(trigger=Pin.IRQ_FALLING, handler=self._on_a)
        self._inited = True
        _register(self)
        return self

    def _open_encoder(self, hw_id=None, phase=None):
        """创建硬件解码器；B 相领先时交换 A/B 引脚顺序。"""
        pa, pb = self.a_pin_no, self.b_pin_no
        if (self._phase if phase is None else phase) == B_PHASE_LEADS:
            pa, pb = pb, pa
        return _HwEncoder(self.hw_id if hw_id is None else hw_id, Pin(pa), Pin(pb))

    @staticmethod
    def _make_input(pin_no):
        try:
            return Pin(pin_no, Pin.IN, Pin.PULL_UP)
        except Exception:
            return Pin(pin_no, Pin.IN)

    def deinit(self):
        _unregister(self)
        if self._enc is not None:
            try:
                self._enc.deinit()
            except Exception:
                pass
            self._enc = None
            if self.hw_id is not None:
                _HW_IDS.discard(self.hw_id)
                self.hw_id = None
            self._hw = False
        if self._a is not None:
            try:
                self._a.irq(handler=None)
            except Exception:
                pass
            self._a = None
        self.motor.deinit()
        self._inited = False
        self._closed = False
        self._target = 0
        self._integral = 0.0

    # 软件解码中断（仅在无 machine.Encoder 的固件上使用）

    def _on_a(self, pin):
        if self._b.value() == self._b_level:
            self._count += 1
        else:
            self._count -= 1

    def set_phase(self, phase):
        """运行期修改相位关系。返回 True 表示已生效，False 表示重建失败。

        软件解码：直接改判据，下一次中断即生效。
        硬件解码：先在新 PCNT 单元建好解码器，成功后才释放旧的，
                  因此任何一步失败，对象都保持原状、继续可用。
        """
        if phase == self._phase:
            return True

        new_b = 1 if phase == A_PHASE_LEADS else 0

        if not (self._hw and self._inited):
            self._phase = phase
            self._b_level = new_b
            return True

        keep = self.pulse_count

        nid = self.encoder_id_arg if self.encoder_id_arg is not None else _alloc_hw_id()
        if nid is None:
            return False
        try:
            new_enc = self._open_encoder(nid, phase)
        except Exception:
            if self.encoder_id_arg is None:
                _HW_IDS.discard(nid)
            return False

        old_enc, old_id = self._enc, self.hw_id
        self._enc, self.hw_id = new_enc, nid
        self._offset = new_enc.value() - keep
        self._phase = phase
        self._b_level = new_b

        try:
            old_enc.deinit()
        except Exception:
            pass
        if old_id is not None and old_id != nid:
            _HW_IDS.discard(old_id)
        return True

    def set_speed_pid(self, p, i, d):
        self.p = float(p)
        self.i = float(i)
        self.d = float(d)
        self._max_integral = float(self.motor.max_duty) / self.i if self.i > 0 else 0.0
        self._integral = 0.0
        return self

    def get_speed_pid(self):
        """返回 (p, i, d)。对应 C++ 的指针出参版本。"""
        return (self.p, self.i, self.d)

    @property
    def speed_pid_p(self):
        return self.p

    @speed_pid_p.setter
    def speed_pid_p(self, value):
        self.p = float(value)

    @property
    def speed_pid_i(self):
        return self.i

    @speed_pid_i.setter
    def speed_pid_i(self, value):
        self.i = float(value)
        self._max_integral = float(self.motor.max_duty) / self.i if self.i > 0 else 0.0

    @property
    def speed_pid_d(self):
        return self.d

    @speed_pid_d.setter
    def speed_pid_d(self, value):
        self.d = float(value)

    def set_feedforward(self, bias, slope, bias_neg=None, slope_neg=None):
        """死区前馈：duty = bias + slope*|目标| + PI。默认关闭（0,0）。"""
        self.ff[1] = [float(bias), float(slope)]
        if bias_neg is not None and slope_neg is not None:
            self.ff[-1] = [float(bias_neg), float(slope_neg)]

    def set_duty_max(self, pos=None, neg=None):
        """闭环输出上限（绝对值），开环不受影响。"""
        if pos is not None:
            self.duty_max[1] = int(pos)
        if neg is not None:
            self.duty_max[-1] = int(neg)

    def apply_calib(self, d):
        """套用 calibrate.py 生成的标定字典。"""
        if "phase" in d:
            self.set_phase(d["phase"])
        if "bias_pos" in d and "slope_pos" in d:
            self.ff[1] = [float(d["bias_pos"]), float(d["slope_pos"])]
        if "bias_neg" in d and "slope_neg" in d:
            self.ff[-1] = [float(d["bias_neg"]), float(d["slope_neg"])]
        if "duty_pos" in d:
            self.duty_max[1] = int(d["duty_pos"])
        if "duty_neg" in d:
            self.duty_max[-1] = int(d["duty_neg"])
        return self

    def _tick(self, now):
        """定时器回调 / 手动 update() 的公共实现。"""
        if not self._inited:
            return
        dt = time.ticks_diff(now, self._last_ms)
        if dt < self.period_ms:
            return

        c = self.pulse_count
        delta = c - self._last_count
        self._last_count = c
        self._last_ms = now

        num = delta * 60000
        den = dt * self.total_ppr
        if num >= 0:
            self._rpm = num // den
        else:
            self._rpm = -((-num) // den)

        if self._closed:
            self._control()

    def update(self):
        """手动心跳。使用定时器自动调度时为空操作（保留以兼容旧代码）。"""
        if _tick_timer is not None:
            return
        self._tick(time.ticks_ms())

    def _control(self):
        t = self._target
        if -self.dead_rpm < t < self.dead_rpm:
            self.motor.run_pwm_duty(0)
            self._integral = 0.0
            return
        err = t - self._rpm
        self._integral = _clamp(
            self._integral + err, -self._max_integral, self._max_integral
        )
        sign = 1 if t > 0 else -1
        bias, slope = self.ff[sign]
        out = self.p * err + self.i * self._integral  # D 不参与，与原库一致
        if bias > 0:
            out += sign * (bias + abs(t) * slope)
        if out >= 0:
            out = int(out + 0.5)
        else:
            out = -int(-out + 0.5)
        lim = self.duty_max[sign]
        self.motor.run_pwm_duty(_clamp(out, -lim, lim))

    def run_pwm_duty(self, pwm_duty):
        """开环：直接给占空比，同时取消闭环目标。"""
        self._closed = False
        self._target = 0
        self._integral = 0.0
        return self.motor.run_pwm_duty(pwm_duty)

    def run_speed(self, speed_rpm):
        """闭环：设定目标转速（RPM），由共享定时器执行 PI。"""
        self._target = int(speed_rpm)
        if -self.dead_rpm < self._target < self.dead_rpm:
            self._closed = False
            self.motor.run_pwm_duty(0)
            return
        if not self._closed:
            self._closed = True
            self._integral = 0.0

    def stop(self, brake=True):
        """停止：brake=True 短路制动，False 自由滑行。"""
        self._closed = False
        self._target = 0
        self._integral = 0.0
        if brake:
            self.motor.stop()
        else:
            self.motor.coast()

    def reset_pulse_count(self):
        """累计脉冲清零，同时重置测速窗口。"""
        if self._hw:
            self._offset = self._enc.value()
        self._count = 0
        self._last_count = 0
        self._last_ms = time.ticks_ms()

    @property
    def pulse_count(self):
        """累计脉冲数（带符号），对应 EncoderPulseCount()。"""
        if self._hw:
            return self._enc.value() - self._offset
        return self._count

    @property
    def speed(self):
        """当前转速 RPM（带符号），每 50 ms 更新。"""
        return self._rpm

    @property
    def pwm_duty(self):
        return self.motor.pwm_duty

    @property
    def target_rpm(self):
        return self._target

    @property
    def counts_per_rev(self):
        """每圈脉冲数（ppr × 减速比），旧名，等同 total_ppr。"""
        return self.total_ppr

    @property
    def phase_relation(self):
        return self._phase

    @property
    def encoder_id(self):
        """实例占用的 PCNT 单元号；未初始化时为 None。"""
        return self.hw_id

    @property
    def decoder(self):
        """'hw'（PCNT 硬件）或 'irq'（软件中断）。"""
        return "hw" if self._hw else "irq"

    # 简写别名（旧代码兼容）
    run_pwm = run_pwm_duty
    reset_count = reset_pulse_count
    set_pid = set_speed_pid
    count = pulse_count
    rpm = speed
    duty = pwm_duty
    target = target_rpm

    def GetSpeedPid(self):
        return self.get_speed_pid()

    # Arduino 同名接口（读数写成方法，不能直接复用属性别名）
    Init = init
    RunPwmDuty = run_pwm_duty
    RunSpeed = run_speed
    Stop = stop
    ResetPulseCount = reset_pulse_count
    SetSpeedPid = set_speed_pid

    def EncoderPulseCount(self):
        return self.pulse_count

    def SpeedRpm(self):
        return self._rpm

    def PwmDuty(self):
        return self.motor.pwm_duty

    def TargetRpm(self):
        return self._target


def load_calib(channel, path="calib.json"):
    """读取 calibrate.py 写入的标定文件，返回该通道的字典；没有则返回 None。"""
    try:
        import json

        with open(path) as f:
            data = json.load(f)
    except Exception:
        return None
    key = "ch%d" % channel
    if key in data:
        return data[key]
    return data.get(str(channel))


def Version():
    """对应原库 em::esp_encoder_motor_lib::Version()。"""
    return __version__


version = Version
