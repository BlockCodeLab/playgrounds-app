from micropython import const
from machine import Pin, ADC

MAX_ADC_VALUE = const(4095)

pins = {}


def set_led(pin, state):
    out = pins.get(pin)
    if not out:
        out = Pin(pin, Pin.OUT)
        pins.setdefault(pin, out)
    if state == "on" or state == "1" or state == 1:
        out.on()
    else:
        out.off()


def toggle_led(pin):
    out = pins.get(pin)
    if not out:
        out = Pin(pin, Pin.OUT)
        pins.setdefault(pin, out)
    out.value(not out.value())


def is_led_on(pin):
    out = pins.get(pin)
    if not out:
        out = Pin(pin, Pin.OUT)
        pins.setdefault(pin, out)
    return out.value() == 1


def get_brightness(pin):
    adc = pins.get(pin)
    if not adc:
        adc = ADC(Pin(pin))
        pins.setdefault(pin, adc)
    adc.atten(ADC.ATTN_11DB)
    value = adc.read() * 1000 // MAX_ADC_VALUE
    return min(max(value, 0), 100)
