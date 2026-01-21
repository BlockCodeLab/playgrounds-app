import math

from machine import PWM


class Servo:
    def __init__(
        self, pin, min_us=544.0, max_us=2400.0, min_deg=0.0, max_deg=180.0, freq=50
    ):
        self.pwm = PWM(pin, freq=freq)
        self.current_us = 0.0
        self._slope = (min_us - max_us) / (
            math.radians(min_deg) - math.radians(max_deg)
        )
        self._offset = min_us

    def deinit(self):
        self.pwm.deinit()

    def write(self, deg):
        self.write_rad(math.radians(deg))

    def read(self):
        return math.degrees(self.read_rad())

    def write_rad(self, rad):
        self.write_us(rad * self._slope + self._offset)

    def read_rad(self):
        return (self.current_us - self._offset) / self._slope

    def write_us(self, us):
        self.current_us = us
        self.pwm.duty_ns(int(self.current_us * 1000.0))

    def read_us(self):
        return self.current_us

    def off(self):
        self.pwm.duty_ns(0)


class Servo90(Servo):
    def __init__(
        self, pin, min_us=1000.0, max_us=2000.0, min_deg=0.0, max_deg=90.0, freq=50
    ):
        super().__init__(pin, min_us, max_us, min_deg, max_deg, freq)


class Servo180(Servo):
    def __init__(
        self, pin, min_us=500.0, max_us=2500.0, min_deg=0.0, max_deg=180.0, freq=50
    ):
        super().__init__(pin, min_us, max_us, min_deg, max_deg, freq)


class Servo270(Servo):
    def __init__(
        self, pin, min_us=600.0, max_us=2400.0, min_deg=0.0, max_deg=270.0, freq=50
    ):
        super().__init__(pin, min_us, max_us, min_deg, max_deg, freq)


class Servo360(Servo):
    def __init__(
        self, pin, min_us=500.0, max_us=2500.0, min_deg=0.0, max_deg=360.0, freq=50
    ):
        super().__init__(pin, min_us, max_us, min_deg, max_deg, freq)


class Servo360Motor(Servo):
    def __init__(self, pin, min_us=500.0, max_us=2500.0, freq=50):
        super().__init__(pin, min_us, max_us, freq=freq)

    def run(self, back=False):
        self.write_us(1000 if back else 2000)

    def stop(self):
        self.write_us(1500)
