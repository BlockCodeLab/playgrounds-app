from machine import I2C, Pin
from micropython import const


class DM11:
    """
    Driver for the DM11 that two-way motor drive module.
    """

    DEFAULT_I2C_ADDRESS: int = const(0x15)

    VERSION_MAJOR: int = const(1)
    VERSION_MINOR: int = const(0)
    VERSION_PATCH: int = const(2)

    _MEM_ADDR_PWM_DUTY0: int = const(0x50)
    _MEM_ADDR_PWM_DUTY1: int = const(0x52)
    _MEM_ADDR_PWM_DUTY2: int = const(0x54)
    _MEM_ADDR_PWM_DUTY3: int = const(0x56)
    _MEM_ADDR_FREQUENCY: int = const(0x60)

    MIN_FREQUENCY_HZ: int = const(1)
    MAX_FREQUENCY_HZ: int = const(10000)
    MAX_PWM_DUTY: int = const(4095)
    PWM_CHANNEL_NUM: int = const(4)

    def __init__(
        self,
        scl_pin,
        sda_pin,
        i2c_address=DEFAULT_I2C_ADDRESS,
        i2c_id=1,
        frequency_hz=1000,
    ):
        self._i2c = I2C(i2c_id, scl=Pin(scl_pin), sda=Pin(sda_pin))
        self._i2c_address = i2c_address

        """
        Initialize the DM11 with the given frequency in Hz.
        """
        if frequency_hz < DM11.MIN_FREQUENCY_HZ or frequency_hz > DM11.MAX_FREQUENCY_HZ:
            raise ValueError("Frequency must be between 1 and 10000 Hz")

        # Set the frequency of the PWM signal
        self._i2c.writeto_mem(
            self._i2c_address,
            DM11._MEM_ADDR_FREQUENCY,
            frequency_hz.to_bytes(2, "little"),
        )
        self._i2c.writeto_mem(
            self._i2c_address,
            DM11._MEM_ADDR_PWM_DUTY0,
            b"\x00" * DM11.PWM_CHANNEL_NUM * 2,
        )

    def set_pwm_duty(self, channel, duty):
        """
        Set the duty cycle of the specified channel.
        """
        if channel < 0 or channel >= DM11.PWM_CHANNEL_NUM:
            raise ValueError("Channel must be between 0 and 3")
        if duty < 0 or duty > DM11.MAX_PWM_DUTY:
            raise ValueError("Duty must be between 0 and 4095")

        self._i2c.writeto_mem(
            self._i2c_address,
            DM11._MEM_ADDR_PWM_DUTY0 + (((channel + 2) % DM11.PWM_CHANNEL_NUM) << 1),
            duty.to_bytes(2, "little"),
        )
