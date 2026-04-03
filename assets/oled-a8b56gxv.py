"""
MicroPython unified OLED driver for SSD1306 and SH1106 (I2C)
- Incremental page update for both drivers (only changed pages are sent)
- Common methods: poweron, poweroff, contrast, invert, rotate, show
- SH1106 supports 0/90/180/270 degree rotation, SSD1306 supports 0/180
"""

import time

import framebuf
from machine import I2C, Pin
from micropython import const

# ---------- SSD1306 register definitions ----------
SET_CONTRAST = const(0x81)
SET_ENTIRE_ON = const(0xA4)
SET_NORM_INV = const(0xA6)
SET_DISP = const(0xAE)
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

# ---------- SH1106 register definitions ----------
_SH_SET_CONTRAST = const(0x81)
_SH_SET_NORM_INV = const(0xA6)
_SH_SET_DISP = const(0xAE)
_SH_SET_SCAN_DIR = const(0xC0)
_SH_SET_SEG_REMAP = const(0xA0)
_SH_LOW_COLUMN_ADDRESS = const(0x00)
_SH_HIGH_COLUMN_ADDRESS = const(0x10)
_SH_SET_PAGE_ADDRESS = const(0xB0)

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


class OLED(framebuf.FrameBuffer):
    """Base class with incremental page update support."""

    def __init__(self, width, height, external_vcc):
        self.width = width
        self.height = height
        self.external_vcc = external_vcc
        self.pages = self.height // 8
        self.buffer = bytearray((height // 8) * width)
        self.pages_to_update = 0  # bitmask of dirty pages
        super().__init__(self.buffer, self.width, self.height, framebuf.MONO_VLSB)

    # ----- Abstract methods (must be implemented by subclass) -----
    def write_cmd(self, cmd):
        raise NotImplementedError

    def write_data(self, buf):
        raise NotImplementedError

    def init_display(self):
        raise NotImplementedError

    def show(self, full_update=False):
        raise NotImplementedError

    def rotate(self, angle):
        raise NotImplementedError

    # ----- Power and display control -----
    def poweroff(self):
        self.write_cmd(
            SET_DISP if hasattr(self, "_is_ssd1306") else _SH_SET_DISP | 0x00
        )

    def poweron(self):
        self.write_cmd(
            (SET_DISP | 0x01) if hasattr(self, "_is_ssd1306") else (_SH_SET_DISP | 0x01)
        )

    def contrast(self, value):
        cmd = SET_CONTRAST if hasattr(self, "_is_ssd1306") else _SH_SET_CONTRAST
        self.write_cmd(cmd)
        self.write_cmd(value)

    def invert(self, invert):
        cmd = SET_NORM_INV if hasattr(self, "_is_ssd1306") else _SH_SET_NORM_INV
        self.write_cmd(cmd | (invert & 1))

    # ----- Graphics primitives with automatic page tracking -----
    def pixel(self, x, y, color=1):
        super().pixel(x, y, color)
        self._register_updates(y)

    def text(self, text, x, y, color=1):
        super().text(text, x, y, color)
        self._register_updates(y, y + 7)

    def line(self, x0, y0, x1, y1, color=1):
        super().line(x0, y0, x1, y1, color)
        self._register_updates(y0, y1)

    def hline(self, x, y, w, color=1):
        super().hline(x, y, w, color)
        self._register_updates(y)

    def vline(self, x, y, h, color=1):
        super().vline(x, y, h, color)
        self._register_updates(y, y + h - 1)

    def fill(self, color=1):
        super().fill(color)
        self.pages_to_update = (1 << self.pages) - 1

    def blit(self, fbuf, x, y, key=-1, palette=None):
        super().blit(fbuf, x, y, key, palette)
        self._register_updates(y, y + fbuf.height)

    def scroll(self, x, y):
        super().scroll(x, y)
        self.pages_to_update = (1 << self.pages) - 1

    def fill_rect(self, x, y, w, h, color=1):
        super().fill_rect(x, y, w, h, color)
        self._register_updates(y, y + h - 1)

    def rect(self, x, y, w, h, color=1):
        super().rect(x, y, w, h, color)
        self._register_updates(y, y + h - 1)

    def ellipse(self, x, y, xr, yr, color=1):
        super().ellipse(x, y, xr, yr, color)
        self._register_updates(y - yr, y + yr - 1)

    def draw_char(self, x, y, ch, color=1, bg=None, font=_FONT_DATA):
        """
        Draw a variable-width character at (x, y).
        ch: single character string
        color: foreground color (0/1)
        bg: background color (None for transparent)
        Returns width of the character (in pixels) for chaining.
        """
        if not isinstance(ch, str) or len(ch) != 1:
            raise ValueError("ch must be a single character")

        bitmap = font[ch]
        if not bitmap:
            return 0
        width = len(bitmap) // 2

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
        """Draw a string at (x, y) using variable-width font."""
        cx = x
        for ch in s:
            w = self.draw_char(cx, y, ch, color, bg, font)
            cx += w + 1  # add one pixel spacing between characters

    def _register_updates(self, y0, y1=None):
        """Mark pages that contain the given y range as dirty."""
        start_page = max(0, y0 // 8)
        end_page = max(0, (y1 // 8) if y1 is not None else start_page)
        if start_page > end_page:
            start_page, end_page = end_page, start_page
        for page in range(start_page, end_page + 1):
            self.pages_to_update |= 1 << page


# ============================== SSD1306 ==============================
class SSD1306(OLED):
    def __init__(self, width, height, external_vcc):
        self._is_ssd1306 = True
        super().__init__(width, height, external_vcc)
        self.init_display()

    def init_display(self):
        for cmd in (
            SET_DISP,
            SET_MEM_ADDR,
            0x00,
            SET_DISP_START_LINE,
            SET_SEG_REMAP | 0x01,
            SET_MUX_RATIO,
            self.height - 1,
            SET_COM_OUT_DIR | 0x08,
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
            SET_ENTIRE_ON,
            SET_NORM_INV,
            SET_IREF_SELECT,
            0x30,
            SET_CHARGE_PUMP,
            0x10 if self.external_vcc else 0x14,
            SET_DISP | 0x01,
        ):
            self.write_cmd(cmd)
        self.fill(0)
        self.show()

    def rotate(self, angle):
        """SSD1306 only supports 0 or 180 degrees."""
        if angle not in (0, 180):
            raise ValueError("SSD1306 only supports 0 or 180 degree rotation")
        flip = angle == 180
        self.write_cmd(SET_COM_OUT_DIR | ((flip & 1) << 3))
        self.write_cmd(SET_SEG_REMAP | (flip & 1))

    def show(self, full_update=False):
        # Determine column offset for displays narrower than 128
        x0 = 0
        x1 = self.width - 1
        if self.width != 128:
            offset = (128 - self.width) // 2
            x0 += offset
            x1 += offset

        # Which pages to update
        if full_update:
            pages_mask = (1 << self.pages) - 1
        else:
            pages_mask = self.pages_to_update

        # Send each dirty page
        for page in range(self.pages):
            if pages_mask & (1 << page):
                self.write_cmd(SET_PAGE_ADDR)
                self.write_cmd(page)  # start page
                self.write_cmd(page)  # end page (single page)
                self.write_cmd(SET_COL_ADDR)
                self.write_cmd(x0)
                self.write_cmd(x1)
                start = page * self.width
                self.write_data(self.buffer[start : start + self.width])

        self.pages_to_update = 0


class SSD1306_I2C(SSD1306):
    def __init__(self, width, height, scl, sda, addr=0x3C, external_vcc=False):
        self.i2c = I2C(1, scl=Pin(scl), sda=Pin(sda))
        self.addr = addr
        self.temp = bytearray(2)
        self.write_list = [b"\x40", None]  # Co=0, D/C#=1
        super().__init__(width, height, external_vcc)

    def write_cmd(self, cmd):
        self.temp[0] = 0x80  # Co=1, D/C#=0
        self.temp[1] = cmd
        self.i2c.writeto(self.addr, self.temp)

    def write_data(self, buf):
        self.write_list[1] = buf
        self.i2c.writevto(self.addr, self.write_list)


# ============================== SH1106 ==============================
class SH1106(OLED):
    def __init__(self, width, height, external_vcc, rotate=0):
        self._is_ssd1306 = False
        self.width = width
        self.height = height
        self.external_vcc = external_vcc
        self.rotate90 = rotate == 90 or rotate == 270
        self.flip_en = rotate == 180 or rotate == 270
        self.pages = self.height // 8
        self.bufsize = self.pages * self.width
        self.renderbuf = bytearray(self.bufsize)
        self.delay = 0

        if self.rotate90:
            self.displaybuf = bytearray(self.bufsize)
            # HMSB needed for byte‑wise remapping to VLSB display
            super().__init__(
                self.renderbuf, self.height, self.width, framebuf.MONO_HMSB
            )
        else:
            self.displaybuf = self.renderbuf
            super().__init__(
                self.renderbuf, self.width, self.height, framebuf.MONO_VLSB
            )

        self.init_display()

    def init_display(self):
        self.reset()
        self.fill(0)
        self.show()
        self.poweron()
        self.flip(self.flip_en)  # apply 0/180 rotation

    def poweron(self):
        self.write_cmd(_SH_SET_DISP | 0x01)
        if self.delay:
            time.sleep_ms(self.delay)

    def poweroff(self):
        self.write_cmd(_SH_SET_DISP | 0x00)

    def flip(self, flag=None, update=True):
        """Set horizontal+vertical mirror (0/180 degree rotation)."""
        if flag is None:
            flag = not self.flip_en
        mir_v = flag ^ self.rotate90
        mir_h = flag
        self.write_cmd(_SH_SET_SEG_REMAP | (0x01 if mir_v else 0x00))
        self.write_cmd(_SH_SET_SCAN_DIR | (0x08 if mir_h else 0x00))
        self.flip_en = flag
        if update:
            self.show(True)

    def rotate(self, angle):
        """0, 90, 180, 270 degrees."""
        if angle not in (0, 90, 180, 270):
            raise ValueError("Rotation must be 0, 90, 180 or 270")
        # Recreate instance with new rotation (simplest, discards current content)
        self.__init__(self.width, self.height, self.external_vcc, rotate=angle)
        self.pages_to_update = (1 << self.pages) - 1
        self.show(True)

    def show(self, full_update=False):
        w, p = self.width, self.pages
        db, rb = self.displaybuf, self.renderbuf

        # Remap buffer if 90/270 rotation is active
        if self.rotate90:
            for i in range(self.bufsize):
                db[w * (i % p) + (i // p)] = rb[i]

        if full_update:
            pages_mask = (1 << self.pages) - 1
        else:
            pages_mask = self.pages_to_update

        for page in range(self.pages):
            if pages_mask & (1 << page):
                self.write_cmd(_SH_SET_PAGE_ADDRESS | page)
                self.write_cmd(_SH_LOW_COLUMN_ADDRESS | 2)  # column offset 2
                self.write_cmd(_SH_HIGH_COLUMN_ADDRESS | 0)
                self.write_data(db[w * page : w * page + w])

        self.pages_to_update = 0

    def reset(self, res=None):
        if res is not None:
            res(1)
            time.sleep_ms(1)
            res(0)
            time.sleep_ms(20)
            res(1)
            time.sleep_ms(20)


class SH1106_I2C(SH1106):
    def __init__(
        self,
        width,
        height,
        scl,
        sda,
        res=None,
        addr=0x3C,
        rotate=0,
        external_vcc=False,
        delay=0,
    ):
        self.i2c = I2C(1, scl=Pin(scl), sda=Pin(sda))
        self.addr = addr
        self.res_pin = res
        self.temp = bytearray(2)
        self.delay = delay
        if res is not None:
            res.init(res.OUT, value=1)
        super().__init__(width, height, external_vcc, rotate)

    def write_cmd(self, cmd):
        self.temp[0] = 0x80
        self.temp[1] = cmd
        self.i2c.writeto(self.addr, self.temp)

    def write_data(self, buf):
        self.i2c.writeto(self.addr, b"\x40" + buf)

    def reset(self):
        super().reset(self.res_pin)
