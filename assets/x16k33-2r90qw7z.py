from micropython import const


class X16k33:
    DEFAULT_I2C_ADDRESS: int = const(0x70)

    BLINK_OFF: int = const(0)
    BLINK_RATE_2_HZ: int = const(1)
    BLINK_RATE_1_HZ: int = const(2)
    BLINK_RATE_HALF_HZ: int = const(3)

    _DISPLAY_ON: int = const(0x81)
    _DISPLAY_OFF: int = const(0x80)
    _SYSTEM_ON: int = const(0x21)
    _SYSTEM_OFF: int = const(0x20)
    _DISPLAY_ADDRESS: int = const(0x00)
    _CMD_BRIGHTNESS: int = const(0xE0)
    _CMD_BLINK: int = const(0x81)

    def __init__(self, i2c, i2c_address: int = DEFAULT_I2C_ADDRESS) -> None:
        """
        Construct X16k33 class with given I2C bus and optional custom I2C address

        Parameters:
            i2c: I2C bus
            i2c_address: I2C address, defaults to 0x70
        """
        self._i2c = i2c
        self._i2c_address = i2c_address
        self._data = bytearray(16)
        self.clear()
        self.power_on()

    def blink_rate(self, blink_rate: int) -> None:
        """
        Set blink rate for display

        Parameters:
            blink_rate: Blink rate value, use BLINK_OFF, BLINK_RATE_2_HZ,
                        BLINK_RATE_1_HZ, BLINK_RATE_HALF_HZ
        """
        self._i2c.writeto(
            self._i2c_address, bytes([X16k33._CMD_BLINK | (blink_rate << 1)])
        )

    def brightness(self, brightness: int) -> None:
        """
        Set brightness for display

        Parameters:
            brightness: Brightness value from 0-15
        """
        self._i2c.writeto(
            self._i2c_address, bytes([X16k33._CMD_BRIGHTNESS | brightness])
        )

    def power_on(self) -> None:
        """Turn on system and display power"""
        self._i2c.writeto(self._i2c_address, bytes([X16k33._SYSTEM_ON]))
        self._i2c.writeto(self._i2c_address, bytes([X16k33._DISPLAY_ON]))

    def power_off(self) -> None:
        """Turn off display power and system power"""
        self._i2c.writeto(self._i2c_address, bytes([X16k33._DISPLAY_OFF]))
        self._i2c.writeto(self._i2c_address, bytes([X16k33._SYSTEM_OFF]))

    def clear(self) -> None:
        """Clear display buffer"""
        for i in range(len(self._data)):
            self._data[i] = 0x00
        self._i2c.writeto(
            self._i2c_address, bytes([X16k33._DISPLAY_ADDRESS]) + self._data
        )

    def __setitem__(self, position: int, value: int) -> None:
        """
        Set display buffer value at given position

        Parameters:
            position: Position in buffer
            value: Value to set
        """
        self._data[position] = value

    def write(self) -> None:
        """Update display with buffer contents"""
        self._i2c.writeto(
            self._i2c_address, bytearray([X16k33._DISPLAY_ADDRESS]) + self._data
        )


class X16k33FourDigitLed(X16k33):
    """Class for controlling four digit seven segment LED modules based on X16k33 LED driver"""

    _NUMBER_TABLE: tuple = const(
        (
            0x3F,  # 0
            0x06,  # 1
            0x5B,  # 2
            0x4F,  # 3
            0x66,  # 4
            0x6D,  # 5
            0x7D,  # 6
            0x07,  # 7
            0x7F,  # 8
            0x6F,  # 9
            0x77,  # A
            0x7C,  # b
            0x39,  # C
            0x5E,  # d
            0x79,  # e
            0x71,  # F
        )
    )

    _DIGIT_NUMBER: int = const(4)
    """Total number of digits in LED module"""

    def __init__(self, port, colon_position: int = -1) -> None:
        """Construct four digit LED instance

        Parameters:
        port: I2C port
        colon_position: Position of colon, -1 to disable (default -1)
        """
        super().__init__(I2C(0, sda=Pin(port[0]), scl=Pin(port[1])))
        self._colon_position = colon_position

    def show_colon(self, show: bool) -> None:
        """Display/hide colon at configured position

        Parameters:
        show: True to show colon, False to hide
        """
        if self._colon_position < 0:
            return

        self[self._colon_position << 1] = 0xFF if show else 0x00
        self.write()

    def show_digit_number(self, position: int, number: int, dot: bool = False) -> None:
        """Display digit value at given position

        Parameters:
        position: Digit position 0-3
        number: Digit value, 0-F
        dot: Show decimal point (default False)
        """
        self[self._digit_buffer_position(position)] = X16k33FourDigitLed._NUMBER_TABLE[
            number
        ] | (dot << 7)
        self.write()

    def show_number(
        self, number: (int, float), base: int = 10, fractional_part_digits: int = 2
    ) -> None:
        """Display integer/float number

        Parameters:
        number: Number to display
        base: Number base (default decimal)
        fractional_part_digits: Fractional part digits (default 2)
        """
        if not isinstance(number, (int, float)):
            raise TypeError("number be of type int or float")

        if base != 10:
            fractional_part_digits = 0

        if isinstance(number, (int)):
            fractional_part_digits = 0

        numeric_digits = X16k33FourDigitLed._DIGIT_NUMBER

        is_negative: bool = False

        if number < 0:
            numeric_digits -= 1
            number = -number
            is_negative = True

        limit_value = 1
        for i in range(numeric_digits):
            limit_value *= base

        to_int_factor = 1.0
        for i in range(fractional_part_digits):
            to_int_factor *= base

        display_number = int(number * to_int_factor + 0.5)
        while display_number >= limit_value:
            fractional_part_digits -= 1
            to_int_factor /= base
            display_number = int(number * to_int_factor + 0.5)

        if to_int_factor < 1:
            self._show_error()
            return

        position = X16k33FourDigitLed._DIGIT_NUMBER - 1

        index = 0
        while (
            index <= fractional_part_digits
            or display_number > 0
            or position == X16k33FourDigitLed._DIGIT_NUMBER - 1
        ):
            display_decimal = (
                fractional_part_digits != 0 and index == fractional_part_digits
            )
            self[self._digit_buffer_position(position)] = (
                X16k33FourDigitLed._NUMBER_TABLE[int(display_number % base)]
                | (display_decimal << 7)
            )
            position -= 1
            display_number = int(display_number / base)
            index += 1

        if is_negative:
            self[self._digit_buffer_position(position)] = 0x40
            position -= 1

        while position >= 0:
            self[self._digit_buffer_position(position)] = 0x00
            position -= 1

        self.write()

    def _show_error(self) -> None:
        for i in range(4):
            self[self._digit_buffer_position(i)] = 0x40
        self.write()

    def _digit_buffer_position(self, digit_position) -> int:
        return (
            digit_position
            if self._colon_position < 0 or digit_position < self._colon_position
            else digit_position + 1
        ) << 1
