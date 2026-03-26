import struct

from machine import I2C, Pin
from micropython import const

DEFAULT_I2C_ADDRESS: int = const(0x16)

MOTOR_NUM: int = const(4)

STATE_IDLE: int = const(0)
STATE_RUNNING_WITH_PWM_DUTY: int = const(1)
STATE_RUNNING_WITH_SPEED: int = const(2)
STATE_RUNNING_TO_POSITION: int = const(3)
STATE_REACHED_POSITION: int = const(4)

PHASE_RELATION_A_PHASE_LEADS: int = const(0)
PHASE_RELATION_B_PHASE_LEADS: int = const(1)

_CMD_SETUP: int = const(1)
_CMD_RESET: int = const(2)
_CMD_SET_SPEED_PID_P: int = const(3)
_CMD_SET_SPEED_PID_I: int = const(4)
_CMD_SET_SPEED_PID_D: int = const(5)
_CMD_SET_POSITION_PID_P: int = const(6)
_CMD_SET_POSITION_PID_I: int = const(7)
_CMD_SET_POSITION_PID_D: int = const(8)
_CMD_SET_POSITION: int = const(9)
_CMD_SET_PULSE_COUNT: int = const(10)
_CMD_STOP: int = const(11)
_CMD_RUN_PWM_DUTY: int = const(12)
_CMD_RUN_SPEED: int = const(13)
_CMD_MOVE_TO: int = const(14)
_CMD_MOVE: int = const(15)

_MEM_ADDR_DEVICE_ID: int = const(0x00)
_MEM_ADDR_MAJOR_VERSION: int = const(0x01)
_MEM_ADDR_MINOR_VERSION: int = const(0x02)
_MEM_ADDR_PATCH_VERSION: int = const(0x03)
_MEM_ADDR_NAME: int = const(0x04)
_MEM_ADDR_COMMAND_TYPE: int = const(0x11)
_MEM_ADDR_COMMAND_INDEX: int = const(0x12)
_MEM_ADDR_COMMAND_PARAM: int = const(0x13)
_MEM_ADDR_COMMAND_EXECUTE: int = const(0x23)

_MEM_ADDR_STATE: int = const(0x24)
_MEM_ADDR_SPEED_P: int = const(0x26)
_MEM_ADDR_SPEED_I: int = const(0x28)
_MEM_ADDR_SPEED_D: int = const(0x2A)
_MEM_ADDR_POSITION_P: int = const(0x2C)
_MEM_ADDR_POSITION_I: int = const(0x2E)
_MEM_ADDR_POSITION_D: int = const(0x30)
_MEM_ADDR_SPEED: int = const(0x34)
_MEM_ADDR_POSITION: int = const(0x38)
_MEM_ADDR_PULSE_COUNT: int = const(0x3C)
_MEM_ADDR_PWM_DUTY: int = const(0x40)

_MOTOR_STATE_OFFSET: int = const(0x20)


class MD40:
    class Motor:
        def __init__(self, index, i2c, i2c_address):
            self._index = index
            self._i2c = i2c
            self._i2c_address = i2c_address
            self.reset()

        def _execute_command(self):
            self._i2c.writeto_mem(self._i2c_address, _MEM_ADDR_COMMAND_EXECUTE, b"\x01")
            self._wait_command_emptied()

        def _wait_command_emptied(self):
            while (
                self._i2c.readfrom_mem(self._i2c_address, _MEM_ADDR_COMMAND_EXECUTE, 1)[
                    0
                ]
                != 0
            ):
                pass

        def reset(self):
            self._wait_command_emptied()
            self._i2c.writeto_mem(
                self._i2c_address,
                _MEM_ADDR_COMMAND_TYPE,
                bytes([_CMD_RESET, self._index]),
            )
            self._execute_command()

        def setup_encoder_mode(self, ppr, reduction_ration, phase_relation):
            self._wait_command_emptied()
            self._i2c.writeto_mem(
                self._i2c_address,
                _MEM_ADDR_COMMAND_TYPE,
                struct.pack(
                    "<BBHHB",
                    _CMD_SETUP,
                    self._index,
                    ppr,
                    reduction_ration,
                    phase_relation,
                ),
            )
            self._execute_command()

        def setup_dc_mode(self):
            self._wait_command_emptied()
            self._i2c.writeto_mem(
                self._i2c_address,
                _MEM_ADDR_COMMAND_TYPE,
                bytes([_CMD_SETUP, self._index, 0, 0, 0]),
            )
            self._execute_command()

        @property
        def speed_pid_p(self):
            return (
                struct.unpack(
                    "<H",
                    self._i2c.readfrom_mem(
                        self._i2c_address,
                        _MEM_ADDR_SPEED_P + self._index * _MOTOR_STATE_OFFSET,
                        2,
                    ),
                )[0]
                / 100.0
            )

        @speed_pid_p.setter
        def speed_pid_p(self, value):
            self._wait_command_emptied()
            self._i2c.writeto_mem(
                self._i2c_address,
                _MEM_ADDR_COMMAND_TYPE,
                struct.pack(
                    "<BBH", _CMD_SET_SPEED_PID_P, self._index, int(value * 100)
                ),
            )
            self._execute_command()

        @property
        def speed_pid_i(self):
            return (
                struct.unpack(
                    "<H",
                    self._i2c.readfrom_mem(
                        self._i2c_address,
                        _MEM_ADDR_SPEED_I + self._index * _MOTOR_STATE_OFFSET,
                        2,
                    ),
                )[0]
                / 100.0
            )

        @speed_pid_i.setter
        def speed_pid_i(self, value):
            self._wait_command_emptied()
            self._i2c.writeto_mem(
                self._i2c_address,
                _MEM_ADDR_COMMAND_TYPE,
                struct.pack(
                    "<BBH", _CMD_SET_SPEED_PID_I, self._index, int(value * 100)
                ),
            )
            self._execute_command()

        @property
        def speed_pid_d(self):
            return (
                struct.unpack(
                    "<H",
                    self._i2c.readfrom_mem(
                        self._i2c_address,
                        _MEM_ADDR_SPEED_D + self._index * _MOTOR_STATE_OFFSET,
                        2,
                    ),
                )[0]
                / 100.0
            )

        @speed_pid_d.setter
        def speed_pid_d(self, value):
            self._wait_command_emptied()
            self._i2c.writeto_mem(
                self._i2c_address,
                _MEM_ADDR_COMMAND_TYPE,
                struct.pack(
                    "<BBH", _CMD_SET_SPEED_PID_D, self._index, int(value * 100)
                ),
            )
            self._execute_command()

        @property
        def position_pid_p(self):
            return (
                struct.unpack(
                    "<H",
                    self._i2c.readfrom_mem(
                        self._i2c_address,
                        _MEM_ADDR_POSITION_P + self._index * _MOTOR_STATE_OFFSET,
                        2,
                    ),
                )[0]
                / 100.0
            )

        @position_pid_p.setter
        def position_pid_p(self, value):
            self._wait_command_emptied()
            self._i2c.writeto_mem(
                self._i2c_address,
                _MEM_ADDR_COMMAND_TYPE,
                struct.pack(
                    "<BBH", _CMD_SET_POSITION_PID_P, self._index, int(value * 100)
                ),
            )
            self._execute_command()

        @property
        def position_pid_i(self):
            return (
                struct.unpack(
                    "<H",
                    self._i2c.readfrom_mem(
                        self._i2c_address,
                        _MEM_ADDR_POSITION_I + self._index * _MOTOR_STATE_OFFSET,
                        2,
                    ),
                )[0]
                / 100
            )

        @position_pid_i.setter
        def position_pid_i(self, value):
            self._wait_command_emptied()
            self._i2c.writeto_mem(
                self._i2c_address,
                _MEM_ADDR_COMMAND_TYPE,
                struct.pack(
                    "<BBH", _CMD_SET_POSITION_PID_I, self._index, int(value * 100)
                ),
            )
            self._execute_command()

        @property
        def position_pid_d(self):
            return (
                struct.unpack(
                    "<H",
                    self._i2c.readfrom_mem(
                        self._i2c_address,
                        _MEM_ADDR_POSITION_D + self._index * _MOTOR_STATE_OFFSET,
                        2,
                    ),
                )[0]
                / 100
            )

        @position_pid_d.setter
        def position_pid_d(self, value):
            self._wait_command_emptied()
            self._i2c.writeto_mem(
                self._i2c_address,
                _MEM_ADDR_COMMAND_TYPE,
                struct.pack(
                    "<BBH", _CMD_SET_POSITION_PID_D, self._index, int(value * 100)
                ),
            )
            self._execute_command()

        def set_current_position(self, position):
            self._wait_command_emptied()
            self._i2c.writeto_mem(
                self._i2c_address,
                _MEM_ADDR_COMMAND_TYPE,
                struct.pack("<BBI", _CMD_SET_POSITION, self._index, position),
            )
            self._execute_command()

        def set_pulse_count(self, pulse_count):
            self._wait_command_emptied()
            self._i2c.writeto_mem(
                self._i2c_address,
                _MEM_ADDR_COMMAND_TYPE,
                struct.pack("<BBI", _CMD_SET_PULSE_COUNT, self._index, pulse_count),
            )
            self._execute_command()

        def stop(self):
            self._wait_command_emptied()
            self._i2c.writeto_mem(
                self._i2c_address,
                _MEM_ADDR_COMMAND_TYPE,
                bytes([_CMD_STOP, self._index]),
            )
            self._execute_command()

        def run_speed(self, rpm):
            self._wait_command_emptied()
            self._i2c.writeto_mem(
                self._i2c_address,
                _MEM_ADDR_COMMAND_TYPE,
                struct.pack("<BBi", _CMD_RUN_SPEED, self._index, rpm),
            )
            self._execute_command()

        def run_pwm_duty(self, pwm_duty):
            self._wait_command_emptied()
            self._i2c.writeto_mem(
                self._i2c_address,
                _MEM_ADDR_COMMAND_TYPE,
                struct.pack("<BBh", _CMD_RUN_PWM_DUTY, self._index, pwm_duty),
            )
            self._execute_command()

        def move_to(self, position, speed):
            self._wait_command_emptied()
            self._i2c.writeto_mem(
                self._i2c_address,
                _MEM_ADDR_COMMAND_TYPE,
                struct.pack("<BBii", _CMD_MOVE_TO, self._index, position, speed),
            )
            self._execute_command()

        def move(self, offset, speed):
            self._wait_command_emptied()
            self._i2c.writeto_mem(
                self._i2c_address,
                _MEM_ADDR_COMMAND_TYPE,
                struct.pack("<BBii", _CMD_MOVE, self._index, offset, speed),
            )
            self._execute_command()

        @property
        def state(self):
            mem_addr = _MEM_ADDR_STATE + self._index * _MOTOR_STATE_OFFSET
            self._i2c.writeto_mem(self._i2c_address, mem_addr, b"\x00")
            return self._i2c.readfrom_mem(self._i2c_address, mem_addr, 1)[0]

        @property
        def speed(self):
            mem_addr = _MEM_ADDR_SPEED + self._index * _MOTOR_STATE_OFFSET
            self._i2c.writeto_mem(self._i2c_address, mem_addr, b"\x00")
            return struct.unpack(
                "<i", self._i2c.readfrom_mem(self._i2c_address, mem_addr, 4)
            )[0]

        @property
        def position(self):
            mem_addr = _MEM_ADDR_POSITION + self._index * _MOTOR_STATE_OFFSET
            self._i2c.writeto_mem(self._i2c_address, mem_addr, b"\x00")
            return struct.unpack(
                "<i", self._i2c.readfrom_mem(self._i2c_address, mem_addr, 4)
            )[0]

        @property
        def pulse_count(self):
            mem_addr = _MEM_ADDR_PULSE_COUNT + self._index * _MOTOR_STATE_OFFSET
            self._i2c.writeto_mem(self._i2c_address, mem_addr, b"\x00")
            return struct.unpack(
                "<i", self._i2c.readfrom_mem(self._i2c_address, mem_addr, 4)
            )[0]

        @property
        def pwm_duty(self):
            mem_addr = _MEM_ADDR_PWM_DUTY + self._index * _MOTOR_STATE_OFFSET
            self._i2c.writeto_mem(self._i2c_address, mem_addr, b"\x00")
            return struct.unpack(
                "<h", self._i2c.readfrom_mem(self._i2c_address, mem_addr, 2)
            )[0]

    def __init__(self, scl_pin, sda_pin, i2c_address=DEFAULT_I2C_ADDRESS):
        self._i2c = I2C(0, scl=Pin(scl_pin), sda=Pin(sda_pin))
        self._i2c_address = i2c_address
        self._motors = []
        for i in range(MOTOR_NUM):
            self._motors.append(MD40.Motor(i, self._i2c, i2c_address))

    def __getitem__(self, index):
        return self._motors[index]

    @property
    def firmware_version(self):
        version = self._i2c.readfrom_mem(self._i2c_address, _MEM_ADDR_MAJOR_VERSION, 3)
        return f"{version[0]}.{version[1]}.{version[2]}"

    @property
    def device_id(self):
        return self._i2c.readfrom_mem(self._i2c_address, _MEM_ADDR_DEVICE_ID, 1)[0]

    @property
    def name(self):
        return self._i2c.readfrom_mem(self._i2c_address, _MEM_ADDR_NAME, 8).decode(
            "utf-8"
        )
