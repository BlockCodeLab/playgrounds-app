from micropython import const
from machine import Pin, ADC, PWM, I2C
from dht import DHT11
from x16k33 import X16k33
import machine
import time

I2C_PORT = const((21, 22))
I2C_KEY = "I2C"

PORTS = {
    "M1": const((14, 15)),
    "M2": const((17, 16)),
    "P1": const((5,)),
    "P2": const((2,)),
    "P3": const((39,)),
    "P4": const((36,)),
    "P5": const((35,)),
    "P6": const((34,)),
    "P7": const((25,)),
    "P8": const((26,)),
    "P9": const((15, 14)),
    "P10": const((13, 12)),
    "P11": const((36, 18)),
    "P12": const((39, 19)),
    "P13": const((27, 26, 25)),
    "P14": const((33, 32, 23)),
    "P15": const((17, 16, 15, 14)),
}

# 已使用（初始化）的端口
ports = {}


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


def set_led(port, state):
    led = ports.get(port)
    if not led:
        led = Pin(PORTS[port][0], Pin.OUT)
        ports.setdefault(port, led)
    if state == "on" or state == "1" or state == 1:
        led.on()
    else:
        led.off()


def toggle_led(port):
    led = ports.get(port)
    if not led:
        led = Pin(PORTS[port][0], Pin.OUT)
        ports.setdefault(port, led)
    led.value(not led.value())


def set_buzzer(port, state):
    set_led(port, state)


def set_motor(port, dir=1, speed=0):
    motor = ports.get(port)
    if not motor:
        motor = (
            PWM(Pin(PORTS[port][0]), freq=1000),
            PWM(Pin(PORTS[port][1]), freq=1000),
        )
        ports.setdefault(port, motor)
    duty = min(max(0, speed), 100) * 1023 // 100
    if dir == "-1" or dir == -1:
        motor[0].duty(0)
        motor[1].duty(duty)
    else:
        motor[0].duty(duty)
        motor[1].duty(0)


def is_keypressed(port):
    key = ports.get(port)
    if not key:
        key = Pin(PORTS[port][0], Pin.IN)
        ports.setdefault(port, key)
    return key.value() == 0


def is_sound(port):
    mic = ports.get(port)
    if not mic:
        mic = [ADC(Pin(PORTS[port][0])), Pin(PORTS[port][1], Pin.IN)]
        ports.setdefault(port, mic)
    return bool(mic[1].value() == 0)


def get_sound(port):
    mic = ports.get(port)
    if not mic:
        mic = [ADC(Pin(PORTS[port][0])), Pin(PORTS[port][1], Pin.IN)]
        ports.setdefault(port, mic)
    return mic[0].read_u16()


def get_potentiometer(port):
    adc = ports.get(port)
    if not adc:
        adc = ADC(Pin(PORTS[port][0]), atten=ADC.ATTN_11DB)
        ports.setdefault(port, adc)
    value = adc.read() * 100 // 4095
    return min(max(0, value), 100)


def get_photosensitive(port):
    adc = ports.get(port)
    if not adc:
        adc = ADC(Pin(PORTS[port][0]), atten=ADC.ATTN_11DB)
        ports.setdefault(port, adc)
    value = adc.read() * 1000 // 4095
    return min(max(0, value), 1000)


def get_distance(port):
    echo = ports.get(port)
    if not echo:
        echo = Pin(PORTS[port][0])
        ports.setdefault(port, echo)
    # 发射
    echo.init(Pin.OUT)
    echo.value(0)
    time.sleep_us(5)
    echo.value(1)
    time.sleep_us(10)
    echo.value(0)
    # 接收
    echo.init(Pin.IN)
    duration = machine.time_pulse_us(echo, 1, 200000)
    if duration < 0:
        return 0
    # 换算cm
    distance = duration / 2 / 29.1
    return float("%.2f" % distance)


# dht11
def get_temperature(port):
    dht = ports.get(port)
    if not dht:
        dht = DHT11(Pin(PORTS[port][0]))
        ports.setdefault(port, dht)
    dht.measure()
    return dht.temperature()


def get_humidity(port):
    dht = ports.get(port)
    if not dht:
        dht = DHT11(Pin(PORTS[port][0]))
        ports.setdefault(port, dht)
    dht.measure()
    return dht.humidity()


# 4-digit 7-segment
def set_segment_digit(pos, digit):
    segment = ports.get(I2C_KEY)
    if not segment:
        segment = X16k33FourDigitLed(I2C_PORT, colon_position=2)
        ports.setdefault(I2C_KEY, segment)
    segment.show_digit_number(pos, digit)


def set_segment_number(number):
    segment = ports.get(I2C_KEY)
    if not segment:
        segment = X16k33FourDigitLed(I2C_PORT, colon_position=2)
        ports.setdefault(I2C_KEY, segment)
    segment.show_number(number)


def set_segment_colon(state):
    segment = ports.get(I2C_KEY)
    if not segment:
        segment = X16k33FourDigitLed(I2C_PORT, colon_position=2)
        ports.setdefault(I2C_KEY, segment)
    if state == "on" or state == "1" or state == 1:
        segment.show_colon(True)
    else:
        segment.show_colon(False)


def clear_segment():
    segment = ports.get(I2C_KEY)
    if not segment:
        segment = X16k33FourDigitLed(I2C_PORT, colon_position=2)
        ports.setdefault(I2C_KEY, segment)
    segment.clear()


# oled
def draw_line():
    pass


def draw_circle():
    pass


def draw_triangle():
    pass


def draw_rectangle():
    pass


def draw_text():
    pass


def clear_oled():
    pass
