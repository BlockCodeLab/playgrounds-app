import time

import machine

# 按键映射表：每个元素为 (编号, 音符名, 键码)
piano_keymap = [
    (1, "c4", 0xFEFE),
    (2, "d4", 0xFDFD),
    (3, "e4", 0xFBFB),
    (4, "f4", 0xF7F7),
    (5, "g4", 0xEFEF),
    (6, "a4", 0xDFDF),
    (7, "b4", 0xBFBF),
    (8, "c5", 0x7F7F),
]

KEY_MAX = len(piano_keymap)  # 按键数量
PIANO_RELEASED = 0xFFFF  # 释放时返回的值


class TouchPiano:
    def __init__(self, scl_pin, sdo_pin):
        """
        初始化触摸钢琴模块
        :param scl_pin: SCL 引脚编号
        :param sdo_pin: SDO 引脚编号
        """
        self.scl = machine.Pin(scl_pin, machine.Pin.OUT)
        self.sdo = machine.Pin(sdo_pin, machine.Pin.OUT)  # 初始设为输出
        self.scl.value(0)  # SCL 初始低电平
        self.sdo.value(0)

    def get_key_code(self):
        """读取 16 位键码，返回整数值"""
        # 启动时序：SDO 输出高电平 93us，低电平 10us
        self.sdo.init(machine.Pin.OUT)
        self.sdo.value(1)
        time.sleep_us(93)
        self.sdo.value(0)
        time.sleep_us(10)
        self.sdo.init(machine.Pin.IN)  # 切换为输入模式

        data = 0
        for i in range(16):
            self.scl.value(1)
            self.scl.value(0)
            # 读取 SDO 引脚状态并左移 i 位
            if self.sdo.value():
                data |= 1 << i

        time.sleep_ms(4)  # 稳定等待
        return data & PIANO_RELEASED

    def get_key_name(self):
        """返回当前按键的音符名，若无按键则返回 'r'"""
        keycode = self.get_key_code()
        for num, name, code in piano_keymap:
            if code == keycode:
                return name
        return "r"

    def get_key(self):
        """返回当前按键的编号（1~8），若无按键则返回 0"""
        keycode = self.get_key_code()
        for num, name, code in piano_keymap:
            if code == keycode:
                return num
        return 0

    def pressed_key(self, key):
        return self.get_key() == key
