from micropython import const
from machine import Pin, ADC, PWM
from dht import DHT11
import machine
import time

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
    "I2C": const((21, 22)),
}

# 已使用（初始化）的端口
ports = {}


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
