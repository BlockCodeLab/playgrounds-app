import struct
import time

import machine


class MatrixKeypad:
    DefaultI2cAddress = 0x65

    _KEYS = [
        "1",
        "4",
        "7",
        "*",
        "2",
        "5",
        "8",
        "0",
        "3",
        "6",
        "9",
        "#",
        "A",
        "B",
        "C",
        "D",
    ]

    def __init__(
        self,
        scl_pin,
        sda_pin,
        i2c_address=DefaultI2cAddress,
        debounce_duration_ms=40,
        i2c_id=1,
    ):
        self.addr = i2c_address
        self.debounce_duration = debounce_duration_ms
        self.i2c = machine.I2C(
            i2c_id, scl=machine.Pin(scl_pin), sda=machine.Pin(sda_pin)
        )

        self.last_key_states = 0  # 上次读取的原始状态
        self.key_states = 0  # 稳定后的按键状态
        self.start_debounce_time = None  # 开始去抖动的时间点

    def init(self):
        devices = self.i2c.scan()
        return self.addr in devices

    def _read_key_states(self):
        try:
            data = self.i2c.readfrom(self.addr, 2)
            return struct.unpack("<h", data)[0]
        except OSError:
            return 0

    @staticmethod
    def _ffs(x):
        if x == 0:
            return 0
        pos = 0
        while (x & 1) == 0:
            x >>= 1
            pos += 1
        return pos + 1

    def get_pressed_key(self):
        current = self._read_key_states()
        now = time.ticks_ms()

        if self.start_debounce_time is None or current != self.last_key_states:
            self.last_key_states = current
            self.start_debounce_time = now
        elif (
            self.key_states != self.last_key_states
            and time.ticks_diff(now, self.start_debounce_time) >= self.debounce_duration
        ):
            self.key_states = self.last_key_states

        if self.key_states == 0:
            return None

        idx = self._ffs(self.key_states) - 1
        if 0 <= idx < len(self._KEYS):
            return self._KEYS[idx]
        return None

    def pressed(self, key):
        return self.get_pressed_key() == key
