from time import sleep_ms

from machine import I2C, Pin


class LCD_I2C:
    Default_I2C_ADDR = 0x27

    # LCD Commands
    LCD_CLR = 0x01
    LCD_HOME = 0x02

    LCD_ENTRY_MODE = 0x04
    LCD_ENTRY_INC = 0x02
    LCD_ENTRY_SHIFT = 0x01

    LCD_ON_CTRL = 0x08
    LCD_ON_DISPLAY = 0x04
    LCD_ON_CURSOR = 0x02
    LCD_ON_BLINK = 0x01

    LCD_MOVE = 0x10
    LCD_MOVE_DISP = 0x08
    LCD_MOVE_RIGHT = 0x04

    LCD_FUNCTION = 0x20
    LCD_FUNCTION_8BIT = 0x10
    LCD_FUNCTION_2LINES = 0x08
    LCD_FUNCTION_10DOTS = 0x04
    LCD_FUNCTION_RESET = 0x30

    LCD_CGRAM = 0x40
    LCD_DDRAM = 0x80

    LCD_RS_CMD = 0
    LCD_RS_DATA = 1

    LCD_RW_WRITE = 0
    LCD_RW_READ = 1

    def __init__(
        self, scl, sda, num_columns, num_lines, i2c_addr=Default_I2C_ADDR, i2c_id=1
    ):
        self.i2c = I2C(i2c_id, scl=Pin(scl), sda=Pin(sda))
        self.i2c_addr = i2c_addr
        self.num_lines = num_lines
        self.num_columns = num_columns
        self._current_state = 0x00
        self._backlight = 0x08

        sleep_ms(20)
        self.write_init_nibble(self.LCD_FUNCTION_RESET)
        sleep_ms(5)
        self.write_init_nibble(self.LCD_FUNCTION_RESET)
        sleep_ms(1)
        self.write_init_nibble(self.LCD_FUNCTION_RESET)
        sleep_ms(1)
        self.write_init_nibble(self.LCD_FUNCTION)
        sleep_ms(1)

        self.init_lcd()

    def write_init_nibble(self, nibble):
        byte = ((nibble >> 4) & 0x0F) << 4
        self.i2c.writeto(
            self.i2c_addr, bytes([byte | self.LCD_RS_CMD | self._backlight])
        )
        self.pulse_enable(byte)

    def backlight(self, state):
        if state:
            self.backlight_on()
        else:
            self.backlight_off()

    def backlight_on(self):
        self._backlight = 0x08
        self.i2c.writeto(self.i2c_addr, bytes([self._current_state | self._backlight]))

    def backlight_off(self):
        self._backlight = 0x00
        self.i2c.writeto(self.i2c_addr, bytes([self._current_state | self._backlight]))

    def write_command(self, cmd):
        self._write_byte((cmd & 0xF0) | self.LCD_RS_CMD)
        self._write_byte(((cmd << 4) & 0xF0) | self.LCD_RS_CMD)
        if cmd <= 3:
            sleep_ms(5)

    def write_data(self, data):
        self._write_byte((data & 0xF0) | self.LCD_RS_DATA)
        self._write_byte(((data << 4) & 0xF0) | self.LCD_RS_DATA)

    def _write_byte(self, byte):
        self.i2c.writeto(self.i2c_addr, bytes([byte | self._backlight]))
        self.pulse_enable(byte)

    def pulse_enable(self, byte):
        self.i2c.writeto(self.i2c_addr, bytes([byte | 0x04 | self._backlight]))
        self.i2c.writeto(self.i2c_addr, bytes([byte & ~0x04 | self._backlight]))

    def init_lcd(self):
        self.display_on()
        self.clear()
        self.set_entry_mode()

    def clear(self):
        self.write_command(self.LCD_CLR)
        self.sleep(3)

    def show_cursor(self):
        self.write_command(self.LCD_ON_CTRL | self.LCD_ON_DISPLAY | self.LCD_ON_CURSOR)

    def hide_cursor(self):
        self.write_command(self.LCD_ON_CTRL | self.LCD_ON_DISPLAY)

    def blink_cursor_on(self):
        self.write_command(
            self.LCD_ON_CTRL
            | self.LCD_ON_DISPLAY
            | self.LCD_ON_CURSOR
            | self.LCD_ON_BLINK
        )

    def blink_cursor_off(self):
        self.write_command(self.LCD_ON_CTRL | self.LCD_ON_DISPLAY | self.LCD_ON_CURSOR)

    def display_on(self):
        self.write_command(self.LCD_ON_CTRL | self.LCD_ON_DISPLAY)

    def display_off(self):
        self.write_command(self.LCD_ON_CTRL)

    def set_entry_mode(self, inc=True, shift=False):
        entry_mode = self.LCD_ENTRY_MODE
        if inc:
            entry_mode |= self.LCD_ENTRY_INC
        if shift:
            entry_mode |= self.LCD_ENTRY_SHIFT
        self.write_command(entry_mode)

    def home(self):
        self.write_command(self.LCD_HOME)
        self.sleep(3)

    def set_cursor(self, col, line):
        addr = col & 0x3F
        if line & 1:
            addr += 0x40
        if line & 2:
            addr += 0x14
        self.write_command(self.LCD_DDRAM | addr)

    def print(self, string):
        for char in string:
            self.write_data(ord(char))

    def custom_char(self, location, charmap):
        self.write_command(self.LCD_CGRAM | ((location & 7) << 3))
        self.sleep(5)
        for i in range(8):
            self.write_data(charmap[i])
        self.home()

    def print_custom_char(self, location):
        self.write_data(location)

    def sleep(self, time_ms):
        sleep_ms(time_ms)
