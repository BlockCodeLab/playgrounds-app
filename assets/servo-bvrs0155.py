from micropython import const
from machine import Pin, PWM

FREQ = const(50)
U16BIT = const(65535)
MIN_US = const(500)
MAX_US = const(2500)
STOP_US = const(1500)

pins = {}


def write_us(pin, us):
    pwm = pins.get(pin)
    if not pwm:
        pwm = PWM(Pin(pin), freq=FREQ)
        pins.setdefault(pin, pwm)
    if us == 0:
        pwm.duty_u16(0)
        return
    us = min(MAX_US, max(MIN_US, us))
    duty = us * U16BIT * FREQ / 1000000
    pwm.duty_u16(int(duty))


def set_angle(pin, degrees=0, angle=180):
    degrees = max(0, min(degrees, angle))
    total_range = MAX_US - MIN_US
    us = MIN_US + total_range * degrees / angle
    write_us(pin, us)


def set_motor(pin, speed=0):
    if speed > 0:
        write_us(pin, MIN_US)
    elif speed < 0:
        write_us(pin, MAX_US)
    else:
        write_us(pin, STOP_US)
