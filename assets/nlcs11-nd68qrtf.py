"""
MicroPython driver for NLCS11 color sensor
Based on Arduino library by [original author]
"""

import time

from machine import I2C, Pin

# Device I2C address
NLCS11_I2C_ADDR = const(0x43)

# Command registers (based on Arduino code)
NLCS11_CMD_INIT = const(0x80)
NLCS11_CMD_READ = const(0xA0)

# Gain settings
GAIN_1X = const(0)
GAIN_1P5X = const(1)
GAIN_2X = const(2)
GAIN_2P5X = const(3)

# Integration time settings (ms)
INTEGRATION_TIME_10MS = const(0)
INTEGRATION_TIME_20MS = const(1)
INTEGRATION_TIME_40MS = const(2)
INTEGRATION_TIME_80MS = const(3)
INTEGRATION_TIME_100MS = const(4)
INTEGRATION_TIME_200MS = const(5)
INTEGRATION_TIME_400MS = const(6)
INTEGRATION_TIME_800MS = const(7)

# Integration time values in milliseconds
_INTEGRATION_TIMES_MS = [10, 20, 40, 80, 100, 200, 400, 800]


class NLCS11:
    def __init__(
        self,
        scl,
        sda,
        addr=NLCS11_I2C_ADDR,
        freq=100000,
        i2c_id=1,
        gain=GAIN_1X,
        integration_time=INTEGRATION_TIME_10MS,
    ):
        """
        Initialize NLCS11 sensor.

        :param i2c: I2C bus object (machine.I2C)
        :param addr: I2C address (default 0x43)
        :param gain: Gain setting (GAIN_1X, GAIN_1P5X, GAIN_2X, GAIN_2P5X)
        :param integration_time: Integration time setting (INTEGRATION_TIME_10MS, etc.)
        """
        self.i2c = I2C(i2c_id, scl=Pin(scl), sda=Pin(sda), freq=freq)
        self.addr = addr
        self.gain = gain
        self.integration_time = integration_time
        self._last_read_time = 0
        self._initialized = False
        self._gamma_table = self._compute_gamma_table()

    def _compute_gamma_table(self):
        """Precompute gamma correction table (gamma = 2.5)."""
        table = bytearray(256)
        for i in range(256):
            x = i / 255.0
            x = x**2.5
            x *= 255
            table[i] = int(x)
        return table

    def init(self):
        """
        Initialize the sensor with configured gain and integration time.

        :return: True if successful, False otherwise
        """
        try:
            # Send initialization command
            # Format: 0x80, 0x03, (gain << 4 | integration_time)
            config = (self.gain << 4) | self.integration_time
            self.i2c.writeto(self.addr, bytes([NLCS11_CMD_INIT, 0x03, config]))
            self._initialized = True
            return True
        except Exception:
            return False

    def _get_integration_time_ms(self):
        """Return integration time in milliseconds."""
        return _INTEGRATION_TIMES_MS[self.integration_time]

    def _read_raw(self):
        """
        Read raw RGBC values from sensor.

        :return: Tuple (r, g, b, c) or None if read failed
        """
        # Check if enough time has passed since last read
        integration_ms = self._get_integration_time_ms()
        current_time = time.ticks_ms()

        if self._last_read_time == 0:
            self._last_read_time = current_time
            return None

        if time.ticks_diff(current_time, self._last_read_time) < integration_ms:
            return None

        self._last_read_time = current_time

        try:
            # Send read command
            self.i2c.writeto(self.addr, bytes([NLCS11_CMD_READ]))

            # Read 8 bytes (4 x uint16_t)
            data = self.i2c.readfrom(self.addr, 8)
            if len(data) != 8:
                return None

            # Unpack data (little-endian uint16_t values)
            # Order: R, G, B, C (based on Arduino code structure)
            r = data[0] | (data[1] << 8)
            g = data[2] | (data[3] << 8)
            b = data[4] | (data[5] << 8)
            c = data[6] | (data[7] << 8)

            return (r, g, b, c)
        except Exception:
            return None

    def get_color(self):
        """
        Read and return the gamma-corrected RGB color.

        :return: Tuple (r, g, b) with values 0-255, or (0,0,0) if read fails
        """
        raw = self._read_raw()
        if raw is None:
            return (0, 0, 0)

        r, g, b, c = raw

        if c == 0:
            return (0, 0, 0)

        # Normalize by clear channel and apply gamma
        r_norm = min(255, int((r / c) * 255))
        g_norm = min(255, int((g / c) * 255))
        b_norm = min(255, int((b / c) * 255))

        r_gamma = self._gamma_table[r_norm]
        g_gamma = self._gamma_table[g_norm]
        b_gamma = self._gamma_table[b_norm]

        return (r_gamma, g_gamma, b_gamma)

    def get_red(self):
        """Return gamma-corrected red value."""
        return self.get_color()[0]

    def get_green(self):
        """Return gamma-corrected green value."""
        return self.get_color()[1]

    def get_blue(self):
        """Return gamma-corrected blue value."""
        return self.get_color()[2]

    def get_raw(self):
        """
        Read and return raw RGBC values (no gamma correction).

        :return: Tuple (r, g, b, c) or (0,0,0,0) if read fails
        """
        raw = self._read_raw()
        if raw is None:
            return (0, 0, 0, 0)
        return raw
