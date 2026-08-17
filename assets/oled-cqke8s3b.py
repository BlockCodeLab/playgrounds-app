"""
MicroPython 统一 OLED 驱动程序，支持 SSD1306 和 SH1106（I2C 接口）
- 增量页面更新：仅发送内容发生变化的页面
- 公共方法：poweron, poweroff, contrast, invert, rotate, show
- 两种驱动均只支持 0° 和 180° 旋转（与 SSD1306 行为一致）
"""

import time

import framebuf
from machine import I2C, Pin
from micropython import const

# ---------- SSD1306 寄存器定义 ----------
SET_CONTRAST = const(0x81)
SET_ENTIRE_ON = const(0xA4)
SET_NORM_INV = const(0xA6)
SET_DISP = const(0xAE)  # 显示开关（最低位=1 开启，0 关闭）
SET_MEM_ADDR = const(0x20)
SET_COL_ADDR = const(0x21)
SET_PAGE_ADDR = const(0x22)
SET_DISP_START_LINE = const(0x40)
SET_SEG_REMAP = const(0xA0)
SET_MUX_RATIO = const(0xA8)
SET_IREF_SELECT = const(0xAD)
SET_COM_OUT_DIR = const(0xC0)
SET_DISP_OFFSET = const(0xD3)
SET_COM_PIN_CFG = const(0xDA)
SET_DISP_CLK_DIV = const(0xD5)
SET_PRECHARGE = const(0xD9)
SET_VCOM_DESEL = const(0xDB)
SET_CHARGE_PUMP = const(0x8D)

# ---------- SH1106 寄存器定义 ----------
_SH_SET_CONTRAST = const(0x81)
_SH_SET_NORM_INV = const(0xA6)
_SH_SET_DISP = const(0xAE)
_SH_SET_SCAN_DIR = const(0xC0)
_SH_SET_SEG_REMAP = const(0xA0)
_SH_LOW_COLUMN_ADDRESS = const(0x00)  # 低 4 位列地址
_SH_HIGH_COLUMN_ADDRESS = const(0x10)  # 高 4 位列地址
_SH_SET_PAGE_ADDRESS = const(0xB0)  # 页地址（0~7）

# ---------- 5x7 点阵字体数据（用于 draw_char / draw_text） ----------
_FONT_HEIGHT = 12
_FONT_DATA = {
    " ": b"\x00\x00\x00\x00\x00\x00\x00\x00",
    "!": b"\xfe\x02",
    '"': b"\x0e\x00\x00\x00\x0e\x00",
    "#": b"\x88\x00\xfe\x03\x88\x00\x88\x00\xfe\x03\x88\x00",
    "$": b"\x1c\x01\x22\x02\xff\x07\x22\x02\xc4\x01",
    "%": b"\x04\x00\x0a\x03\xc4\x00\x20\x00\x18\x01\x86\x02\x00\x01",
    "&": b"\xc0\x01\x2c\x02\x32\x02\x52\x02\x8c\x01\x60\x02",
    "'": b"\x0e\x00",
    "(": b"\xf8\x00\x06\x03\x01\x04",
    ")": b"\x01\x04\x06\x03\xf8\x00",
    "*": b"\xa0\x00\x40\x00\xf0\x01\x40\x00\xa0\x00",
    "+": b"\x40\x00\x40\x00\xf0\x01\x40\x00\x40\x00",
    ",": b"\x00\x08\x00\x06",
    "-": b"\x40\x00\x40\x00\x40\x00\x40\x00\x40\x00",
    ".": b"\x00\x02",
    "/": b"\x00\x06\x80\x01\x70\x00\x0c\x00\x03\x00",
    "0": b"\xfc\x01\x42\x02\x22\x02\x12\x02\xfc\x01",
    "1": b"\x04\x02\xfe\x03\x00\x02",
    "2": b"\x04\x03\x82\x02\x42\x02\x22\x02\x1c\x02",
    "3": b"\x04\x01\x02\x02\x22\x02\x22\x02\xdc\x01",
    "4": b"\xc0\x00\xb0\x00\x8c\x00\xfe\x03\x80\x00",
    "5": b"\x3e\x01\x22\x02\x22\x02\x22\x02\xc2\x01",
    "6": b"\xfc\x01\x22\x02\x22\x02\x22\x02\xc4\x01",
    "7": b"\x02\x00\x02\x00\xc2\x03\x32\x00\x0e\x00",
    "8": b"\xdc\x01\x22\x02\x22\x02\x22\x02\xdc\x01",
    "9": b"\x1c\x01\x22\x02\x22\x02\x22\x02\xfc\x01",
    ":": b"\x10\x02",
    ";": b"\x00\x08\x10\x06",
    "<": b"\x40\x00\xa0\x00\x10\x01\x08\x02",
    "=": b"\xa0\x00\xa0\x00\xa0\x00\xa0\x00\xa0\x00",
    ">": b"\x08\x02\x10\x01\xa0\x00\x40\x00",
    "?": b"\x04\x00\x02\x00\xc2\x02\x22\x00\x1c\x00",
    "@": b"\xf8\x01\x04\x02\xf2\x05\x0a\x05\xfa\x04\x04\x05\xf8\x01",
    "A": b"\x00\x03\xe0\x00\x58\x00\x46\x00\x58\x00\xe0\x00\x00\x03",
    "B": b"\xfe\x03\x22\x02\x22\x02\x22\x02\x22\x02\xdc\x01",
    "C": b"\xf8\x00\x04\x01\x02\x02\x02\x02\x02\x02\x04\x01",
    "D": b"\xfe\x03\x02\x02\x02\x02\x02\x02\x04\x01\xf8\x00",
    "E": b"\xfe\x03\x22\x02\x22\x02\x22\x02\x22\x02\x02\x02",
    "F": b"\xfe\x03\x22\x00\x22\x00\x22\x00\x22\x00\x02\x00",
    "G": b"\xf8\x00\x04\x01\x02\x02\x02\x02\x42\x02\xc4\x03",
    "H": b"\xfe\x03\x20\x00\x20\x00\x20\x00\x20\x00\xfe\x03",
    "I": b"\x02\x02\xfe\x03\x02\x02",
    "J": b"\x80\x01\x00\x02\x00\x02\x00\x02\xfe\x01",
    "K": b"\xfe\x03\x20\x00\x50\x00\x88\x00\x04\x01\x02\x02",
    "L": b"\xfe\x03\x00\x02\x00\x02\x00\x02\x00\x02",
    "M": b"\xfe\x03\x18\x00\x60\x00\x80\x03\x60\x00\x18\x00\xfe\x03",
    "N": b"\xfe\x03\x04\x00\x18\x00\x60\x00\x80\x01\xfe\x03",
    "O": b"\xf8\x00\x04\x01\x02\x02\x02\x02\x02\x02\x04\x01\xf8\x00",
    "P": b"\xfe\x03\x22\x00\x22\x00\x22\x00\x22\x00\x1c\x00",
    "Q": b"\xf8\x00\x04\x01\x02\x02\x02\x02\x82\x02\x04\x01\xf8\x02",
    "R": b"\xfe\x03\x22\x00\x22\x00\x62\x00\xa2\x01\x1c\x02",
    "S": b"\x0c\x01\x12\x02\x22\x02\x22\x02\x42\x02\x84\x01",
    "T": b"\x02\x00\x02\x00\x02\x00\xfe\x03\x02\x00\x02\x00\x02\x00",
    "U": b"\xfe\x01\x00\x02\x00\x02\x00\x02\x00\x02\xfe\x01",
    "V": b"\x06\x00\x38\x00\xc0\x00\x00\x03\xc0\x00\x38\x00\x06\x00",
    "W": b"\x0e\x00\x70\x00\x80\x03\x70\x00\x0e\x00\x70\x00\x80\x03\x70\x00\x0e\x00",
    "X": b"\x02\x02\x8c\x01\x50\x00\x20\x00\x50\x00\x8c\x01\x02\x02",
    "Y": b"\x02\x00\x0c\x00\x30\x00\xc0\x03\x30\x00\x0c\x00\x02\x00",
    "Z": b"\x02\x03\x82\x02\x62\x02\x12\x02\x0a\x02\x06\x02",
    "[": b"\xff\x07\x01\x04\x01\x04",
    "\\": b"\x03\x00\x0c\x00\x70\x00\x80\x01\x00\x06",
    "]": b"\x01\x04\x01\x04\xff\x07",
    "^": b"\x08\x00\x04\x00\x02\x00\x04\x00\x08\x00",
    "_": b"\x00\x08\x00\x08\x00\x08\x00\x08\x00\x08",
    "`": b"\x02\x00\x04\x00",
    "a": b"\x80\x01\x50\x02\x50\x02\x50\x02\xe0\x03",
    "b": b"\xfe\x03\x10\x02\x10\x02\x10\x02\xe0\x01",
    "c": b"\xe0\x01\x10\x02\x10\x02\x10\x02\x20\x01",
    "d": b"\xe0\x01\x10\x02\x10\x02\x10\x02\xfe\x03",
    "e": b"\xe0\x01\x50\x02\x50\x02\x50\x02\x60\x01",
    "f": b"\x10\x00\xfc\x03\x12\x00\x12\x00",
    "g": b"\xe0\x01\x10\x0a\x10\x0a\x10\x0a\xf0\x07",
    "h": b"\xfe\x03\x20\x00\x10\x00\x10\x00\xe0\x03",
    "i": b"\x10\x02\xf2\x03\x00\x02",
    "j": b"\x10\x08\x10\x08\xf2\x07",
    "k": b"\xfe\x03\x40\x00\xa0\x00\x20\x01\x10\x02",
    "l": b"\x02\x00\xfe\x03\x00\x02",
    "m": b"\xf0\x03\x10\x00\x10\x00\xe0\x03\x10\x00\x10\x00\xe0\x03",
    "n": b"\xf0\x03\x20\x00\x10\x00\x10\x00\xe0\x03",
    "o": b"\xe0\x01\x10\x02\x10\x02\x10\x02\xe0\x01",
    "p": b"\xf0\x0f\x10\x02\x10\x02\x10\x02\xe0\x01",
    "q": b"\xe0\x01\x10\x02\x10\x02\x10\x02\xf0\x0f",
    "r": b"\xf0\x03\x20\x00\x10\x00\x10\x00",
    "s": b"\x20\x01\x50\x02\x50\x02\x90\x02\x20\x01",
    "t": b"\x10\x00\xfe\x01\x10\x02\x10\x02",
    "u": b"\xf0\x01\x00\x02\x00\x02\x00\x01\xf0\x03",
    "v": b"\x30\x00\xc0\x00\x00\x03\xc0\x00\x30\x00",
    "w": b"\xf0\x00\x00\x03\xc0\x00\x30\x00\xc0\x00\x00\x03\xf0\x00",
    "x": b"\x10\x02\x20\x01\xc0\x00\x20\x01\x10\x02",
    "y": b"\x70\x08\x80\x09\x00\x06\x80\x01\x70\x00",
    "z": b"\x10\x03\x90\x02\x50\x02\x30\x02\x10\x02",
    "{": b"\x20\x00\xde\x03\x01\x04\x01\x04",
    "|": b"\xff\x07",
    "}": b"\x01\x04\x01\x04\xde\x03\x20\x00",
    "~": b"\x20\x00\x10\x00\x20\x00\x40\x00\x20\x00",
}


# ============================== 基类 OLED ==============================
class OLED(framebuf.FrameBuffer):
    """
    所有 OLED 驱动的基类。
    提供增量页面更新（只发送变化的页面）以及统一的图形接口。
    所有绘图方法都会自动标记受影响的页面为“脏页”，在调用 show() 时只发送脏页。
    """

    def __init__(self, width, height, external_vcc):
        """
        参数:
            width  : 显示宽度（像素）
            height : 显示高度（像素）
            external_vcc : 是否使用外部供电（True 表示外部供电，False 表示内部电荷泵）
        """
        self.width = width
        self.height = height
        self.external_vcc = external_vcc
        self.pages = self.height // 8  # 页数（每页 8 像素高）
        self.buffer = bytearray(self.pages * width)  # 帧缓冲区
        self.pages_to_update = 0  # 位掩码，标记哪些页需要更新
        # 初始化父类 FrameBuffer（使用 MONO_VLSB 格式，即每字节低位在上）
        super().__init__(self.buffer, self.width, self.height, framebuf.MONO_VLSB)

    # ----- 以下抽象方法由子类实现 -----
    def write_cmd(self, cmd):
        """发送一个命令字节"""
        raise NotImplementedError

    def write_data(self, buf):
        """发送数据（字节序列）"""
        raise NotImplementedError

    def init_display(self):
        """执行显示初始化序列"""
        raise NotImplementedError

    def show(self, full_update=False):
        """
        将脏页发送到显示器。
        如果 full_update=True，则强制更新所有页面。
        """
        raise NotImplementedError

    def rotate(self, angle):
        """旋转屏幕，仅支持 0° 或 180°"""
        raise NotImplementedError

    # ----- 电源与显示控制（公共方法） -----
    def poweroff(self):
        """关闭显示（但保持供电）"""
        if hasattr(self, "_is_ssd1306"):
            self.write_cmd(SET_DISP | 0x00)  # SSD1306 关闭
        else:
            self.write_cmd(_SH_SET_DISP | 0x00)  # SH1106 关闭

    def poweron(self):
        """开启显示"""
        if hasattr(self, "_is_ssd1306"):
            self.write_cmd(SET_DISP | 0x01)
        else:
            self.write_cmd(_SH_SET_DISP | 0x01)

    def contrast(self, value):
        """设置对比度（0~255）"""
        if hasattr(self, "_is_ssd1306"):
            self.write_cmd(SET_CONTRAST)
        else:
            self.write_cmd(_SH_SET_CONTRAST)
        self.write_cmd(value)

    def invert(self, invert):
        """设置反转显示（True=反色，False=正常）"""
        if hasattr(self, "_is_ssd1306"):
            self.write_cmd(SET_NORM_INV | (invert & 1))
        else:
            self.write_cmd(_SH_SET_NORM_INV | (invert & 1))

    # ----- 绘图方法（覆盖父类，加入脏页标记） -----
    def pixel(self, x, y, color=1):
        """画一个像素点"""
        super().pixel(x, y, color)
        self._register_updates(y)

    def text(self, text, x, y, color=1):
        """使用内置 8x8 字体绘制字符串（父类提供）"""
        super().text(text, x, y, color)
        self._register_updates(y, y + 7)

    def line(self, x0, y0, x1, y1, color=1):
        """画直线"""
        super().line(x0, y0, x1, y1, color)
        self._register_updates(y0, y1)

    def hline(self, x, y, w, color=1):
        """画水平线"""
        super().hline(x, y, w, color)
        self._register_updates(y)

    def vline(self, x, y, h, color=1):
        """画垂直线"""
        super().vline(x, y, h, color)
        self._register_updates(y, y + h - 1)

    def fill(self, color=1):
        """填充整个屏幕"""
        super().fill(color)
        self.pages_to_update = (1 << self.pages) - 1  # 所有页都脏

    def blit(self, fbuf, x, y, key=-1, palette=None):
        """将另一个帧缓冲绘制到当前缓冲"""
        super().blit(fbuf, x, y, key, palette)
        self._register_updates(y, y + fbuf.height)

    def scroll(self, x, y):
        """滚动屏幕（内容移动）"""
        super().scroll(x, y)
        self.pages_to_update = (1 << self.pages) - 1  # 全屏更新

    def fill_rect(self, x, y, w, h, color=1):
        """填充矩形"""
        super().fill_rect(x, y, w, h, color)
        self._register_updates(y, y + h - 1)

    def rect(self, x, y, w, h, color=1):
        """画矩形框"""
        super().rect(x, y, w, h, color)
        self._register_updates(y, y + h - 1)

    def ellipse(self, x, y, xr, yr, color=1):
        """画椭圆"""
        super().ellipse(x, y, xr, yr, color)
        self._register_updates(y - yr, y + yr - 1)

    # ----- 自定义变宽字体绘制 -----
    def draw_char(self, x, y, ch, color=1, bg=None, font=_FONT_DATA):
        """
        绘制一个可变宽度字符。
        参数:
            x, y   : 左上角坐标
            ch     : 单个字符
            color  : 前景色（0 或 1）
            bg     : 背景色（None 表示透明）
            font   : 字体数据字典
        返回字符宽度（像素），便于连续绘制。
        """
        if not isinstance(ch, str) or len(ch) != 1:
            raise ValueError("ch 必须是单个字符")
        bitmap = font.get(ch)
        if not bitmap:
            return 0
        width = len(bitmap) // 2  # 每个字符用 2 字节表示一列（16 像素高）
        for col in range(width):
            col_data = bitmap[col * 2 : col * 2 + 2]
            for byte_idx in range(2):
                byte_data = col_data[byte_idx]
                for bit_idx in range(8):
                    if byte_data >> bit_idx & 1:
                        self.pixel(x + col, y + byte_idx * 8 + bit_idx, color)
                    elif bg is not None:
                        self.pixel(x + col, y + byte_idx * 8 + bit_idx, bg)
        return width

    def draw_text(self, x, y, s, color=1, bg=None, font=_FONT_DATA):
        """
        绘制字符串（可变宽度字体）。
        字符间自动添加 1 像素间距。
        """
        cx = x
        for ch in s:
            w = self.draw_char(cx, y, ch, color, bg, font)
            cx += w + 1  # 字符间距 1 像素

    # ----- 内部辅助：标记脏页 -----
    def _register_updates(self, y0, y1=None):
        """
        根据 y 坐标范围，标记所有涉及的页面为脏。
        如果 y1 为 None，则只标记 y0 所在的页。
        """
        start_page = max(0, y0 // 8)
        if y1 is None:
            end_page = start_page
        else:
            end_page = max(0, y1 // 8)
            if start_page > end_page:
                start_page, end_page = end_page, start_page
        for page in range(start_page, end_page + 1):
            self.pages_to_update |= 1 << page


# ============================== SSD1306 驱动 ==============================
class SSD1306(OLED):
    """SSD1306 基类（提供初始化、旋转和 show 实现）"""

    def __init__(self, width, height, external_vcc):
        self._is_ssd1306 = True  # 标识用于区分驱动类型
        super().__init__(width, height, external_vcc)
        self.init_display()

    def init_display(self):
        """SSD1306 初始化序列"""
        for cmd in (
            SET_DISP,  # 关闭显示
            SET_MEM_ADDR,
            0x00,  # 水平寻址模式
            SET_DISP_START_LINE,  # 起始行 0
            SET_SEG_REMAP | 0x01,  # 列映射 127->0（水平翻转）
            SET_MUX_RATIO,
            self.height - 1,
            SET_COM_OUT_DIR | 0x08,  # 行映射（垂直翻转）
            SET_DISP_OFFSET,
            0x00,
            SET_COM_PIN_CFG,
            0x02 if self.width > 2 * self.height else 0x12,
            SET_DISP_CLK_DIV,
            0x80,
            SET_PRECHARGE,
            0x22 if self.external_vcc else 0xF1,
            SET_VCOM_DESEL,
            0x30,
            SET_CONTRAST,
            0xFF,
            SET_ENTIRE_ON,  # 正常显示（不使用全亮模式）
            SET_NORM_INV,  # 正常显示（非反色）
            SET_IREF_SELECT,
            0x30,
            SET_CHARGE_PUMP,
            0x10 if self.external_vcc else 0x14,  # 内部电荷泵
            SET_DISP | 0x01,  # 开启显示
        ):
            self.write_cmd(cmd)
        self.fill(0)
        self.show()

    def rotate(self, angle):
        """
        旋转屏幕，仅支持 0° 或 180°。
        SSD1306 通过改变段映射和 COM 输出方向实现 180° 翻转。
        """
        if angle not in (0, 180):
            raise ValueError("SSD1306 只支持 0° 或 180° 旋转")
        flip = angle == 180
        self.write_cmd(SET_COM_OUT_DIR | ((flip & 1) << 3))
        self.write_cmd(SET_SEG_REMAP | (flip & 1))

    def show(self, full_update=False):
        """
        发送脏页到 SSD1306。
        如果 full_update=True，强制发送所有页。
        """
        # 计算列地址范围（部分屏幕可能有偏移，例如 128x32 采用居中显示）
        x0 = 0
        x1 = self.width - 1
        if self.width != 128:
            offset = (128 - self.width) // 2
            x0 += offset
            x1 += offset

        if full_update:
            pages_mask = (1 << self.pages) - 1
        else:
            pages_mask = self.pages_to_update

        for page in range(self.pages):
            if pages_mask & (1 << page):
                # 设置页地址（只更新单页）
                self.write_cmd(SET_PAGE_ADDR)
                self.write_cmd(page)
                self.write_cmd(page)
                # 设置列地址
                self.write_cmd(SET_COL_ADDR)
                self.write_cmd(x0)
                self.write_cmd(x1)
                # 发送该页数据
                start = page * self.width
                self.write_data(self.buffer[start : start + self.width])
        self.pages_to_update = 0


class SSD1306_I2C(SSD1306):
    """SSD1306 I2C 接口实现"""

    def __init__(self, width, height, i2c, addr=0x3C, external_vcc=False):
        self.i2c = i2c
        self.addr = addr
        self.temp = bytearray(2)  # 用于发送命令
        self.write_list = [b"\x40", None]  # 数据头（Co=0, D/C#=1） + 数据负载
        super().__init__(width, height, external_vcc)

    def write_cmd(self, cmd):
        """发送单字节命令（控制字节 0x80）"""
        self.temp[0] = 0x80  # Co=1, D/C#=0
        self.temp[1] = cmd
        self.i2c.writeto(self.addr, self.temp)

    def write_data(self, buf):
        """发送数据（控制字节 0x40 后面跟数据）"""
        self.write_list[1] = buf
        self.i2c.writevto(self.addr, self.write_list)


# ============================== SH1106 驱动（修正版） ==============================
class SH1106(OLED):
    """
    SH1106 驱动（仅支持 0°/180° 旋转，与 SSD1306 行为一致）
    注意：SH1106 的列地址从 2 开始（硬件偏移），因此发送列地址时固定加 2。
    """

    def __init__(self, width, height, external_vcc):
        self._is_ssd1306 = False  # 标识为非 SSD1306
        self.flip_en = False  # 当前是否 180° 翻转
        super().__init__(width, height, external_vcc)

    # ----- 抽象方法由子类实现 -----
    def write_cmd(self, cmd):
        raise NotImplementedError

    def write_data(self, buf):
        raise NotImplementedError

    def init_display(self):
        raise NotImplementedError

    def show(self, full_update=False):
        """
        发送脏页到 SH1106。
        注意：SH1106 的列地址从 2 开始（硬件偏移）。
        """
        if full_update:
            pages_mask = (1 << self.pages) - 1
        else:
            pages_mask = self.pages_to_update

        for page in range(self.pages):
            if pages_mask & (1 << page):
                self.write_cmd(_SH_SET_PAGE_ADDRESS | page)
                # 列地址低 4 位 = 2（硬件偏移），高 4 位 = 0
                self.write_cmd(_SH_LOW_COLUMN_ADDRESS | 2)
                self.write_cmd(_SH_HIGH_COLUMN_ADDRESS | 0)
                start = page * self.width
                self.write_data(self.buffer[start : start + self.width])
        self.pages_to_update = 0

    def rotate(self, angle):
        """仅支持 0° 或 180° 旋转，通过 flip() 实现"""
        if angle not in (0, 180):
            raise ValueError("SH1106 只支持 0° 或 180° 旋转")
        self.flip(angle == 180, update=True)

    def flip(self, flag=None, update=True):
        """
        设置水平+垂直镜像（即 180° 翻转）。
        参数:
            flag  : True 表示翻转，False 表示正常；若为 None 则切换当前状态
            update: 是否立即刷新显示
        """
        if flag is None:
            flag = not self.flip_en
        # 设置段映射（水平翻转）和扫描方向（垂直翻转）
        self.write_cmd(_SH_SET_SEG_REMAP | (0x01 if flag else 0x00))
        self.write_cmd(_SH_SET_SCAN_DIR | (0x08 if flag else 0x00))
        self.flip_en = flag
        if update:
            self.show(True)

    # 重写电源控制（使用 SH1106 专用命令）
    def poweroff(self):
        self.write_cmd(_SH_SET_DISP | 0x00)

    def poweron(self):
        self.write_cmd(_SH_SET_DISP | 0x01)

    def contrast(self, value):
        self.write_cmd(_SH_SET_CONTRAST)
        self.write_cmd(value)

    def invert(self, invert):
        self.write_cmd(_SH_SET_NORM_INV | (invert & 1))


class SH1106_I2C(SH1106):
    """SH1106 I2C 接口实现（已修复初始化缺失问题）"""

    def __init__(
        self, width, height, i2c, res=None, addr=0x3C, external_vcc=False, delay=0
    ):
        """
        参数:
            width, height : 显示尺寸
            i2c           : machine.I2C 对象
            res           : 复位引脚（Pin 对象），可选
            addr          : I2C 设备地址，默认 0x3C
            external_vcc  : 是否外部供电
            delay         : 开机后额外延时（毫秒），某些屏幕需要
        """
        self.i2c = i2c
        self.addr = addr
        self.res_pin = res
        self.delay = delay
        if res is not None:
            res.init(res.OUT, value=1)
        super().__init__(width, height, external_vcc)
        # <<< 修改：此处调用初始化（之前缺失） >>>
        self.init_display()

    def write_cmd(self, cmd):
        """发送单字节命令（控制字节 0x80）"""
        self.i2c.writeto(self.addr, bytes([0x80, cmd]))

    def write_data(self, buf):
        """发送数据（控制字节 0x40 后面跟数据）"""
        self.i2c.writeto(self.addr, b"\x40" + buf)

    def reset(self):
        """硬件复位（拉低复位引脚）"""
        if self.res_pin is not None:
            self.res_pin(1)
            time.sleep_ms(1)
            self.res_pin(0)
            time.sleep_ms(20)
            self.res_pin(1)
            time.sleep_ms(20)

    # <<< 修改：增强初始化序列，确保显示正常 >>>
    def init_display(self):
        """
        SH1106 初始化序列（参照常见驱动，增加关键命令）
        """
        self.reset()
        # 关闭显示
        self.write_cmd(0xAE)
        # 设置列地址低 4 位（起始列 = 2，因为 SH1106 硬件偏移 2 列）
        self.write_cmd(0x02)  # 低 4 位 = 2
        self.write_cmd(0x10)  # 高 4 位 = 0
        # 设置起始行（通常为 0）
        self.write_cmd(0x40)
        # 设置对比度（中等）
        self.write_cmd(0x81)
        self.write_cmd(0x7F)
        # 段重映射（0xA1 水平翻转，0xA0 正常；这里根据用户习惯可调）
        self.write_cmd(0xA1)
        # COM 扫描方向（0xC8 垂直翻转，0xC0 正常）
        self.write_cmd(0xC8)
        # 正常显示（非反色）
        self.write_cmd(0xA6)
        # 开启显示
        self.write_cmd(0xAF)

        # 清除屏幕
        self.fill(0)
        self.show()
        # 如果有额外延时
        if self.delay:
            time.sleep_ms(self.delay)
