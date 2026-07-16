from machine import Pin


class Encoder:
    # 状态转移表：键为 (上一状态 << 2) | 当前状态，值为增量（+1 正转，-1 反转）
    _TRANS = {
        # 正转状态序列：00 -> 01 -> 11 -> 10 -> 00
        (0b00 << 2) | 0b01: 1,
        (0b01 << 2) | 0b11: 1,
        (0b11 << 2) | 0b10: 1,
        (0b10 << 2) | 0b00: 1,
        # 反转状态序列：00 -> 10 -> 11 -> 01 -> 00
        (0b00 << 2) | 0b10: -1,
        (0b10 << 2) | 0b11: -1,
        (0b11 << 2) | 0b01: -1,
        (0b01 << 2) | 0b00: -1,
    }

    def __init__(self, a_pin, b_pin):
        # 初始化 A、B 相引脚（内部上拉）
        self.a = Pin(a_pin, Pin.IN, Pin.PULL_UP)
        self.b = Pin(b_pin, Pin.IN, Pin.PULL_UP)

        self._position = 0
        # 保存上一次状态（A为高位，B为低位）
        self.last_state = (self.a.value() << 1) | self.b.value()

        # 为两个引脚同时设置中断（上升沿+下降沿）
        self.a.irq(trigger=Pin.IRQ_RISING | Pin.IRQ_FALLING, handler=self.update)
        self.b.irq(trigger=Pin.IRQ_RISING | Pin.IRQ_FALLING, handler=self.update)

    @property
    def position(self):
        return self._position

    @position.setter
    def position(self, value):
        self._position = value

    def update(self, _=None):
        # 读取当前 A、B 状态
        state = (self.a.value() << 1) | self.b.value()
        if state != self.last_state:
            # 查表获得方向增量
            key = (self.last_state << 2) | state
            delta = self._TRANS.get(key, 0)
            self._position += delta
            self.last_state = state
