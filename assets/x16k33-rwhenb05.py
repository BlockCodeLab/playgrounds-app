from micropython import const


class X16k33:
    DEFAULT_I2C_ADDRESS: int = const(0x70)

    BLINK_OFF: int = const(0)
    BLINK_RATE_2_HZ: int = const(1)
    BLINK_RATE_1_HZ: int = const(2)
    BLINK_RATE_HALF_HZ: int = const(3)

    _DISPLAY_ON: int = const(0x81)
    _DISPLAY_OFF: int = const(0x80)
    _SYSTEM_ON: int = const(0x21)
    _SYSTEM_OFF: int = const(0x20)
    _DISPLAY_ADDRESS: int = const(0x00)
    _CMD_BRIGHTNESS: int = const(0xE0)
    _CMD_BLINK: int = const(0x81)

    def __init__(self, i2c, i2c_address: int = DEFAULT_I2C_ADDRESS) -> None:
        """
        Construct X16k33 class with given I2C bus and optional custom I2C address

        Parameters:
            i2c: I2C bus
            i2c_address: I2C address, defaults to 0x70
        """
        self._i2c = i2c
        self._i2c_address = i2c_address
        self._data = bytearray(16)
        self.clear()
        self.power_on()

    def blink_rate(self, blink_rate: int) -> None:
        """
        Set blink rate for display

        Parameters:
            blink_rate: Blink rate value, use BLINK_OFF, BLINK_RATE_2_HZ,
                        BLINK_RATE_1_HZ, BLINK_RATE_HALF_HZ
        """
        self._i2c.writeto(
            self._i2c_address, bytes([X16k33._CMD_BLINK | (blink_rate << 1)])
        )

    def brightness(self, brightness: int) -> None:
        """
        Set brightness for display

        Parameters:
            brightness: Brightness value from 0-15
        """
        self._i2c.writeto(
            self._i2c_address, bytes([X16k33._CMD_BRIGHTNESS | brightness])
        )

    def power_on(self) -> None:
        """Turn on system and display power"""
        self._i2c.writeto(self._i2c_address, bytes([X16k33._SYSTEM_ON]))
        self._i2c.writeto(self._i2c_address, bytes([X16k33._DISPLAY_ON]))

    def power_off(self) -> None:
        """Turn off display power and system power"""
        self._i2c.writeto(self._i2c_address, bytes([X16k33._DISPLAY_OFF]))
        self._i2c.writeto(self._i2c_address, bytes([X16k33._SYSTEM_OFF]))

    def clear(self) -> None:
        """Clear display buffer"""
        for i in range(len(self._data)):
            self._data[i] = 0x00
        self._i2c.writeto(
            self._i2c_address, bytes([X16k33._DISPLAY_ADDRESS]) + self._data
        )

    def __setitem__(self, position: int, value: int) -> None:
        """
        Set display buffer value at given position

        Parameters:
            position: Position in buffer
            value: Value to set
        """
        self._data[position] = value

    def write(self) -> None:
        """Update display with buffer contents"""
        self._i2c.writeto(
            self._i2c_address, bytearray([X16k33._DISPLAY_ADDRESS]) + self._data
        )
