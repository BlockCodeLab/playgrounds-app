"""
RTC Base Class and Chip-specific Implementations
Supports: DS1307, DS3231, DS3232, PCF8563, PCF8523, MCP7940
Weekday: 1=Monday ... 7=Sunday
Methods: read_time, set_time, temperature (optional), is_running, start_clock, stop_clock
"""


class RTCBase:
    """Abstract base class for all RTC chips."""

    def __init__(self, i2c, address):
        self.i2c = i2c
        self.address = address
        self._init_chip()

    def _init_chip(self):
        """Chip-specific initialization (enable oscillator, 24h mode, etc.)."""
        raise NotImplementedError

    def read_time(self):
        """Return (year, month, day, hour, minute, second, weekday) with 1=Monday...7=Sunday."""
        raise NotImplementedError

    def set_time(self, year, month, day, hour, minute, second, weekday=None):
        """
        Set current time.
        :param weekday: optional, 1=Monday...7=Sunday. If None, automatically computed from date.
        """
        if weekday is None:
            weekday = self._compute_weekday(year, month, day)
        self._set_time_impl(year, month, day, hour, minute, second, weekday)

    def _set_time_impl(self, year, month, day, hour, minute, second, weekday):
        """Actual chip-specific time setting (to be implemented by subclasses)."""
        raise NotImplementedError

    def temperature(self):
        """Read temperature in Celsius (if supported)."""
        raise NotImplementedError("Temperature not supported by this RTC chip")

    def is_running(self):
        """Return True if the clock oscillator is running (time keeping)."""
        raise NotImplementedError

    def start_clock(self):
        """Start the clock oscillator (ensure time keeping)."""
        raise NotImplementedError

    def stop_clock(self):
        """Stop the clock oscillator (time will freeze)."""
        raise NotImplementedError

    @staticmethod
    def _bcd2dec(bcd):
        return ((bcd >> 4) & 0x0F) * 10 + (bcd & 0x0F)

    @staticmethod
    def _dec2bcd(dec):
        return ((dec // 10) << 4) | (dec % 10)

    @staticmethod
    def _compute_weekday(year, month, day):
        """
        Compute weekday using Zeller's congruence.
        Returns: 1=Monday, 2=Tuesday, ..., 7=Sunday.
        """
        if month < 3:
            month += 12
            year -= 1
        K = year % 100
        J = year // 100
        h = (day + (13 * (month + 1)) // 5 + K + K // 4 + J // 4 + 5 * J) % 7
        # h: 0=Saturday, 1=Sunday, 2=Monday, ..., 6=Friday
        # Convert to Monday=1..Sunday=7
        return (
            (h + 5) % 7
        ) + 1  # Saturday: (0+5)%7+1=6, Sunday:1, Monday:2, ..., Friday:7


# ========================== DS1307 ==========================
class DS1307(RTCBase):
    """DS1307 RTC chip."""

    REG_SEC = 0x00
    REG_MIN = 0x01
    REG_HOUR = 0x02
    REG_WDAY = 0x03
    REG_DAY = 0x04
    REG_MONTH = 0x05
    REG_YEAR = 0x06

    def __init__(self, i2c, address=0x68):
        super().__init__(i2c, address)

    def _init_chip(self):
        self.start_clock()
        # Set 24-hour mode
        hour = self.i2c.readfrom_mem(self.address, self.REG_HOUR, 1)[0]
        hour &= 0xBF
        self.i2c.writeto_mem(self.address, self.REG_HOUR, bytes([hour]))

    def read_time(self):
        data = self.i2c.readfrom_mem(self.address, self.REG_SEC, 7)
        second = self._bcd2dec(data[0] & 0x7F)
        minute = self._bcd2dec(data[1] & 0x7F)
        hour = self._bcd2dec(data[2] & 0x3F)
        chip_wday = data[3] & 0x07
        weekday = 7 if chip_wday == 1 else chip_wday - 1
        day = self._bcd2dec(data[4] & 0x3F)
        month = self._bcd2dec(data[5] & 0x1F)
        year = self._bcd2dec(data[6]) + 2000
        return (year, month, day, hour, minute, second, weekday)

    def _set_time_impl(self, year, month, day, hour, minute, second, weekday):
        year_2d = year % 100
        sec_bcd = self._dec2bcd(second) & 0x7F
        min_bcd = self._dec2bcd(minute)
        hour_bcd = self._dec2bcd(hour) & 0x3F
        day_bcd = self._dec2bcd(day)
        mon_bcd = self._dec2bcd(month)
        year_bcd = self._dec2bcd(year_2d)
        chip_wday = weekday % 7 + 1
        chip_wday &= 0x07
        self.i2c.writeto_mem(self.address, self.REG_SEC, bytes([sec_bcd]))
        self.i2c.writeto_mem(self.address, self.REG_MIN, bytes([min_bcd]))
        self.i2c.writeto_mem(self.address, self.REG_HOUR, bytes([hour_bcd]))
        self.i2c.writeto_mem(self.address, self.REG_WDAY, bytes([chip_wday]))
        self.i2c.writeto_mem(self.address, self.REG_DAY, bytes([day_bcd]))
        self.i2c.writeto_mem(self.address, self.REG_MONTH, bytes([mon_bcd]))
        self.i2c.writeto_mem(self.address, self.REG_YEAR, bytes([year_bcd]))

    def is_running(self):
        sec = self.i2c.readfrom_mem(self.address, self.REG_SEC, 1)[0]
        return not (sec & 0x80)

    def start_clock(self):
        sec = self.i2c.readfrom_mem(self.address, self.REG_SEC, 1)[0]
        sec &= 0x7F
        self.i2c.writeto_mem(self.address, self.REG_SEC, bytes([sec]))

    def stop_clock(self):
        sec = self.i2c.readfrom_mem(self.address, self.REG_SEC, 1)[0]
        sec |= 0x80
        self.i2c.writeto_mem(self.address, self.REG_SEC, bytes([sec]))


# ========================== DS3231 ==========================
class DS3231(RTCBase):
    """DS3231 RTC chip (high accuracy, temperature compensated)."""

    REG_SEC = 0x00
    REG_MIN = 0x01
    REG_HOUR = 0x02
    REG_WDAY = 0x03
    REG_DAY = 0x04
    REG_MONTH = 0x05
    REG_YEAR = 0x06
    REG_CTRL = 0x0E

    def __init__(self, i2c, address=0x68):
        super().__init__(i2c, address)

    def _init_chip(self):
        self.start_clock()
        hour = self.i2c.readfrom_mem(self.address, self.REG_HOUR, 1)[0]
        hour &= 0xBF
        self.i2c.writeto_mem(self.address, self.REG_HOUR, bytes([hour]))
        # Clear OSF flag
        status = self.i2c.readfrom_mem(self.address, 0x0F, 1)[0]
        if status & 0x80:
            status &= 0x7F
            self.i2c.writeto_mem(self.address, 0x0F, bytes([status]))

    def read_time(self):
        data = self.i2c.readfrom_mem(self.address, self.REG_SEC, 7)
        second = self._bcd2dec(data[0] & 0x7F)
        minute = self._bcd2dec(data[1] & 0x7F)
        hour = self._bcd2dec(data[2] & 0x3F)
        chip_wday = data[3] & 0x07
        weekday = 7 if chip_wday == 1 else chip_wday - 1
        day = self._bcd2dec(data[4] & 0x3F)
        month = self._bcd2dec(data[5] & 0x1F)
        year = self._bcd2dec(data[6]) + 2000
        return (year, month, day, hour, minute, second, weekday)

    def _set_time_impl(self, year, month, day, hour, minute, second, weekday):
        year_2d = year % 100
        sec_bcd = self._dec2bcd(second) & 0x7F
        min_bcd = self._dec2bcd(minute)
        hour_bcd = self._dec2bcd(hour) & 0x3F
        day_bcd = self._dec2bcd(day)
        mon_bcd = self._dec2bcd(month)
        year_bcd = self._dec2bcd(year_2d)
        chip_wday = weekday % 7 + 1
        chip_wday &= 0x07
        self.i2c.writeto_mem(self.address, self.REG_SEC, bytes([sec_bcd]))
        self.i2c.writeto_mem(self.address, self.REG_MIN, bytes([min_bcd]))
        self.i2c.writeto_mem(self.address, self.REG_HOUR, bytes([hour_bcd]))
        self.i2c.writeto_mem(self.address, self.REG_WDAY, bytes([chip_wday]))
        self.i2c.writeto_mem(self.address, self.REG_DAY, bytes([day_bcd]))
        self.i2c.writeto_mem(self.address, self.REG_MONTH, bytes([mon_bcd]))
        self.i2c.writeto_mem(self.address, self.REG_YEAR, bytes([year_bcd]))

    def temperature(self):
        msb = self.i2c.readfrom_mem(self.address, 0x11, 1)[0]
        lsb = self.i2c.readfrom_mem(self.address, 0x12, 1)[0]
        if msb & 0x80:
            temp_int = msb - 256
        else:
            temp_int = msb
        temp_frac = (lsb >> 6) * 0.25
        return temp_int + temp_frac

    def is_running(self):
        ctrl = self.i2c.readfrom_mem(self.address, self.REG_CTRL, 1)[0]
        return not (ctrl & 0x80)

    def start_clock(self):
        ctrl = self.i2c.readfrom_mem(self.address, self.REG_CTRL, 1)[0]
        ctrl &= 0x7F
        self.i2c.writeto_mem(self.address, self.REG_CTRL, bytes([ctrl]))

    def stop_clock(self):
        ctrl = self.i2c.readfrom_mem(self.address, self.REG_CTRL, 1)[0]
        ctrl |= 0x80
        self.i2c.writeto_mem(self.address, self.REG_CTRL, bytes([ctrl]))


# ========================== DS3232 ==========================
class DS3232(DS3231):
    """DS3232 RTC chip (DS3231 with SRAM)."""

    pass


# ========================== PCF8563 ==========================
class PCF8563(RTCBase):
    """PCF8563 RTC chip."""

    REG_CTRL1 = 0x00
    REG_SEC = 0x02
    REG_MIN = 0x03
    REG_HOUR = 0x04
    REG_DAY = 0x05
    REG_WDAY = 0x06
    REG_MONTH = 0x07
    REG_YEAR = 0x08

    def __init__(self, i2c, address=0x51):
        super().__init__(i2c, address)

    def _init_chip(self):
        self.start_clock()
        hour = self.i2c.readfrom_mem(self.address, self.REG_HOUR, 1)[0]
        hour &= 0x7F
        self.i2c.writeto_mem(self.address, self.REG_HOUR, bytes([hour]))

    def read_time(self):
        data = self.i2c.readfrom_mem(self.address, self.REG_SEC, 7)
        second = self._bcd2dec(data[0] & 0x7F)
        minute = self._bcd2dec(data[1] & 0x7F)
        hour = self._bcd2dec(data[2] & 0x3F)
        day = self._bcd2dec(data[3] & 0x3F)
        chip_wday = data[4] & 0x07
        weekday = 7 if chip_wday == 0 else chip_wday
        month = self._bcd2dec(data[5] & 0x1F)
        year = self._bcd2dec(data[6]) + 2000
        return (year, month, day, hour, minute, second, weekday)

    def _set_time_impl(self, year, month, day, hour, minute, second, weekday):
        year_2d = year % 100
        sec_bcd = self._dec2bcd(second) & 0x7F
        min_bcd = self._dec2bcd(minute)
        hour_bcd = self._dec2bcd(hour) & 0x3F
        day_bcd = self._dec2bcd(day)
        mon_bcd = self._dec2bcd(month)
        year_bcd = self._dec2bcd(year_2d)
        chip_wday = weekday % 7  # Sunday=7 -> 0, Monday=1 -> 1
        chip_wday &= 0x07
        self.i2c.writeto_mem(self.address, self.REG_SEC, bytes([sec_bcd]))
        self.i2c.writeto_mem(self.address, self.REG_MIN, bytes([min_bcd]))
        self.i2c.writeto_mem(self.address, self.REG_HOUR, bytes([hour_bcd]))
        self.i2c.writeto_mem(self.address, self.REG_DAY, bytes([day_bcd]))
        self.i2c.writeto_mem(self.address, self.REG_WDAY, bytes([chip_wday]))
        self.i2c.writeto_mem(self.address, self.REG_MONTH, bytes([mon_bcd]))
        self.i2c.writeto_mem(self.address, self.REG_YEAR, bytes([year_bcd]))

    def is_running(self):
        ctrl = self.i2c.readfrom_mem(self.address, self.REG_CTRL1, 1)[0]
        return not (ctrl & 0x80)

    def start_clock(self):
        ctrl = self.i2c.readfrom_mem(self.address, self.REG_CTRL1, 1)[0]
        ctrl &= 0x7F
        self.i2c.writeto_mem(self.address, self.REG_CTRL1, bytes([ctrl]))

    def stop_clock(self):
        ctrl = self.i2c.readfrom_mem(self.address, self.REG_CTRL1, 1)[0]
        ctrl |= 0x80
        self.i2c.writeto_mem(self.address, self.REG_CTRL1, bytes([ctrl]))


# ========================== PCF8523 ==========================
class PCF8523(RTCBase):
    """PCF8523 RTC chip."""

    REG_CTRL1 = 0x00
    REG_SEC = 0x03
    REG_MIN = 0x04
    REG_HOUR = 0x05
    REG_DAY = 0x06
    REG_WDAY = 0x07
    REG_MONTH = 0x08
    REG_YEAR = 0x09

    def __init__(self, i2c, address=0x68):
        super().__init__(i2c, address)

    def _init_chip(self):
        self.start_clock()
        hour = self.i2c.readfrom_mem(self.address, self.REG_HOUR, 1)[0]
        hour &= 0x7F
        self.i2c.writeto_mem(self.address, self.REG_HOUR, bytes([hour]))
        sec = self.i2c.readfrom_mem(self.address, self.REG_SEC, 1)[0]
        if sec & 0x80:
            sec &= 0x7F
            self.i2c.writeto_mem(self.address, self.REG_SEC, bytes([sec]))

    def read_time(self):
        data = self.i2c.readfrom_mem(self.address, self.REG_SEC, 7)
        second = self._bcd2dec(data[0] & 0x7F)
        minute = self._bcd2dec(data[1] & 0x7F)
        hour = self._bcd2dec(data[2] & 0x3F)
        day = self._bcd2dec(data[3] & 0x3F)
        chip_wday = data[4] & 0x07
        weekday = 7 if chip_wday == 0 else chip_wday
        month = self._bcd2dec(data[5] & 0x1F)
        year = self._bcd2dec(data[6]) + 2000
        return (year, month, day, hour, minute, second, weekday)

    def _set_time_impl(self, year, month, day, hour, minute, second, weekday):
        year_2d = year % 100
        sec_bcd = self._dec2bcd(second) & 0x7F
        min_bcd = self._dec2bcd(minute)
        hour_bcd = self._dec2bcd(hour) & 0x3F
        day_bcd = self._dec2bcd(day)
        mon_bcd = self._dec2bcd(month)
        year_bcd = self._dec2bcd(year_2d)
        chip_wday = weekday % 7
        chip_wday &= 0x07
        self.i2c.writeto_mem(self.address, self.REG_SEC, bytes([sec_bcd]))
        self.i2c.writeto_mem(self.address, self.REG_MIN, bytes([min_bcd]))
        self.i2c.writeto_mem(self.address, self.REG_HOUR, bytes([hour_bcd]))
        self.i2c.writeto_mem(self.address, self.REG_DAY, bytes([day_bcd]))
        self.i2c.writeto_mem(self.address, self.REG_WDAY, bytes([chip_wday]))
        self.i2c.writeto_mem(self.address, self.REG_MONTH, bytes([mon_bcd]))
        self.i2c.writeto_mem(self.address, self.REG_YEAR, bytes([year_bcd]))

    def is_running(self):
        ctrl = self.i2c.readfrom_mem(self.address, self.REG_CTRL1, 1)[0]
        return not (ctrl & 0x80)

    def start_clock(self):
        ctrl = self.i2c.readfrom_mem(self.address, self.REG_CTRL1, 1)[0]
        ctrl &= 0x7F
        self.i2c.writeto_mem(self.address, self.REG_CTRL1, bytes([ctrl]))

    def stop_clock(self):
        ctrl = self.i2c.readfrom_mem(self.address, self.REG_CTRL1, 1)[0]
        ctrl |= 0x80
        self.i2c.writeto_mem(self.address, self.REG_CTRL1, bytes([ctrl]))


# ========================== MCP7940 ==========================
class MCP7940(RTCBase):
    """MCP7940 RTC chip."""

    REG_SEC = 0x00
    REG_MIN = 0x01
    REG_HOUR = 0x02
    REG_WDAY = 0x03
    REG_DAY = 0x04
    REG_MONTH = 0x05
    REG_YEAR = 0x06
    REG_CTRL = 0x07

    def __init__(self, i2c, address=0x6F):
        super().__init__(i2c, address)

    def _init_chip(self):
        self.start_clock()
        ctrl = self.i2c.readfrom_mem(self.address, self.REG_CTRL, 1)[0]
        ctrl |= 0x08
        self.i2c.writeto_mem(self.address, self.REG_CTRL, bytes([ctrl]))
        hour = self.i2c.readfrom_mem(self.address, self.REG_HOUR, 1)[0]
        hour &= 0xBF
        self.i2c.writeto_mem(self.address, self.REG_HOUR, bytes([hour]))

    def read_time(self):
        data = self.i2c.readfrom_mem(self.address, self.REG_SEC, 7)
        second = self._bcd2dec(data[0] & 0x7F)
        minute = self._bcd2dec(data[1] & 0x7F)
        hour = self._bcd2dec(data[2] & 0x3F)
        chip_wday = data[3] & 0x07
        weekday = 7 if chip_wday == 1 else chip_wday - 1
        day = self._bcd2dec(data[4] & 0x3F)
        month = self._bcd2dec(data[5] & 0x1F)
        year = self._bcd2dec(data[6]) + 2000
        return (year, month, day, hour, minute, second, weekday)

    def _set_time_impl(self, year, month, day, hour, minute, second, weekday):
        year_2d = year % 100
        sec_bcd = self._dec2bcd(second) & 0x7F
        min_bcd = self._dec2bcd(minute)
        hour_bcd = self._dec2bcd(hour) & 0x3F
        day_bcd = self._dec2bcd(day)
        mon_bcd = self._dec2bcd(month)
        year_bcd = self._dec2bcd(year_2d)
        chip_wday = weekday % 7 + 1
        chip_wday &= 0x07
        self.i2c.writeto_mem(self.address, self.REG_SEC, bytes([sec_bcd]))
        self.i2c.writeto_mem(self.address, self.REG_MIN, bytes([min_bcd]))
        self.i2c.writeto_mem(self.address, self.REG_HOUR, bytes([hour_bcd]))
        self.i2c.writeto_mem(self.address, self.REG_WDAY, bytes([chip_wday]))
        self.i2c.writeto_mem(self.address, self.REG_DAY, bytes([day_bcd]))
        self.i2c.writeto_mem(self.address, self.REG_MONTH, bytes([mon_bcd]))
        self.i2c.writeto_mem(self.address, self.REG_YEAR, bytes([year_bcd]))

    def is_running(self):
        sec = self.i2c.readfrom_mem(self.address, self.REG_SEC, 1)[0]
        return not (sec & 0x80)

    def start_clock(self):
        sec = self.i2c.readfrom_mem(self.address, self.REG_SEC, 1)[0]
        sec &= 0x7F
        self.i2c.writeto_mem(self.address, self.REG_SEC, bytes([sec]))

    def stop_clock(self):
        sec = self.i2c.readfrom_mem(self.address, self.REG_SEC, 1)[0]
        sec |= 0x80
        self.i2c.writeto_mem(self.address, self.REG_SEC, bytes([sec]))
