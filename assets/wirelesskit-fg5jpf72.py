from micropython import const
from machine import Pin, ADC, PWM, I2C
from dht import DHT11
import machine
import time

ECHO_TIMEOUT_US = const(200000)

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
I2C_PORT = const((21, 22))
I2C_KEY = "I2C"

# 已使用（初始化）的端口
ports = {}


class X16k33:
    DEFAULT_I2C_ADDRESS = const(0x70)

    BLINK_OFF = const(0)
    BLINK_RATE_2_HZ = const(1)
    BLINK_RATE_1_HZ = const(2)
    BLINK_RATE_HALF_HZ = const(3)

    DISPLAY_ON = const(0x81)
    DISPLAY_OFF = const(0x80)
    SYSTEM_ON = const(0x21)
    SYSTEM_OFF = const(0x20)
    DISPLAY_ADDRESS = const(0x00)
    CMD_BRIGHTNESS = const(0xE0)
    CMD_BLINK = const(0x81)

    DIGIT_NUMBER = const(4)

    NUMBER_TABLE = const(
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

    def __init__(self, port, addr=DEFAULT_I2C_ADDRESS, colon_position=-1):
        self.i2c = I2C(0, sda=Pin(port[0]), scl=Pin(port[1]))
        self.addr = addr
        self.colon_position = colon_position
        self.data = bytearray(16)
        self.clear()
        self.power_on()

    def blink_rate(self, blink_rate):
        self.i2c.writeto(self.addr, bytes([X16k33.CMD_BLINK | (blink_rate << 1)]))

    def brightness(self, brightness):
        self.i2c.writeto(self.addr, bytes([X16k33.CMD_BRIGHTNESS | brightness]))

    def power_on(self):
        self.i2c.writeto(self.addr, bytes([X16k33.SYSTEM_ON]))
        self.i2c.writeto(self.addr, bytes([X16k33.DISPLAY_ON]))

    def power_off(self):
        self.i2c.writeto(self.addr, bytes([X16k33.DISPLAY_OFF]))
        self.i2c.writeto(self.addr, bytes([X16k33.SYSTEM_OFF]))

    def clear(self):
        for i in range(len(self.data)):
            self.data[i] = 0x00
        self.i2c.writeto(self.addr, bytes([X16k33.DISPLAY_ADDRESS]) + self.data)

    def __setitem__(self, position, value):
        self.data[position] = value

    def write(self):
        self.i2c.writeto(self.addr, bytearray([X16k33.DISPLAY_ADDRESS]) + self.data)

    def show_colon(self, show):
        if self.colon_position < 0:
            return
        self[self.colon_position << 1] = 0xFF if show else 0x00
        self.write()

    def show_digit_number(self, position, number, dot=False):
        self[self.digit_buffer_position(position)] = X16k33.NUMBER_TABLE[number] | (
            dot << 7
        )
        self.write()

    def show_number(self, number, base=10, fractional_part_digits=2):
        if not isinstance(number, (int, float)):
            raise TypeError("number be of type int or float")

        if base != 10:
            fractional_part_digits = 0

        if isinstance(number, (int)):
            fractional_part_digits = 0

        numeric_digits = X16k33.DIGIT_NUMBER

        is_negative = False

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
            self.show_error()
            return

        position = X16k33.DIGIT_NUMBER - 1

        index = 0
        while (
            index <= fractional_part_digits
            or display_number > 0
            or position == X16k33.DIGIT_NUMBER - 1
        ):
            display_decimal = (
                fractional_part_digits != 0 and index == fractional_part_digits
            )
            self[self.digit_buffer_position(position)] = X16k33.NUMBER_TABLE[
                int(display_number % base)
            ] | (display_decimal << 7)
            position -= 1
            display_number = int(display_number / base)
            index += 1

        if is_negative:
            self[self.digit_buffer_position(position)] = 0x40
            position -= 1

        while position >= 0:
            self[self.digit_buffer_position(position)] = 0x00
            position -= 1
        self.write()

    def show_error(self):
        for i in range(4):
            self[self.digit_buffer_position(i)] = 0x40
        self.write()

    def digit_buffer_position(self, digit_position):
        return (
            digit_position
            if self.colon_position < 0 or digit_position < self.colon_position
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
    duration = machine.time_pulse_us(echo, 1, ECHO_TIMEOUT_US)
    if duration < 0:
        return 0
    # 换算cm
    distance = duration / 2 / 29.1
    return float("%.2f" % distance)


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


def set_segment_digit(pos, digit):
    segment = ports.get(I2C_KEY)
    if not segment:
        segment = X16k33(I2C_PORT, colon_position=2)
        ports.setdefault(I2C_KEY, segment)
    segment.show_digit_number(pos, digit)


def set_segment_number(number):
    segment = ports.get(I2C_KEY)
    if not segment:
        segment = X16k33(I2C_PORT, colon_position=2)
        ports.setdefault(I2C_KEY, segment)
    segment.show_number(number)


def set_segment_colon(state):
    segment = ports.get(I2C_KEY)
    if not segment:
        segment = X16k33(I2C_PORT, colon_position=2)
        ports.setdefault(I2C_KEY, segment)
    if state == "on" or state == "1" or state == 1:
        segment.show_colon(True)
    else:
        segment.show_colon(False)


def clear_segment():
    segment = ports.get(I2C_KEY)
    if not segment:
        segment = X16k33(I2C_PORT, colon_position=2)
        ports.setdefault(I2C_KEY, segment)
    segment.clear()
