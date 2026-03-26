import time

import machine


class Ultrasonic:
    def __init__(
        self,
        trig_pin,
        echo_pin=None,
        min_distance=0,
        max_distance=400,
        timeout_us=200000,
    ):
        """
        初始化超声波传感器

        :param trig_pin: 触发引脚编号
        :param echo_pin: 回声引脚编号（若为 None 或等于 trig_pin 则使用单线模式）
        :param min_distance: 最小可测距离（厘米），低于此值返回 0
        :param max_distance: 最大可测距离（厘米），高于此值返回 max_distance
        :param timeout_us: 等待回声超时时间（微秒），默认 200ms（对应约 34 米）
        """
        self.trig_pin = trig_pin
        self.echo_pin = echo_pin if echo_pin is not None else trig_pin
        self.min_distance = min_distance
        self.max_distance = max_distance
        self.timeout_us = timeout_us

        # 创建 Pin 对象（不预先设置模式，每次测量时动态设置）
        self.trig = machine.Pin(self.trig_pin)
        self.echo = machine.Pin(
            self.echo_pin
        )  # 若引脚相同，则为同一对象，自动支持单线模式

    def _measure_duration(self):
        """
        发送触发脉冲并测量回声脉冲宽度（往返时间）

        :return: 脉冲宽度（微秒），若超时或无回波则返回 0
        """
        # 确保 trig 为输出并发送 10us 高电平脉冲
        self.trig.init(machine.Pin.OUT)
        self.trig.value(0)
        time.sleep_us(2)
        self.trig.value(1)
        time.sleep_us(10)
        self.trig.value(0)

        # 将 echo 引脚设为输入，准备读取脉冲
        self.echo.init(machine.Pin.IN)

        # 测量高电平脉冲宽度，超时返回 -1
        duration = machine.time_pulse_us(self.echo, 1, self.timeout_us)
        if duration <= 0:  # 超时或无脉冲
            return 0
        return duration

    def _apply_range(self, distance_cm):
        """根据 min/max 限制距离值"""
        if distance_cm > self.max_distance:
            return self.max_distance
        if distance_cm < self.min_distance:
            return 0.0
        return distance_cm

    def distance_cm(self):
        """
        测量距离（厘米），使用默认声速（20°C 时 343 m/s，对应系数 0.0343 cm/µs）

        :return: 距离（厘米），超出范围则截断为 min/max
        """
        d = self._measure_duration()
        # 距离 = (往返时间/2) * 声速 (cm/µs)
        dist = (d / 2) * 0.0343
        return self._apply_range(dist)

    def distance_inch(self):
        """
        测量距离（英寸），基于厘米结果转换

        :return: 距离（英寸）
        """
        cm = self.distance_cm()
        return cm / 2.54

    def precise_distance_cm(self, temperature, humidity):
        """
        根据温湿度精确测量距离（厘米）

        :param temperature: 温度（摄氏度）
        :param humidity:    相对湿度（%）
        :return: 距离（厘米）
        """
        # 计算声速 (m/s)：经典公式 331.4 + 0.606*T + 0.0124*H
        speed_ms = 331.4 + 0.606 * temperature + 0.0124 * humidity
        # 转换为 cm/µs:  (m/s) * 100 (cm/m) / 1e6 (µs/s) = speed_ms / 10000
        speed_cm_per_us = speed_ms / 10000.0

        d = self._measure_duration()
        dist = (d / 2) * speed_cm_per_us
        return self._apply_range(dist)

    def precise_distance_inch(self, temperature, humidity):
        """
        根据温湿度精确测量距离（英寸）

        :param temperature: 温度（摄氏度）
        :param humidity:    相对湿度（%）
        :return: 距离（英寸）
        """
        cm = self.precise_distance_cm(temperature, humidity)
        return cm / 2.54

    @staticmethod
    def convert_to_cm(inches):
        """英寸 -> 厘米"""
        return inches * 2.54

    @staticmethod
    def convert_to_inch(cm):
        """厘米 -> 英寸"""
        return cm / 2.54
