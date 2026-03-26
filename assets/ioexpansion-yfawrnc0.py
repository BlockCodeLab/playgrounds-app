import struct

from machine import I2C, Pin
from micropython import const


class IOExpansion:
    NONE_MODE: int = const(0)
    INPUT_PULL_UP_MODE: int = const(1 << 0)
    INPUT_PULL_DOWN_MODE: int = const(1 << 1)
    INPUT_FLOATING_MODE: int = const(1 << 2)
    OUTPUT_DIGITAL_MODE: int = const(1 << 3)
    ADC_MODE: int = const(1 << 4)
    OUTPUT_PWM_MODE: int = const(1 << 5)

    _ADDRESS_VERSION: int = const(0x00)
    _ADDRESS_IO_MODE: int = const(0x01)
    _ADDRESS_ANALOG_VALUES: int = const(0x10)
    _ADDRESS_VOLTAGE_VALUES: int = const(0x20)
    _ADDRESS_RATIO_VOLTAGE: int = const(0x30)
    _ADDRESS_DIGITAL_VALUES: int = const(0x40)
    _ADDRESS_PWM_DUTY: int = const(0x50)
    _ADDRESS_PWM_FREQUENCY: int = const(0x60)

    class Pin:
        def __init__(self, pin, i2c, i2c_address):
            self._pin = pin
            self._i2c = i2c
            self._i2c_address = i2c_address
            self.mode = IOExpansion.NONE_MODE

        @property
        def mode(self):
            self._i2c.writeto(
                self._i2c_address, bytes([IOExpansion._ADDRESS_IO_MODE + self._pin])
            )

            return self._i2c.readfrom(self._i2c_address, 1)[0]

        @mode.setter
        def mode(self, value):
            if (value == IOExpansion.OUTPUT_PWM_MODE) and (
                self._pin != 1 and self._pin != 2
            ):
                raise ValueError("PE{} is unsupported pwm mode".format(self._pin))

            self._i2c.writeto(
                self._i2c_address,
                bytes([IOExpansion._ADDRESS_IO_MODE + self._pin, value]),
            )

        @property
        def value(self):
            self._i2c.writeto(
                self._i2c_address,
                bytes([IOExpansion._ADDRESS_DIGITAL_VALUES + self._pin]),
            )
            return self._i2c.readfrom(self._i2c_address, 1)[0]

        @value.setter
        def value(self, value):
            self._i2c.writeto(
                self._i2c_address,
                bytes([IOExpansion._ADDRESS_DIGITAL_VALUES + self._pin, value]),
            )

        @property
        def adc_value(self):
            self._i2c.writeto(
                self._i2c_address,
                bytes([IOExpansion._ADDRESS_ANALOG_VALUES + (self._pin << 1)]),
            )
            return struct.unpack("<H", self._i2c.readfrom(self._i2c_address, 2))[0]

        @property
        def pwm_duty(self):
            self._i2c.writeto(
                self._i2c_address,
                bytes([IOExpansion._ADDRESS_PWM_DUTY + (self._pin << 1)]),
            )
            return struct.unpack("<H", self._i2c.readfrom(self._i2c_address, 2))[0]

        @pwm_duty.setter
        def pwm_duty(self, value):
            self._i2c.writeto(
                self._i2c_address,
                bytes([IOExpansion._ADDRESS_PWM_DUTY + (self._pin << 1)])
                + struct.pack("<H", round(value)),
            )

        @property
        def servo_angle(self):
            return round((self.pwm_duty / 4095.0 * 20 - 0.5) * 90)

        @servo_angle.setter
        def servo_angle(self, value):
            self.pwm_duty = ((value / 90) + 0.5) / 20 * 4095

    def __init__(self, scl_pin, sda_pin, i2c_address=0x24, i2c_id=1):
        self._i2c = I2C(i2c_id, scl=Pin(scl_pin), sda=Pin(sda_pin))
        self._i2c_address = i2c_address
        self._pins = []
        for i in range(8):
            self._pins.append(IOExpansion.Pin(i, self._i2c, i2c_address))

    def __getitem__(self, pin):
        return self._pins[pin]

    @property
    def pwm_frequency(self):
        self._i2c.writeto(self._i2c_address, bytes([self._ADDRESS_PWM_FREQUENCY]))
        return struct.unpack("<H", self._i2c.readfrom(self._i2c_address, 2))[0]

    @pwm_frequency.setter
    def pwm_frequency(self, value):
        self._i2c.writeto(
            self._i2c_address,
            bytes([self._ADDRESS_PWM_FREQUENCY]) + struct.pack("<H", value),
        )
