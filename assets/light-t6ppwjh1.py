from machine import Pin, ADC

# 已在使用的 pins
pins = {}


# 设置灯光状态
def set_led(pin, state):
    out = pins.get(pin)
    if not out:
        out = Pin(pin, Pin.OUT)
        pins.setdefault(pin, out)
    if state == "on" or state == "1" or state == 1:
        out.on()
    else:
        out.off()


# 切换灯管状态
def toggle_led(pin):
    out = pins.get(pin)
    if not out:
        out = Pin(pin, Pin.OUT)
        pins.setdefault(pin, out)
    out.value(not out.value())


# 灯光是否开启
def is_led_on(pin):
    out = pins.get(pin)
    if not out:
        out = Pin(pin, Pin.OUT)
        pins.setdefault(pin, out)
    return out.value() == 1


# 获得环境光强度
def get_brightness(pin):
    adc = pins.get(pin)
    if not adc:
        adc = ADC(Pin(pin), atten=ADC.ATTN_11DB)
        pins.setdefault(pin, adc)
    value = adc.read() * 1000 // 4095
    return min(max(0, value), 1000)
