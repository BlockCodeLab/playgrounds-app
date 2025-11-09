from micropython import const
from machine import Pin, I2C
import struct


class FiveLineTracker:
    _MEMORY_ADDRESS_DEVICE_ID: int = const(0x00)
    _MEMORY_ADDRESS_VERSION: int = const(0x01)
    _MEMORY_ADDRESS_ANALOG_VALUES: int = const(0x10)
    _MEMORY_ADDRESS_DIGITAL_VALUES: int = const(0x1A)
    _MEMORY_ADDRESS_HIGH_THRESHOLDS: int = const(0x1C)
    _MEMORY_ADDRESS_LOW_THRESHOLDS: int = const(0x26)

    def __init__(self, scl, sda, i2c_address=0x50):
        self._i2c = I2C(1, scl=Pin(scl), sda=Pin(sda))
        self._i2c_address = i2c_address

    @property
    def device_id(self):
        return self._i2c.readfrom_mem(
            self._i2c_address, FiveLineTracker._MEMORY_ADDRESS_DEVICE_ID, 1
        )[0]

    @property
    def version(self):
        return self._i2c.readfrom_mem(
            self._i2c_address, FiveLineTracker._MEMORY_ADDRESS_VERSION, 1
        )[0]

    @property
    def high_thresholds(self):
        return struct.unpack(
            "<HHHHH",
            self._i2c.readfrom_mem(
                self._i2c_address, FiveLineTracker._MEMORY_ADDRESS_HIGH_THRESHOLDS, 10
            ),
        )

    @high_thresholds.setter
    def high_thresholds(self, values: tuple):
        self._i2c.writeto_mem(
            self._i2c_address,
            FiveLineTracker._MEMORY_ADDRESS_HIGH_THRESHOLDS,
            struct.pack("<HHHHH", *values),
        )

    @property
    def low_thresholds(self):
        return struct.unpack(
            "<HHHHH",
            self._i2c.readfrom_mem(
                self._i2c_address, FiveLineTracker._MEMORY_ADDRESS_LOW_THRESHOLDS, 10
            ),
        )

    @low_thresholds.setter
    def low_thresholds(self, values: tuple):
        self._i2c.writeto_mem(
            self._i2c_address,
            FiveLineTracker._MEMORY_ADDRESS_LOW_THRESHOLDS,
            struct.pack("<HHHHH", *values),
        )

    def high_threshold(self, channel, value):
        self._i2c.writeto_mem(
            self._i2c_address,
            FiveLineTracker._MEMORY_ADDRESS_HIGH_THRESHOLDS + (channel << 1),
            struct.pack("<H", value),
        )

    def low_threshold(self, channel, value):
        self._i2c.writeto_mem(
            self._i2c_address,
            FiveLineTracker._MEMORY_ADDRESS_LOW_THRESHOLDS + (channel << 1),
            struct.pack("<H", value),
        )

    @property
    def analog_values(self):
        return struct.unpack(
            "<HHHHH",
            self._i2c.readfrom_mem(
                self._i2c_address, FiveLineTracker._MEMORY_ADDRESS_ANALOG_VALUES, 10
            ),
        )

    @property
    def digital_values(self):
        return self._i2c.readfrom_mem(
            self._i2c_address, FiveLineTracker._MEMORY_ADDRESS_DIGITAL_VALUES, 1
        )[0]

    def analog_value(self, channel):
        return self.analog_values[channel]

    def digital_value(self, channel):
        return (self.digital_values >> channel) & 0x01
