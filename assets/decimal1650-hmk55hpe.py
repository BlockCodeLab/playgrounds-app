from machine import Pin, I2C
from micropython import const
from tm1650 import TM1650


def get_decimal_places(num):
    num_str = f"{float(num):.4f}"  # 精度 4 位小数
    num_str = num_str.rstrip("0")  # 去除末尾的0
    if "." in num_str:
        decimal_part = num_str.split(".")[1]
        return len(decimal_part) if decimal_part else 0
    return 0


class Decimal(TM1650):
    """Class for controlling four digit seven segment LED modules based on TM1650 LED driver"""

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

    def __init__(self, scl, sda) -> None:
        """Construct four digit LED instance

        Parameters:
        scl: I2C scl
        sda: I2C sda
        """
        super().__init__(I2C(1, scl=Pin(scl), sda=Pin(sda)))

    def show_digit_number(self, position: int, number: int, dot: bool = False) -> None:
        """Display digit value at given position

        Parameters:
        position: Digit position 0-3
        number: Digit value, 0-F
        dot: Show decimal point (default False)
        """
        self[position] = Decimal._NUMBER_TABLE[number] | (dot << 7)
        self.write()

    def show_number(
        self, number: (int, float), base: int = 10, fractional_part_digits: int = -1
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

        numeric_digits = 4

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

        position = 3

        index = 0
        while index <= fractional_part_digits or display_number > 0 or position == 3:
            display_decimal = (
                fractional_part_digits != 0 and index == fractional_part_digits
            )
            self[position] = Decimal._NUMBER_TABLE[int(display_number % base)] | (
                display_decimal << 7
            )
            position -= 1
            display_number = int(display_number / base)
            index += 1

        if is_negative:
            self[position] = 0x40
            position -= 1

        while position >= 0:
            self[position] = 0x00
            position -= 1

        self.write()

    def _show_error(self) -> None:
        for i in range(4):
            self[i] = 0x40
        self.write()
