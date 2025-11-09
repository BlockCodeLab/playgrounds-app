from micropython import const


class TM1650:
    _CMD_I2C_ADDRESS: int = const(0x24)
    _DISPLAY_I2C_ADDRESSES = (0x34, 0x35, 0x36, 0x37)

    def __init__(self, i2c) -> None:
        """Construct class, initialize display"""
        self._i2c = i2c
        self._brightness = 4
        self._data = bytearray(4)
        self.power_on()

    def power_on(self) -> None:
        """Turn on display power"""

        self._on = 1
        self._i2c.writeto(
            TM1650._CMD_I2C_ADDRESS, bytes([self._brightness << 4 | 0x01])
        )

    def power_off(self) -> None:
        """Turn off display power"""

        self._on = 0
        self._i2c.writeto(TM1650._CMD_I2C_ADDRESS, bytes([0x00]))

    def brightness(self, brightness: int) -> None:
        """Set display brightness 0-7"""

        self._brightness = brightness
        self._i2c.writeto(TM1650._CMD_I2C_ADDRESS, bytes([brightness << 4 | self._on]))

    def clear(self) -> None:
        """Clear display buffer"""

        for i in range(len(self._data)):
            self._data[i] = 0
        self.write()

    def __setitem__(self, position, value) -> None:
        """Set display buffer byte at given position"""

        self._data[position] = value

    def __getitem__(self, position) -> int:
        """Get display buffer byte at given position"""

        return self._data[position]

    def write(self) -> None:
        """Update connected displays with buffer contents"""

        for i in range(4):
            self._i2c.writeto(TM1650._DISPLAY_I2C_ADDRESSES[i], bytes([self._data[i]]))
