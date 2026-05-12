import asyncio
from random import randint

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
        super().__init__(pin, num_pixels)
        self.set_gamma(_DEFAULT_GAMMA)
        self._last_effect = LedPixel.NO_EFFECT
        self._frame_states = {}

    def _clear_frame_state(self, effect_key):
        if effect_key in self._frame_states:
            del self._frame_states[effect_key]

    def clear(self):
        self.fill((0, 0, 0))
        self.write()

    def clear_leds(self, start, end):
        self.set_leds(start, end, 100, (0, 0, 0))
        self.write()

    def set_gamma(self, gamma):
        self._gamma_table = bytearray(256)
        for i in range(256):
            self._gamma_table[i] = int(pow(i / 255.0, gamma) * 255.0 + 0.5)

    @staticmethod
    def hsv_to_rgb(hue, sat=1.0, val=1.0):
        if sat == 0.0:
            return (int(val * 255), int(val * 255), int(val * 255))
        h = hue * 6.0
        i = int(h)
        f = h - i
        p = val * (1.0 - sat)
        q = val * (1.0 - sat * f)
        t = val * (1.0 - sat * (1.0 - f))
        if i == 0:
            r, g, b = val, t, p
        elif i == 1:
            r, g, b = q, val, p
        elif i == 2:
            r, g, b = p, val, t
        elif i == 3:
            r, g, b = p, q, val
        elif i == 4:
            r, g, b = t, p, val
        else:
            r, g, b = val, p, q
        return (int(r * 255), int(g * 255), int(b * 255))

    def wheel(self, pos):
        hue = (pos % 256) / 255.0
        return self.hsv_to_rgb(hue, 1.0, 1.0)

    def set_led(self, index, brightness, color):
        r, g, b = color
        brightness = max(0, min(brightness, 100)) / 100
        r = self._gamma_table[round(r * brightness)]
        g = self._gamma_table[round(g * brightness)]
        b = self._gamma_table[round(b * brightness)]
        self[index] = (r, g, b)

    def set_leds(self, start, end, brightness, color):
        for i in range(start, end + 1):
            self.set_led(i, brightness, color)

    # ==================== 特效实现 ====================

    async def rainbow_cycle(self, frame=False):
        self._last_effect = LedPixel.RAINBOW_CYCLE
        num_pixels = len(self)
        steps = 255 // num_pixels

        if frame:
            key = LedPixel.RAINBOW_CYCLE
            state = self._frame_states.get(key)
            if state is None:
                state = {"offset": 0}
                self._frame_states[key] = state

            offset = state["offset"]
            for j in range(num_pixels):
                color = self.wheel(j * steps)
                n = (offset + j) % num_pixels
                self.set_led(n, 80, color)
            self.write()

            offset = (offset + 1) % num_pixels
            state["offset"] = offset
            return

        # 完整动画：复用逐帧模式
        self._clear_frame_state(LedPixel.RAINBOW_CYCLE)
        for _ in range(num_pixels):
            await self.rainbow_cycle(frame=True)
            await asyncio.sleep_ms(100)

    async def chase(self, color=None, frame=False):
        self._last_effect = LedPixel.CHASE

        if frame:
            key = LedPixel.CHASE
            state = self._frame_states.get(key)
            if state is None:
                state = {
                    "i": 0,
                    "j": 0,
                    "color": self.wheel(randint(0, 255)) if color is None else color,
                }
                self._frame_states[key] = state

            cur_color = state["color"] if color is None else color
            i, j = state["i"], state["j"]
            self.fill((0, 0, 0))
            for n in range(j, len(self), 2):
                self.set_led(n, 80, cur_color)
            self.write()

            j += 1
            if j >= 2:
                j = 0
                i += 1
                if i >= 5:
                    i = 0
                    if color is None:
                        state["color"] = self.wheel(randint(0, 255))
            state["i"], state["j"] = i, j
            return

        # 完整动画：复用逐帧模式（共10帧）
        self._clear_frame_state(LedPixel.CHASE)
        for _ in range(10):
            await self.chase(color=color, frame=True)
            await asyncio.sleep_ms(150)

    async def twinkle(self, color=None, frame=False):
        self._last_effect = LedPixel.TWINKLE

        if frame:
            key = LedPixel.TWINKLE
            state = self._frame_states.get(key)
            if state is None:
                state = {
                    "step": 0,
                    "color": self.wheel(randint(0, 255)) if color is None else color,
                }
                self._frame_states[key] = state

            cur_color = state["color"] if color is None else color
            step = state["step"]

            if step % 2 == 0:
                for n in range(len(self)):
                    self.set_led(n, 80, cur_color)
            else:
                self.fill((0, 0, 0))
            self.write()

            step += 1
            if step >= 4:
                step = 0
                if color is None:
                    state["color"] = self.wheel(randint(0, 255))
            state["step"] = step
            return

        # 完整动画：复用逐帧模式（共4帧，延时交替）
        self._clear_frame_state(LedPixel.TWINKLE)
        delays = [300, 200, 300, 200]  # 亮、灭、亮、灭
        for delay in delays:
            await self.twinkle(color=color, frame=True)
            await asyncio.sleep_ms(delay)

    async def sparkle(self, color=None, frame=False):
        num_pixels = len(self)

        if frame:
            key = LedPixel.SPARKLE
            state = self._frame_states.get(key)
            if state is None:
                state = {
                    "i": 0,
                    "sub": 0,
                    "leds": [],
                    "color": self.wheel(randint(0, 255)) if color is None else color,
                }
                self._frame_states[key] = state

            cur_color = state["color"] if color is None else color
            i, sub, leds = state["i"], state["sub"], state["leds"]

            if sub == 0:
                leds = []
                led_index = randint(0, 4)
                while led_index < num_pixels:
                    if led_index not in state.get("last_leds", []):
                        leds.append(led_index)
                        led_index += 2
                    led_index = randint(led_index, led_index + 4)
                state["leds"] = leds
                state["last_leds"] = leds
                for n in leds:
                    self.set_led(n, 80, cur_color)
                self.write()
            elif sub == 1:
                for n in leds:
                    self.set_led(n, 30, cur_color)
                self.write()
            elif sub == 2:
                for n in leds:
                    self.set_led(n, 10, cur_color)
                self.write()
            elif sub == 3:
                self.fill((0, 0, 0))
                self.write()

            sub += 1
            if sub >= 4:
                sub = 0
                i += 1
                if i >= 5:
                    i = 0
                    if color is None:
                        state["color"] = self.wheel(randint(0, 255))
            state["i"] = i
            state["sub"] = sub
            return

        # 完整动画：复用逐帧模式（因延时不同，需明确序列）
        self._clear_frame_state(LedPixel.SPARKLE)
        # 一个完整循环（5次闪烁 × 4子阶段 = 20帧），每帧延时为 [50,20,20,10] 循环5次
        delays = [50, 20, 20, 10] * 5
        for delay in delays:
            await self.sparkle(color=color, frame=True)
            await asyncio.sleep_ms(delay)

    async def breathing(self, color=None, frame=False):
        self._last_effect = LedPixel.BREATHING

        if frame:
            key = LedPixel.BREATHING
            state = self._frame_states.get(key)
            if state is None:
                state = {
                    "bright": 0,
                    "dir": 1,
                    "color": self.wheel(randint(0, 255)) if color is None else color,
                }
                self._frame_states[key] = state

            cur_color = state["color"] if color is None else color
            bright = state["bright"]
            for n in range(len(self)):
                self.set_led(n, bright, cur_color)
            self.write()

            bright += 5 * state["dir"]
            if bright >= 80:
                bright = 80
                state["dir"] = -1
            elif bright <= 0:
                bright = 0
                state["dir"] = 1
                if color is None:
                    state["color"] = self.wheel(randint(0, 255))
            state["bright"] = bright
            return

        # 完整动画：复用逐帧模式（上升17帧+下降16帧=33帧）
        self._clear_frame_state(LedPixel.BREATHING)
        # 注意：逐帧状态会自行循环，我们只需播放足够多的帧以完成一个完整周期
        # 上升阶段帧数=17（0~80，步长5），下降阶段帧数=16（75~0），共33帧
        for _ in range(33):
            await self.breathing(color=color, frame=True)
            await asyncio.sleep_ms(100)

    async def scanner(self, color=None, frame=False):
        self._last_effect = LedPixel.SCANNER
        num_pixels = len(self)

        if frame:
            key = LedPixel.SCANNER
            state = self._frame_states.get(key)
            if state is None:
                state = {
                    "phase": 0,
                    "step": 0,
                    "color": self.wheel(randint(0, 255)) if color is None else color,
                }
                self._frame_states[key] = state

            cur_color = state["color"] if color is None else color
            phase, step = state["phase"], state["step"]
            self.fill((0, 0, 0))

            if phase == 0:
                for n in range(step + 1):
                    if n < num_pixels:
                        brightness = 80 - (step - n) * 15
                        if brightness > 0:
                            self.set_led(n, brightness, cur_color)
            else:
                for n in range(step + 1):
                    if n < num_pixels:
                        brightness = 80 - (step - n) * 15
                        if brightness > 0:
                            idx = num_pixels - n - 1
                            if idx >= 0:
                                self.set_led(idx, brightness, cur_color)
            self.write()

            step += 1
            if step >= num_pixels + 5:
                step = 0
                if phase == 0:
                    phase = 1
                else:
                    phase = 0
                    if color is None:
                        state["color"] = self.wheel(randint(0, 255))
            state["phase"], state["step"] = phase, step
            return

        # 完整动画：复用逐帧模式（向右全程+向左全程）
        self._clear_frame_state(LedPixel.SCANNER)
        # 向右阶段帧数 = num_pixels+5，向左阶段帧数 = num_pixels+5
        total_frames = (num_pixels + 5) * 2
        for _ in range(total_frames):
            await self.scanner(color=color, frame=True)
            await asyncio.sleep_ms(100)

    async def waterfall(self, color=None, frame=False):
        self._last_effect = LedPixel.WATERFALL
        num_pixels = len(self)

        if frame:
            key = LedPixel.WATERFALL
            state = self._frame_states.get(key)
            if state is None:
                state = {
                    "step": 0,
                    "color": self.wheel(randint(0, 255)) if color is None else color,
                }
                self._frame_states[key] = state

            cur_color = state["color"] if color is None else color
            step = state["step"]
            self.fill((0, 0, 0))
            for n in range(step + 1):
                if n < num_pixels:
                    brightness = 80 - (step - n) * 15
                    if brightness > 0:
                        self.set_led(n, brightness, cur_color)
            self.write()

            step += 1
            if step >= num_pixels + 5:
                step = 0
                if color is None:
                    state["color"] = self.wheel(randint(0, 255))
            state["step"] = step
            return

        # 完整动画：复用逐帧模式（共 num_pixels+5 帧）
        self._clear_frame_state(LedPixel.WATERFALL)
        for _ in range(num_pixels + 5):
            await self.waterfall(color=color, frame=True)
            await asyncio.sleep_ms(100)

    async def whirlpool(self, color=None, frame=False):
        num_pixels = len(self)

        if frame:
            key = LedPixel.WHIRLPOOL
            state = self._frame_states.get(key)
            if state is None:
                state = {
                    "step": 0,
                    "color": self.wheel(randint(0, 255)) if color is None else color,
                }
                self._frame_states[key] = state

            cur_color = state["color"] if color is None else color
            step = state["step"]
            self.fill((0, 0, 0))
            for n in range(step + 1):
                idx = n % num_pixels
                brightness = 80 - (step - n) * 15
                if brightness > 0:
                    self.set_led(idx, brightness, cur_color)
            self.write()

            step += 1
            if step % num_pixels == 0:
                # step = 0
                if color is None:
                    state["color"] = self.wheel(randint(0, 255))
            state["step"] = step
            return

        # 完整动画：复用逐帧模式（共 num_pixels+5 帧）
        # self._clear_frame_state(LedPixel.WHIRLPOOL)
        for _ in range(num_pixels):
            await self.whirlpool(color=color, frame=True)
            await asyncio.sleep_ms(100)

    async def light_spot(self, color=None, frame=False):
        self._last_effect = LedPixel.LIGHT_SPOT
        num_pixels = len(self)

        if frame:
            key = LedPixel.LIGHT_SPOT
            state = self._frame_states.get(key)
            if state is None:
                state = {
                    "pos": 0,
                    "color": self.wheel(randint(0, 255)) if color is None else color,
                }
                self._frame_states[key] = state

            cur_color = state["color"] if color is None else color
            pos = state["pos"]
            self.fill((0, 0, 0))
            self.set_led(pos, 80, cur_color)
            self.write()

            pos += 1
            if pos >= num_pixels:
                pos = 0
                if color is None:
                    state["color"] = self.wheel(randint(0, 255))
            state["pos"] = pos
            return

        # 完整动画：复用逐帧模式（共 num_pixels 帧）
        self._clear_frame_state(LedPixel.LIGHT_SPOT)
        for _ in range(num_pixels):
            await self.light_spot(color=color, frame=True)
            await asyncio.sleep_ms(100)

    async def light_wheel(self, color=None, frame=False):
        self._last_effect = LedPixel.LIGHT_WHEEL
        num_pixels = len(self)

        if frame:
            key = LedPixel.LIGHT_WHEEL
            state = self._frame_states.get(key)
            if state is None:
                state = {
                    "pos": 0,
                    "color": self.wheel(randint(0, 255)) if color is None else color,
                }
                self._frame_states[key] = state

            cur_color = state["color"] if color is None else color
            pos = state["pos"]
            self.fill(cur_color)
            self.set_led(pos, 80, (0, 0, 0))
            self.write()

            pos += 1
            if pos >= num_pixels:
                pos = 0
                if color is None:
                    state["color"] = self.wheel(randint(0, 255))
            state["pos"] = pos
            return

        # 完整动画：复用逐帧模式（共 num_pixels 帧）
        self._clear_frame_state(LedPixel.LIGHT_WHEEL)
        for _ in range(num_pixels):
            await self.light_wheel(color=color, frame=True)
            await asyncio.sleep_ms(100)
