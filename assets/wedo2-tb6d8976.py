from micropython import const
from scratch import runtime, when_start
from device.ble import BLE
import colorsys
import asyncio
import struct
import math
import time

# service uuids
DEVICE_SERVICE = "00001523-1212-efde-1523-785feabcd123"
IO_SERVICE = "00004f0e-1212-efde-1523-785feabcd123"

# characteristic uuids
ATTACHED_IO = "00001527-1212-efde-1523-785feabcd123"
LOW_VOLTAGE_ALERT = "00001528-1212-efde-1523-785feabcd123"
INPUT_VALUES = "00001560-1212-efde-1523-785feabcd123"
INPUT_COMMAND = "00001563-1212-efde-1523-785feabcd123"
OUTPUT_COMMAND = "00001565-1212-efde-1523-785feabcd123"

# sensor and output tyoes
DEVICE_MOTOR = const(1)
DEVICE_PIEZO = const(22)
DEVICE_LED = const(23)
DEVICE_TILT = const(34)
DEVICE_DISTANCE = const(35)

# connection/port ids
CONNECT_ID_LED = const(6)
CONNECT_ID_PIEZO = const(5)

# ids for various output commands
COMMAND_MOTOR_POWER = const(1)
COMMAND_PLAY_TONE = const(2)
COMMAND_STOP_TONE = const(3)
COMMAND_WRITE_RGB = const(4)
COMMAND_SET_VOLUME = const(255)

# modes for input sensors
MODE_TILT = const(0)  # angle
MODE_DISTANCE = const(0)  # detect
MODE_LED = const(1)  # RGB

# units for input sensors
UNIT_TILT = const(0)
UNIT_DISTANCE = const(1)
UNIT_LED = const(0)


def generate_output_command(connect_id, command_id, values=None):
    command = [connect_id, command_id]
    if values:
        command.append(len(values))
        command.extend(values)
    return bytes(command)


def generate_input_command(connect_id, type, mode, delta, units, enable_notified):
    enable_notified = 1 if enable_notified else 0
    command = [
        1,  # Command ID = 1 = "Sensor Format"
        2,  # Command Type = 2 = "Write"
        connect_id,
        type,
        mode,
        delta,
        0,  # Delta Interval Byte 2
        0,  # Delta Interval Byte 3
        0,  # Delta Interval Byte 4
        units,
        enable_notified,
    ]
    return bytes(command)


class Motor:
    BRAKE_TIME_MS = 1000

    def __init__(self, wedo, index):
        self._wedo = wedo
        self._index = index
        self._direction = 1
        self._power = 100
        self._is_on = False
        self._pending_start = None
        self._pending_delay = None

    @property
    def direction(self):
        return self._direction

    @direction.setter
    def direction(self, value):
        if value < 0:
            self._direction = -1
        else:
            self._direction = 1

    @property
    def power(self):
        return self._power

    @power.setter
    def power(self, value):
        p = max(0, min(value, 100))
        # Lego Wedo 2.0 hub only turns motors at power range [30 - 100], so
        # map value from [0 - 100] to [30 - 100].
        if p == 0:
            self._power = 0
        else:
            self._power = round(30 + (70 / (100 / p)))

    @property
    def is_on(self):
        return self._is_on

    @property
    def pending_start(self):
        return self._pending_start

    @property
    def pending_delay(self):
        return self._pending_delay

    async def turn_on(self):
        if self._power == 0:
            return
        cmd = generate_output_command(
            self._index + 1,
            COMMAND_MOTOR_POWER,
            struct.pack("b", self._power * self._direction),  # power in range 0-100
        )
        await self._wedo.send(OUTPUT_COMMAND, cmd)
        self._is_on = True

    async def turn_on_for(self, delay):
        if self._power == 0:
            return
        self._pending_start = time.ticks_ms()
        self._pending_delay = delay
        await self.turn_on()
        await asyncio.sleep_ms(delay)
        await self.start_braking()

    async def start_braking(self):
        if self._power == 0:
            return

        cmd = generate_output_command(
            self._index + 1, COMMAND_MOTOR_POWER, [127]  # 127 = break
        )
        await self._wedo.send(OUTPUT_COMMAND, cmd)
        self._is_on = False
        self._pending_start = None
        self._pending_delay = None

        await asyncio.sleep_ms(Motor.BRAKE_TIME_MS)
        if not self._is_on:
            await self.turn_off()

    async def turn_off(self, limiter=True):
        if self._power == 0:
            return
        cmd = generate_output_command(
            self._index + 1, COMMAND_MOTOR_POWER, [0]  # 0 = stop
        )
        await self._wedo.send(OUTPUT_COMMAND, cmd, limiter)
        self._is_on = False
        self._pending_start = None
        self._pending_delay = None


class Wedo2:
    def __init__(self):
        runtime.when_stop(self.stop_all)
        self._ble = BLE(self.reset)
        self._ports = [None, None]
        self._motors = [None, None]
        self._tilt_x = 0
        self._tilt_y = 0
        self._distance = 0

    @property
    def ble(self):
        return self._ble

    @property
    def tilt_x(self):
        return self._tilt_x

    @property
    def tilt_y(self):
        return self._tilt_y

    @property
    def distance(self):
        return self._distance

    def motor(self, index):
        return self._motors[index]

    def stop_all_motors(self):
        for motor in self._motors:
            if motor:
                motor.turn_off(False)

    async def set_led(self, *rgb):
        cmd = generate_output_command(CONNECT_ID_LED, COMMAND_WRITE_RGB, rgb)
        await self.send(OUTPUT_COMMAND, cmd)

    async def set_led_mode(self):
        cmd = generate_input_command(
            CONNECT_ID_LED, DEVICE_LED, MODE_LED, 0, UNIT_LED, False
        )
        await self.send(INPUT_COMMAND, cmd)

    async def stop_led(self):
        cmd = generate_output_command(CONNECT_ID_LED, COMMAND_WRITE_RGB, [0, 0, 0])
        await self.send(OUTPUT_COMMAND, cmd)

    def stop_all(self):
        if self.is_connected:
            self.stop_all_motors()

    async def scan(self):
        if self.is_connected:
            return
        filters = [{"services": [DEVICE_SERVICE]}]
        await self.ble.scan(self._scan_handle, filters, timeout=0)

    async def connect(self, device):
        await self.ble.connect(device)
        await self.ble.notified(DEVICE_SERVICE, ATTACHED_IO, self._notified_handle)
        await self.set_led_mode()
        await self.set_led(0, 0, 255)
        await self._heartbeat()

    def disconnect(self):
        asyncio.create_task(self.ble.disconnect())

    def reset(self):
        self._ports = [None, None]
        self._motors = [None, None]
        self._tilt_x = 0
        self._tilt_y = 0
        self._distance = 0

    @property
    def is_connected(self):
        return self.ble.is_connected

    async def send(self, uuid, msg, limiter=True):
        if not self.is_connected:
            return
        if limiter:
            pass
        await self.ble.write(IO_SERVICE, uuid, msg)

    def _scan_handle(self, result):
        device = result[-1]
        self.ble.stop_scan()
        asyncio.create_task(self.connect(device))

    async def _heartbeat(self):
        while self.is_connected:
            await asyncio.sleep_ms(5000)
            await self.ble.read(DEVICE_SERVICE, LOW_VOLTAGE_ALERT)

    def _notified_handle(self, data):
        print(data, data[0])
        if data[0] == 1 or data[0] == 2:
            connect_id = data[0]
            if data[1] == 0:
                self._clear_port(connect_id)
            else:
                asyncio.create_task(self._register_port(connect_id, data[3]))
        else:
            connect_id = data[1]
            type = self._ports[connect_id - 1]
            if type == DEVICE_DISTANCE:
                self._distance = data[2]
            if type == DEVICE_TILT:
                self._tilt_x = data[2]
                self._tilt_y = data[3]

    async def _register_port(self, connect_id, type):
        # Record which port is connected to what type of device
        self._ports[connect_id - 1] = type

        # Record motor port
        if type == DEVICE_MOTOR:
            self._motors[connect_id - 1] = Motor(self, connect_id - 1)
            print(self._motors)
        else:
            # Set input format for tilt or distance sensor
            mode = MODE_DISTANCE
            unit = UNIT_DISTANCE
            if type == DEVICE_TILT:
                mode = MODE_TILT
                unit = UNIT_TILT
            cmd = generate_input_command(connect_id, type, mode, 1, unit, True)

            await self.send(INPUT_COMMAND, cmd)
            await self.ble.notified(IO_SERVICE, INPUT_VALUES, self._notified_handle)

    def _clear_port(self, connect_id):
        type = self._ports[connect_id - 1]
        if type == DEVICE_TILT:
            self._tilt_x = 0
            self._tilt_y = 0
        if type == DEVICE_DISTANCE:
            self._distance = 0
        self._ports[connect_id - 1] = None
        self._motors[connect_id - 1] = None


BLESendInterval = 100
wedo2 = Wedo2()
motor_tasks = [None, None]


@when_start
async def scan():
    await wedo2.scan()


async def motor_on(indexes):
    for i in indexes:
        if motor_tasks[i]:
            motor_tasks[i].cancel()
        motor = wedo2.motor(i)
        if motor:
            asyncio.create_task(motor.turn_on())
    await asyncio.sleep_ms(BLESendInterval)


async def motor_on_for(indexes, sec):
    sec = min(max(sec, 0), 15)
    for i in indexes:
        if motor_tasks[i]:
            motor_tasks[i].cancel()
        motor = wedo2.motor(i)
        if motor:
            motor_tasks[i] = asyncio.create_task(motor.turn_on_for(int(sec * 1000)))
    await asyncio.sleep(sec)


async def motor_off(indexes):
    for i in indexes:
        if motor_tasks[i]:
            motor_tasks[i].cancel()
        motor = wedo2.motor(i)
        if motor:
            asyncio.create_task(motor.turn_off())
    await asyncio.sleep_ms(BLESendInterval)


async def start_motor_power(indexes, power):
    for i in indexes:
        if motor_tasks[i]:
            motor_tasks[i].cancel()
        motor = wedo2.motor(i)
        if motor:
            motor.power = power
            asyncio.create_task(motor.turn_on())
    await asyncio.sleep_ms(BLESendInterval)


async def set_motor_direction(indexes, direction):
    if direction != 0:
        for i in indexes:
            motor = wedo2.motor(i)
            if motor:
                if direction == 255:
                    motor.direction = -motor.direction
                else:
                    motor.direction = direction
                if motor.is_on:
                    if motor.pending_delay:
                        delay = time.ticks_diff(
                            motor.pending_start + motor.pending_delay, time.ticks_ms()
                        )
                        print(delay)
                        if delay > 0:
                            if motor_tasks[i]:
                                motor_tasks[i].cancel()
                            motor_tasks[i] = asyncio.create_task(
                                motor.turn_on_for(delay)
                            )
                    else:
                        if motor_tasks[i]:
                            motor_tasks[i].cancel()
                        asyncio.create_task(motor.turn_on())
    await asyncio.sleep_ms(BLESendInterval)


async def set_led(hue):
    hue = hue - (math.floor(hue / 101) * 101)
    hue /= 100
    r, g, b = colorsys.hsv_to_rgb(hue, 1, 1)
    r = round(r * 255)
    g = round(g * 255)
    b = round(b * 255)
    asyncio.create_task(wedo2.set_led(r, g, b))
    await asyncio.sleep_ms(BLESendInterval)


def when_distance(op, reference, hanlder):
    pass


def is_tilted(direction):
    pass


def when_tilted(direction, hanlder):
    pass


def get_distance():
    pass


def get_tilt_angle(direction):
    pass
