from machine import SPI, Pin
from micropython import const

# 操作码定义
OP_DECODEMODE = const(9)
OP_INTENSITY = const(10)
OP_SCANLIMIT = const(11)
OP_SHUTDOWN = const(12)
OP_DISPLAYTEST = const(15)

FONT_WIDTH_INDEX = const(7)
FONTS = (
    b"\x00\x00\x00\x00\x00\x00\x00\x04",  # Space
    b"\xfa\x00\x00\x00\x00\x00\x00\x01",  # !
    b"\xc0\x00\xc0\x00\x00\x00\x00\x03",  # "
    b"\x48\xfe\x48\xfe\x48\x00\x00\x05",  # #
    b"\x24\x54\xfe\x54\x48\x00\x00\x05",  # $
    b"\x44\xa8\x54\x2a\x44\x00\x00\x05",  # %
    b"\x6c\x92\x6a\x04\x0a\x00\x00\x05",  # &
    b"\xc0\x00\x00\x00\x00\x00\x00\x01",  # '
    b"\x7c\x82\x00\x00\x00\x00\x00\x02",  # (
    b"\x82\x7c\x00\x00\x00\x00\x00\x02",  # )
    b"\x44\x28\xfe\x28\x44\x00\x00\x05",  # *
    b"\x10\x10\x7c\x10\x10\x00\x00\x05",  # +
    b"\x01\x02\x00\x00\x00\x00\x00\x02",  # ,
    b"\x10\x10\x10\x10\x10\x00\x00\x05",  # -
    b"\x02\x00\x00\x00\x00\x00\x00\x01",  # .
    b"\x06\x38\xc0\x00\x00\x00\x00\x03",  # /
    b"\x7c\x92\xa2\x7c\x00\x00\x00\x04",  # 0
    b"\x80\xfe\x00\x00\x00\x00\x00\x02",  # 1
    b"\x8e\x92\x92\x62\x00\x00\x00\x04",  # 2
    b"\x82\x92\x92\x6c\x00\x00\x00\x04",  # 3
    b"\xf0\x08\x08\xfe\x00\x00\x00\x04",  # 4
    b"\xf2\x92\x92\x8c\x00\x00\x00\x04",  # 5
    b"\x7c\x92\x92\x0c\x00\x00\x00\x04",  # 6
    b"\x80\x8e\x90\xe0\x00\x00\x00\x04",  # 7
    b"\x6c\x92\x92\x6c\x00\x00\x00\x04",  # 8
    b"\x60\x92\x92\x7c\x00\x00\x00\x04",  # 9
    b"\x44\x00\x00\x00\x00\x00\x00\x01",  # :
    b"\x02\x44\x00\x00\x00\x00\x00\x02",  # ;
    b"\x10\x28\x44\x82\x00\x00\x00\x04",  # <
    b"\x28\x28\x28\x28\x28\x00\x00\x05",  # =
    b"\x82\x44\x28\x10\x00\x00\x00\x04",  # >
    b"\x80\x9a\xa0\x40\x00\x00\x00\x04",  # ?
    b"\x38\x44\x9a\xaa\xb8\x44\x38\x07",  # @
    b"\x7e\x90\x90\x7e\x00\x00\x00\x04",  # A
    b"\xfe\x92\x92\x6c\x00\x00\x00\x04",  # B
    b"\x7c\x82\x82\x82\x00\x00\x00\x04",  # C
    b"\xfe\x82\x82\x7c\x00\x00\x00\x04",  # D
    b"\xfe\x92\x92\x00\x00\x00\x00\x03",  # E
    b"\xfe\x90\x90\x00\x00\x00\x00\x03",  # F
    b"\x7c\x82\x92\x9c\x00\x00\x00\x04",  # G
    b"\xfe\x10\x10\xfe\x00\x00\x00\x04",  # H
    b"\xfe\x00\x00\x00\x00\x00\x00\x01",  # I
    b"\x02\x02\xfc\x00\x00\x00\x00\x03",  # J
    b"\xfe\x10\x6c\x82\x00\x00\x00\x04",  # K
    b"\xfe\x02\x02\x00\x00\x00\x00\x03",  # L
    b"\xfe\x60\x18\x60\xfe\x00\x00\x05",  # M
    b"\xfe\x60\x18\xfe\x00\x00\x00\x04",  # N
    b"\x7c\x82\x82\x7c\x00\x00\x00\x04",  # O
    b"\xfe\x90\x90\x60\x00\x00\x00\x04",  # P
    b"\x7c\x82\x84\x7a\x00\x00\x00\x04",  # Q
    b"\xfe\x90\x98\x66\x00\x00\x00\x04",  # R
    b"\x62\x92\x92\x8c\x00\x00\x00\x04",  # S
    b"\x80\x80\xfe\x80\x80\x00\x00\x05",  # T
    b"\xfc\x02\x02\xfc\x00\x00\x00\x04",  # U
    b"\xc0\x38\x06\x38\xc0\x00\x00\x05",  # V
    b"\xf0\x0e\x70\x0e\xf0\x00\x00\x05",  # W
    b"\x82\x6c\x10\x6c\x82\x00\x00\x05",  # X
    b"\x80\x60\x1e\x60\x80\x00\x00\x05",  # Y
    b"\x86\x9a\xb2\xc2\x00\x00\x00\x04",  # Z
    b"\xfe\x82\x00\x00\x00\x00\x00\x02",  # [
    b"\xc0\x38\x06\x00\x00\x00\x00\x03",  # backslash
    b"\x82\xfe\x00\x00\x00\x00\x00\x02",  # ]
    b"\x40\x80\x40\x00\x00\x00\x00\x03",  # ^
    b"\x02\x02\x02\x02\x00\x00\x00\x04",  # _
    b"\x80\x40\x00\x00\x00\x00\x00\x02",  # `
    b"\x24\x2a\x2a\x1e\x00\x00\x00\x04",  # a
    b"\xfe\x22\x22\x1c\x00\x00\x00\x04",  # b
    b"\x1c\x22\x22\x22\x00\x00\x00\x04",  # c
    b"\x1c\x22\x22\xfe\x00\x00\x00\x04",  # d
    b"\x1c\x2a\x2a\x1a\x00\x00\x00\x04",  # e
    b"\x20\x7e\xa0\x00\x00\x00\x00\x03",  # f
    b"\x19\x25\x25\x3e\x00\x00\x00\x04",  # g
    b"\xfe\x20\x20\x1e\x00\x00\x00\x04",  # h
    b"\xbe\x00\x00\x00\x00\x00\x00\x01",  # i
    b"\x01\x01\xbe\x00\x00\x00\x00\x03",  # j
    b"\xfe\x08\x14\x22\x00\x00\x00\x04",  # k
    b"\xfc\x02\x00\x00\x00\x00\x00\x02",  # l
    b"\x3e\x20\x3e\x20\x1e\x00\x00\x05",  # m
    b"\x3e\x20\x20\x1e\x00\x00\x00\x04",  # n
    b"\x1c\x22\x22\x1c\x00\x00\x00\x04",  # o
    b"\x3f\x24\x24\x18\x00\x00\x00\x04",  # p
    b"\x18\x24\x24\x3f\x00\x00\x00\x04",  # q
    b"\x3e\x10\x20\x00\x00\x00\x00\x03",  # r
    b"\x12\x2a\x2a\x24\x00\x00\x00\x04",  # s
    b"\x20\x7c\x22\x00\x00\x00\x00\x03",  # t
    b"\x3c\x02\x02\x3e\x00\x00\x00\x04",  # u
    b"\x30\x0c\x02\x0c\x30\x00\x00\x05",  # v
    b"\x38\x06\x18\x06\x38\x00\x00\x05",  # w
    b"\x22\x14\x08\x14\x22\x00\x00\x05",  # x
    b"\x39\x05\x05\x3e\x00\x00\x00\x04",  # y
    b"\x26\x2a\x2a\x32\x00\x00\x00\x04",  # z
    b"\x10\x6c\x82\x00\x00\x00\x00\x03",  # {
    b"\xfe\x00\x00\x00\x00\x00\x00\x01",  # |
    b"\x82\x6c\x10\x00\x00\x00\x00\x03",  # }
    b"\x10\x20\x20\x10\x10\x20\x00\x06",  # ~
)


class Matrix7219:
    def __init__(self, sck_pin, din_pin, cs_pin, num_devices=1):
        """初始化 MAX7219/MAX7221 LED 矩阵控制器"""

        # 初始化SPI
        self.spi = SPI(1, sck=Pin(sck_pin), mosi=Pin(din_pin))

        # 初始化片选引脚
        self.cs_pin = Pin(cs_pin, Pin.OUT)
        self.cs_pin.value(1)  # 初始为高电平

        # 限制设备数量在 1-8 之间
        self.max_devices = min(max(1, num_devices), 8)

        # 状态数组，每个设备8个字节
        self.status = bytearray([0x00] * (self.max_devices * 8))

        # 文字显示缓存区，按列顺序
        self.text_buffer = bytearray(self.max_devices * 8)

        # SPI数据传输缓冲区
        self.spi_buffer = bytearray(2 * self.max_devices)

        # 初始化所有设备
        self._initialize_devices()

    def _initialize_devices(self):
        """初始化所有MAX7219设备"""
        for addr in range(self.max_devices):
            self.spi_transfer(addr, OP_DISPLAYTEST, 0)  # 关闭测试模式
            self.set_scan_limit(addr, 7)  # 扫描所有8行
            self.spi_transfer(addr, OP_DECODEMODE, 0)  # 无解码模式(使用LED矩阵)
            self.shutdown(addr, False)  # 启动时进入开机模式
            self.set_intensity(addr, 7)  # 设置初始亮度
            self.clear_display(addr)  # 清空显示

    def get_device_count(self):
        """返回设备数量"""
        return self.max_devices

    def shutdown(self, addr, shutdown):
        """设置关机模式"""
        if not self._validate_address(addr):
            return

        value = 0 if shutdown else 1
        self.spi_transfer(addr, OP_SHUTDOWN, value)

    def set_scan_limit(self, addr, limit):
        """设置扫描限制，扫描限制 (0-7)"""
        if not self._validate_address(addr):
            return

        if 0 <= limit < 8:
            self.spi_transfer(addr, OP_SCANLIMIT, limit)

    def set_intensity(self, addr, intensity):
        """设置显示亮度，亮度 (0-15)"""
        if not self._validate_address(addr):
            return

        if 0 <= intensity < 16:
            self.spi_transfer(addr, OP_INTENSITY, intensity)

    def clear_display(self, addr=None):
        """清空显示"""
        if addr is None:
            # 清空所有设备
            for i in range(self.max_devices):
                self.clear_display(i)
            return

        if not self._validate_address(addr):
            return

        offset = addr * 8
        for row in range(8):
            self.status[offset + row] = 0x00
            self.spi_transfer(addr, row + 1, 0x00)

    def set_led(self, addr, row, col, state):
        """设置单个LED的状态"""
        if not self._validate_address(addr) or not self._validate_coordinates(row, col):
            return

        offset = addr * 8
        mask = 0x80 >> col  # 对应列的位掩码

        if state:
            self.status[offset + row] |= mask
        else:
            self.status[offset + row] &= ~mask

        self.spi_transfer(addr, row + 1, self.status[offset + row])

    def set_row(self, addr, row, value):
        """设置整行的LED状态"""
        if not self._validate_address(addr) or not self._validate_row(row):
            return

        offset = addr * 8
        self.status[offset + row] = value & 0xFF  # 确保是8位
        self.spi_transfer(addr, row + 1, self.status[offset + row])

    def set_column(self, addr, col, value):
        """设置整列的LED状态"""
        if not self._validate_address(addr) or not self._validate_column(col):
            return

        for row in range(8):
            led_state = (value >> (7 - row)) & 0x01
            self.set_led(addr, row, col, led_state)

    def set_all(self, addr, value):
        """设置所有LED状态"""
        if not self._validate_address(addr):
            return

        pattern = 0xFF if value else 0x00
        for row in range(8):
            self.set_row(addr, row, pattern)

    def show_matrix(self, addr, matrix_data):
        """显示整个8x8矩阵"""
        if not self._validate_address(addr) or len(matrix_data) != 8:
            return

        for row in range(8):
            self.set_row(addr, row, matrix_data[row])

    def show_text(self, text, fonts=None, font_map=None, font_width_index=None):
        """在所有设备显示文字"""
        columns = len(self.text_buffer)
        for i in range(columns):
            self.text_buffer[i] = 0x00

        default_font = not fonts or not font_map or not font_width_index
        if default_font:
            fonts = FONTS
            font_width_index = FONT_WIDTH_INDEX

        fonts_count = len(fonts)
        text_width = 0
        for char in text:
            n = (ord(char) - ord(" ")) if default_font else font_map.find(char)
            if n < 0 or n >= fonts_count:
                n = 0
            text_width += fonts[n][font_width_index]  # 字符宽度
            text_width += 1  # 字符间距

        # 直接显示（如果文本宽度小于等于屏幕宽度）
        if text_width <= columns:
            col = 0
            for char in text:
                n = (ord(char) - ord(" ")) if default_font else font_map.find(char)
                if n < 0 or n >= fonts_count:
                    n = 0
                char_data = fonts[n]
                char_width = char_data[font_width_index]

                # 复制字符数据到缓冲区
                for w in range(char_width):
                    self.text_buffer[col] = char_data[w]
                    col += 1

                # 添加字符间距
                self.text_buffer[col] = 0x00
                col += 1

            # 显示缓冲区内容
            self._refresh_text()
            return

        # 滚动显示
        for char in text:
            n = (ord(char) - ord(" ")) if default_font else font_map.find(char)
            if n < 0 or n >= fonts_count:
                n = 0
            char_data = fonts[n]
            char_width = char_data[font_width_index]

            # 显示字符的每一列
            for w in range(char_width):
                self._scroll_text_buffer(char_data[w])
                self._refresh_text()

            # 显示字符间距
            self._scroll_text_buffer(0x00)
            self._refresh_text()

        # 清屏滚动（文本完全移出屏幕）
        for i in range(columns):
            self._scroll_text_buffer(0x00)
            self._refresh_text()

    def spi_transfer(self, addr, opcode, data):
        """使用硬件SPI传输数据到指定设备"""
        # 清空缓冲区
        for i in range(len(self.spi_buffer)):
            self.spi_buffer[i] = 0x00

        # MAX7219 数据传输格式: 对于级联设备，需要按顺序发送所有设备的数据
        # 设备0对应最远端的设备，所以需要反向填充缓冲区
        offset = (self.max_devices - 1 - addr) * 2
        self.spi_buffer[offset] = opcode
        self.spi_buffer[offset + 1] = data

        # 使能片选并发送数据
        self.cs_pin.value(0)
        for i in range(self.max_devices):
            offset = i * 2
            self.spi.write(self.spi_buffer[offset : offset + 2])
        self.cs_pin.value(1)

    def wakeup(self, addr=None):
        """唤醒设备 (退出关机模式)"""
        if addr is None:
            for i in range(self.max_devices):
                self.shutdown(i, False)
        else:
            self.shutdown(addr, False)

    def sleep(self, addr=None):
        """进入关机模式"""
        if addr is None:
            for i in range(self.max_devices):
                self.shutdown(i, True)
        else:
            self.shutdown(addr, True)

    def test_display(self, addr, enable):
        """显示测试模式 (点亮所有LED)"""
        if not self._validate_address(addr):
            return

        value = 1 if enable else 0
        self.spi_transfer(addr, OP_DISPLAYTEST, value)

    def refresh(self, addr=None):
        """刷新显示"""
        if addr is None:
            for i in range(self.max_devices):
                self.refresh(i)
            return

        if not self._validate_address(addr):
            return

        offset = addr * 8
        for row in range(8):
            self.spi_transfer(addr, row + 1, self.status[offset + row])

    def _scroll_text_buffer(self, value=0x00):
        for i in range(len(self.text_buffer) - 1):
            self.text_buffer[i] = self.text_buffer[i + 1]
        self.text_buffer[-1] = value

    def _refresh_text(self):
        for i in range(self.max_devices):
            for j in range(8):
                self.set_column(i, j, self.text_buffer[i * 8 + j])

    def _validate_address(self, addr):
        """验证设备地址是否有效"""
        return 0 <= addr < self.max_devices

    def _validate_row(self, row):
        """验证行号是否有效"""
        return 0 <= row < 8

    def _validate_column(self, col):
        """验证列号是否有效"""
        return 0 <= col < 8

    def _validate_coordinates(self, row, col):
        """验证行列坐标是否有效"""
        return self._validate_row(row) and self._validate_column(col)

    def deinit(self):
        """释放SPI资源"""
        self.spi.deinit()
