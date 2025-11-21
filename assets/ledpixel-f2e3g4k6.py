import asyncio
from random import randint

from machine import Pin
from micropython import const
from neopixel import NeoPixel

_DEFAULT_GAMMA = const(1.8)


class LedPixel(NeoPixel):
    NO_EFFECT = const(0)
    RAINBOW_CYCLE = const(1)
    CHASE = const(2)
    TWINKLE = const(3)
    SPARKLE = const(4)
    BREATHING = const(5)
    SCANNER = const(6)
    WATERFALL = const(7)
    WHIRLPOOL = const(8)
    LIGHT_SPOT = const(9)
    LIGHT_WHEEL = const(10)

    def __init__(self, pin, num_pixels):
        super().__init__(Pin(pin, Pin.OUT), num_pixels)
        self.set_gamma(_DEFAULT_GAMMA)
        self._last_effect = LedPixel.NO_EFFECT
        self._last_leds = []

    def clear(self):
        self.fill((0, 0, 0))
        self.write()

    def set_gamma(self, gamma):
        self._gamma_table = bytearray(256)
        for i in range(256):
            self._gamma_table[i] = int(pow(i / 255.0, gamma) * 255.0 + 0.5)

    def wheel(self, pos):
        pos = pos % 256
        sector = pos / 255.0 * 6  # 分成6个60度扇区

        if sector < 1:
            return (255, int(sector * 255), 0)
        elif sector < 2:
            return (int((2 - sector) * 255), 255, 0)
        elif sector < 3:
            return (0, 255, int((sector - 2) * 255))
        elif sector < 4:
            return (0, int((4 - sector) * 255), 255)
        elif sector < 5:
            return (int((sector - 4) * 255), 0, 255)
        else:
            return (255, 0, int((6 - sector) * 255))

    def set_led(self, index, brightness, color):
        r, g, b = color
        brightness = max(0, min(brightness, 10)) / 10
        r = self._gamma_table[round(r * brightness)]
        g = self._gamma_table[round(g * brightness)]
        b = self._gamma_table[round(b * brightness)]
        self[index] = (r, g, b)

    async def rainbow_cycle(self):
        self._last_effect = LedPixel.RAINBOW_CYCLE

        num_pixels = len(self)
        steps = 255 // num_pixels
        for i in range(num_pixels):
            for j in range(num_pixels):
                color = self.wheel(j * steps)
                n = i + j
                if n >= num_pixels:
                    n -= num_pixels
                self.set_led(n, 10, color)
            self.write()
            await asyncio.sleep_ms(100)

    async def chase(self, color=None):
        if not color:
            color = self.wheel(randint(0, 255))
        self._last_effect = LedPixel.CHASE

        num_pixels = len(self)
        for i in range(5):
            for j in range(2):
                self.fill((0, 0, 0))
                for n in range(j, num_pixels, 2):
                    self.set_led(n, 10, color)
                self.write()
                await asyncio.sleep_ms(150)

    async def twinkle(self, color=None):
        if not color:
            color = self.wheel(randint(0, 255))
        self._last_effect = LedPixel.TWINKLE

        num_pixels = len(self)
        for i in range(2):
            for n in range(num_pixels):
                self.set_led(n, 10, color)
            self.write()
            await asyncio.sleep_ms(300)
            self.fill((0, 0, 0))
            self.write()
            await asyncio.sleep_ms(200)

    async def sparkle(self, color=None):
        if not color:
            color = self.wheel(randint(0, 255))
        num_pixels = len(self)

        is_loop = self._last_effect == LedPixel.SPARKLE
        if not is_loop:
            self._last_effect = LedPixel.SPARKLE
            self._last_leds = []
            self.fill((0, 0, 0))

        led_index = 0
        for i in range(5):
            leds = []
            led_index = randint(led_index, led_index + 4)
            while led_index < num_pixels:
                if led_index not in self._last_leds:  # 避免两次闪烁同一个灯
                    leds.append(led_index)
                    led_index += 2  # 避免连续
                led_index = randint(led_index, led_index + 4)
            self._last_leds = leds
            led_index = 0

            for n in leds:
                self.set_led(n, 10, color)
            self.write()
            await asyncio.sleep_ms(50)

            for n in leds:
                self.set_led(n, 8, color)
            self.write()
            await asyncio.sleep_ms(20)

            for n in leds:
                self.set_led(n, 5, color)
            self.write()
            await asyncio.sleep_ms(20)

            self.fill((0, 0, 0))
            self.write()
            await asyncio.sleep_ms(10)

    async def breathing(self, color=None):
        if not color:
            color = self.wheel(randint(0, 255))
        self._last_effect = LedPixel.BREATHING

        num_pixels = len(self)
        for i in range(10):
            for n in range(num_pixels):
                self.set_led(n, i, color)
            self.write()
            await asyncio.sleep_ms(100)

        for i in range(10):
            for n in range(num_pixels):
                self.set_led(n, 9 - i, color)
            self.write()
            await asyncio.sleep_ms(100)

    async def scanner(self, color=None):
        if not color:
            color = self.wheel(randint(0, 255))
        self._last_effect = LedPixel.SCANNER
        self.fill((0, 0, 0))

        num_pixels = len(self)
        for i in range(num_pixels + 5):
            for n in range(i + 1):
                if n < num_pixels:
                    brightness = 10 - (i - n) * 2
                    self.set_led(n, brightness, color)
                else:
                    self.set_led(num_pixels - 1, 10, color)
            self.write()
            await asyncio.sleep_ms(100)

        for i in range(num_pixels + 5):
            for n in range(i + 1):
                if n < num_pixels:
                    brightness = 10 - (i - n) * 2
                    self.set_led(num_pixels - n - 1, brightness, color)
                else:
                    self.set_led(0, 10, color)
            self.write()
            await asyncio.sleep_ms(100)

    async def waterfall(self, color=None):
        if not color:
            color = self.wheel(randint(0, 255))
        self._last_effect = LedPixel.WATERFALL
        self.fill((0, 0, 0))

        num_pixels = len(self)
        for i in range(num_pixels + 5):
            for n in range(i + 1):
                if n < num_pixels:
                    brightness = 10 - (i - n) * 2
                    self.set_led(n, brightness, color)
            self.write()
            await asyncio.sleep_ms(100)

    async def whirlpool(self, color=None):
        if not color:
            color = self.wheel(randint(0, 255))
        is_loop = self._last_effect == LedPixel.WHIRLPOOL
        if not is_loop:
            self._last_effect = LedPixel.WHIRLPOOL
            self.fill((0, 0, 0))

        num_pixels = len(self)
        start_index = 5 if is_loop else 0
        for i in range(start_index, num_pixels + 5):
            for n in range(i + 1):
                brightness = 10 - (i - n) * 2
                if n >= num_pixels:
                    n -= num_pixels
                self.set_led(n, brightness, color)
            self.write()
            await asyncio.sleep_ms(100)

    async def light_spot(self, color=None):
        if not color:
            color = self.wheel(randint(0, 255))
        self._last_effect = LedPixel.LIGHT_SPOT

        num_pixels = len(self)
        for i in range(num_pixels):
            self.fill((0, 0, 0))
            self.set_led(i, 10, color)
            self.write()
            await asyncio.sleep_ms(100)

    async def light_wheel(self, color=None):
        if not color:
            color = self.wheel(randint(0, 255))
        self._last_effect = LedPixel.LIGHT_WHEEL

        num_pixels = len(self)
        for i in range(num_pixels):
            self.fill(color)
            self.set_led(i, 10, (0, 0, 0))
            self.write()
            await asyncio.sleep_ms(100)
