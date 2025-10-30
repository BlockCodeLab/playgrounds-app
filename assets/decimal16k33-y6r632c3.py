from machine import Pin, I2C
from micropython import const
from x16k33 import X16k33


def get_decimal_places(num):
    num_str = f"{float(num):.4f}"  # 精度 4 位小数
    num_str = num_str.rstrip("0")  # 去除末尾的0
    if "." in num_str:
        decimal_part = num_str.split(".")[1]
        return len(decimal_part) if decimal_part else 0
    return 0


class Decimal(X16k33):
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
    _COLON_POSITION: int = const(2)

    def __init__(self, scl, sda) -> None:
        """Construct four digit LED instance

        Parameters:
        scl: I2C scl
        sda: I2C sda
        """
        super().__init__(I2C(1, scl=Pin(scl), sda=Pin(sda)))
        self.brightness(8)

    def show_colon(self, show: bool) -> None:
        """Display/hide colon at configured position

        Parameters:
        show: True to show colon, False to hide
        """
        self[Decimal._COLON_POSITION << 1] = 0xFF if show else 0x00
        self.write()

    def show_digit_number(self, position: int, number: int, dot: bool = False) -> None:
        """Display digit value at given position

        Parameters:
        position: Digit position 0-3
        number: Digit value, 0-F
        dot: Show decimal point (default False)
        """
        self[self._digit_buffer_position(position)] = Decimal._NUMBER_TABLE[number] | (
            dot << 7
        )
        self.write()

    def show_number(
        self,
        number: (int, float),
        base: int = 10,
        fractional_part_digits: int = -1,
        colon: bool = False,
    ) -> None:
        """Display integer/float number

        Parameters:
        number: Number to display
        base: Number base (default decimal)
        fractional_part_digits: Fractional part digits (default -1: auto)
        """
        if not isinstance(number, (int, float)):
            raise TypeError("number be of type int or float")

        if isinstance(number, (int)):
            fractional_part_digits = 0
        elif fractional_part_digits < 0:
            fractional_part_digits = get_decimal_places(number)

        if base != 10:
            fractional_part_digits = 0

        numeric_digits = Decimal._DIGIT_NUMBER

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

        position = Decimal._DIGIT_NUMBER - 1

        index = 0
        while (
            index <= fractional_part_digits
            or display_number > 0
            or position == Decimal._DIGIT_NUMBER - 1
        ):
            display_decimal = (
                fractional_part_digits != 0 and index == fractional_part_digits
            )
            self[self._digit_buffer_position(position)] = Decimal._NUMBER_TABLE[
                int(display_number % base)
            ] | (display_decimal << 7)
            position -= 1
            display_number = int(display_number / base)
            index += 1

        if is_negative:
            self[self._digit_buffer_position(position)] = 0x40
            position -= 1

        while position >= 0:
            self[self._digit_buffer_position(position)] = 0x00
            position -= 1

        self.show_colon(colon)

    def show_time(self, hour: int, minute: int) -> None:
        hour = min(max(0, hour), 99)
        minute = min(max(0, minute), 99)
        num = hour * 100 + minute
        self.show_number(num, fractional_part_digits=0, colon=True)
        if hour < 10:
            self.show_digit_number(0, 0)
        if hour < 1:
            self.show_digit_number(1, 0)
        if minute < 10:
            self.show_digit_number(2, 0)

    def _show_error(self) -> None:
        for i in range(Decimal._DIGIT_NUMBER):
            self[self._digit_buffer_position(i)] = 0x40
        self.write()

    def _digit_buffer_position(self, digit_position) -> int:
        return (
            digit_position
            if Decimal._COLON_POSITION < 0 or digit_position < Decimal._COLON_POSITION
            else digit_position + 1
        ) << 1
