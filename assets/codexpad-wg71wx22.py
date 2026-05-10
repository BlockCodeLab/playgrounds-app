import bluetooth
import struct
import aioble
import asyncio
from collections import deque
from micropython import const

__version__ = "2.3.0"

TX_POWER_MINUS_16_DBM = const(-16)
TX_POWER_MINUS_12_DBM = const(-12)
TX_POWER_MINUS_8_DBM = const(-8)
TX_POWER_MINUS_5_DBM = const(-5)
TX_POWER_MINUS_3_DBM = const(-3)
TX_POWER_MINUS_1_DBM = const(-1)
TX_POWER_0_DBM = const(0)
TX_POWER_1_DBM = const(1)
TX_POWER_2_DBM = const(2)
TX_POWER_3_DBM = const(3)
TX_POWER_4_DBM = const(4)
TX_POWER_5_DBM = const(5)
TX_POWER_6_DBM = const(6)

BUTTON_UP = const(1 << 0)
BUTTON_DOWN = const(1 << 1)
BUTTON_LEFT = const(1 << 2)
BUTTON_RIGHT = const(1 << 3)
BUTTON_SQUARE_X = const(1 << 4)
BUTTON_TRIANGLE_Y = const(1 << 5)
BUTTON_CROSS_A = const(1 << 6)
BUTTON_CIRCLE_B = const(1 << 7)
BUTTON_L1 = const(1 << 8)
BUTTON_L2 = const(1 << 9)
BUTTON_L3 = const(1 << 10)
BUTTON_R1 = const(1 << 11)
BUTTON_R2 = const(1 << 12)
BUTTON_R3 = const(1 << 13)
BUTTON_SELECT = const(1 << 14)
BUTTON_START = const(1 << 15)
BUTTON_HOME = const(1 << 16)

AXIS_LEFT_STICK_X = const(0)
AXIS_LEFT_STICK_Y = const(1)
AXIS_RIGHT_STICK_X = const(2)
AXIS_RIGHT_STICK_Y = const(3)

AXIS_CENTER = const(0x80)

_GAP_SERVICE_UUID = bluetooth.UUID(0x1800)
_GAP_DEVICE_NAME_UUID = bluetooth.UUID(0x2A00)

_INPUTS_SERVICE_UUID = bluetooth.UUID(0xFFA0)
_INPUTS_CHARACTERISTIC_UUID = bluetooth.UUID(0xFFA1)

_DEVICE_INFO_SERVICE_UUID = bluetooth.UUID(0x180A)
_MODEL_NUMBER_STRING_UUID = bluetooth.UUID(0x2A24)
_SERIAL_NUMBER_STRING_UUID = bluetooth.UUID(0x2A25)
_FIRMWARE_REVISION_STRING_UUID = bluetooth.UUID(0x2A26)
_MANUFACTURER_NAME_STRING_UUID = bluetooth.UUID(0x2A29)

_TX_POWER_SERVICE_UUID = bluetooth.UUID(0x1804)
_TX_POWER_CHARACTERISTIC_UUID = bluetooth.UUID(0x2A07)

_MANUFACTURER_HEADER = "CodexPad".encode("utf-8")

_BUTTON_STATE_UNPACK_FMT = "I"
_FIRMWARE_VERSION_UNPACK_FMT = "BBB"
_MANUFACTURER_HEADER_UNPACK_FMT = "B" * len(_MANUFACTURER_HEADER)

_MANUFACTURER_FIRMWARE_VERSION_LENGTH = len(_FIRMWARE_VERSION_UNPACK_FMT)
_MANUFACTURER_DATA_LENGTH = len(_MANUFACTURER_HEADER) + _MANUFACTURER_FIRMWARE_VERSION_LENGTH + 4 + 1
_MANUFACTURER_DATA_UNPACK_FMT = "<" + _MANUFACTURER_HEADER_UNPACK_FMT + _FIRMWARE_VERSION_UNPACK_FMT + _BUTTON_STATE_UNPACK_FMT + "B"

_AXIS_VALUE_UNPACK_FMT = "BBBB"
_INPUTS_UNPACK_FMT = "<" + _BUTTON_STATE_UNPACK_FMT + _AXIS_VALUE_UNPACK_FMT
_INPUTS_DATA_LENGTH = 8


class CodexPadNotFoundError(Exception):
    pass


class CodexPad:

    class Inputs:

        def __init__(self):
            self.button_states = 0
            self.axis_values = [AXIS_CENTER, AXIS_CENTER, AXIS_CENTER, AXIS_CENTER]

        def parse_and_set(self, data: bytes):
            if not data or len(data) != _INPUTS_DATA_LENGTH:
                return
            [
                self.button_states,
                self.axis_values[AXIS_LEFT_STICK_X],
                self.axis_values[AXIS_LEFT_STICK_Y],
                self.axis_values[AXIS_RIGHT_STICK_X],
                self.axis_values[AXIS_RIGHT_STICK_Y],
            ] = struct.unpack(_INPUTS_UNPACK_FMT, data)

        def assign(self, other):
            self.button_states = other.button_states
            self.axis_values = other.axis_values[:]

    def __init__(self):
        self._remote_model_number = None
        self._remote_device_name = None
        self._remote_firmware_version = None
        self._connection = None
        self._inputs_characteristic = None
        self._tx_power_characteristic = None
        self._prev_inputs = CodexPad.Inputs()
        self._current_inputs = CodexPad.Inputs()

    async def _reset(self):
        self._remote_model_number = None
        self._remote_device_name = None
        self._remote_firmware_version = None
        if self._connection:
            await self._connection.disconnect()
        self._connection = None
        self._inputs_characteristic = None
        self._tx_power_characteristic = None
        self._prev_inputs = CodexPad.Inputs()
        self._current_inputs = CodexPad.Inputs()

    async def scan_and_connect(self, button_mask, scan_duration_ms=1000, connect_timeout_ms=5000):
        rssi = None
        device = None
        async with aioble.scan(scan_duration_ms, interval_us=50000, window_us=20000, active=True) as scanner:
            async for result in scanner:
                if not result.name() or not result.name().startswith("CodexPad-"):
                    continue

                if not result.manufacturer():
                    continue

                if not result.rssi:
                    continue

                mfr_data = list(result.manufacturer(0xFFFF))
                if mfr_data is None or len(mfr_data) == 0:
                    continue

                manufacturer_data = mfr_data[0][1]

                if len(manufacturer_data) < _MANUFACTURER_DATA_LENGTH:
                    continue

                unpacked = struct.unpack(_MANUFACTURER_DATA_UNPACK_FMT, manufacturer_data[:_MANUFACTURER_DATA_LENGTH])

                header_bytes = bytes(unpacked[: len(_MANUFACTURER_HEADER)])

                if header_bytes != _MANUFACTURER_HEADER:
                    continue

                firmware_version = bytes(unpacked[len(_MANUFACTURER_HEADER) : len(_MANUFACTURER_HEADER) + _MANUFACTURER_FIRMWARE_VERSION_LENGTH])
                # print(f"Found CodexPad device: {result.name()}, address: {result.device}, rssi: {result.rssi}, manufacturer_data: {manufacturer_data}, firmware_version: {firmware_version}")

                button_state = unpacked[len(_MANUFACTURER_HEADER) + _MANUFACTURER_FIRMWARE_VERSION_LENGTH]

                if button_state != button_mask:
                    continue

                button_states_duration_seconds = unpacked[-1]
                # print(f"button_states_duration_seconds: {button_states_duration_seconds}")

                if firmware_version[0] > 1 and button_states_duration_seconds < 1:
                    continue

                if device is None or result.rssi > rssi:
                    rssi = result.rssi
                    device = result.device

                    # print(
                    #     f"Found CodexPad device: {result.name()}, address: {result.device}, rssi: {result.rssi}, manufacturer_data: {manufacturer_data}, button_state: 0x{button_state:08X}"
                    # )
        if not device:
            raise CodexPadNotFoundError(f"No CodexPad device found with button mask 0x{button_mask:08X}")

        await self._connect(device, connect_timeout_ms)

    async def connect(self, bluetooth_device_address, timeout_ms):
        await self._connect(aioble.Device(aioble.ADDR_PUBLIC, bluetooth_device_address), timeout_ms)

    async def _connect(self, device, timeout_ms):
        await self._reset()
        try:
            self._connection = await device.connect(timeout_ms=timeout_ms, scan_duration_ms=1000)

            gap_service = await self._connection.service(_GAP_SERVICE_UUID)
            device_name_characteristic = await gap_service.characteristic(_GAP_DEVICE_NAME_UUID)
            self._remote_device_name = (await device_name_characteristic.read()).decode("utf-8")

            device_info_service = await self._connection.service(_DEVICE_INFO_SERVICE_UUID)
            model_number_characteristic = await device_info_service.characteristic(_MODEL_NUMBER_STRING_UUID)
            self._remote_model_number = (await model_number_characteristic.read()).decode("utf-8")

            firmware_revision_characteristic = await device_info_service.characteristic(_FIRMWARE_REVISION_STRING_UUID)
            self._remote_firmware_version = tuple(struct.unpack(_FIRMWARE_VERSION_UNPACK_FMT, (await firmware_revision_characteristic.read())))

            tx_power_service = await self._connection.service(_TX_POWER_SERVICE_UUID)
            tx_power_characteristic = await tx_power_service.characteristic(_TX_POWER_CHARACTERISTIC_UUID)
            self._tx_power_characteristic = tx_power_characteristic

            inputs_service = await self._connection.service(_INPUTS_SERVICE_UUID)
            inputs_characteristic = await inputs_service.characteristic(_INPUTS_CHARACTERISTIC_UUID)
            await inputs_characteristic.subscribe(notify=True)
            inputs_characteristic._notify_queue = deque((), 5)
            self._inputs_characteristic = inputs_characteristic
        except Exception as e:
            await self._reset()
            raise e

    async def disconnect(self):
        await self._reset()

    async def set_remote_tx_power(self, tx_power):
        """
        设置远程设备（手柄）的蓝牙发射功率。
        Set the Bluetooth transmission power of the remote device (controller).

        参数/Parameter tx_power: 发射功率等级，单位为 dBm。必须为以下预定义常量之一：
                               Transmission power level in dBm. Must be one of the following predefined constants:
                               - `TX_POWER_MINUS_16_DBM`  (-16 dBm)
                               - `TX_POWER_MINUS_12_DBM`  (-12 dBm)
                               - `TX_POWER_MINUS_8_DBM`   ( -8 dBm)
                               - `TX_POWER_MINUS_5_DBM`   ( -5 dBm)
                               - `TX_POWER_MINUS_3_DBM`   ( -3 dBm)
                               - `TX_POWER_MINUS_1_DBM`   ( -1 dBm)
                               - `TX_POWER_0_DBM`         (  0 dBm)
                               - `TX_POWER_1_DBM`         (  1 dBm)
                               - `TX_POWER_2_DBM`         (  2 dBm)
                               - `TX_POWER_3_DBM`         (  3 dBm)
                               - `TX_POWER_4_DBM`         (  4 dBm)
                               - `TX_POWER_5_DBM`         (  5 dBm)
                               - `TX_POWER_6_DBM`         (  6 dBm)

        发射功率影响通信距离和功耗：功率越高，通信距离越远，但功耗也越大。
        Transmission power affects communication range and power consumption:
        Higher power provides longer range but consumes more battery.

        建议根据实际应用场景选择合适的功率等级以平衡距离和电池寿命。
        Choose an appropriate power level based on your application to balance range and battery life.

        抛出/Raises:
            ValueError: 如果 `tx_power` 不是上述预定义的功率常量之一。
                   If `tx_power` is not one of the predefined power constants above.
        """
        _VALID_TX_POWER_VALUES = {
            TX_POWER_MINUS_16_DBM,
            TX_POWER_MINUS_12_DBM,
            TX_POWER_MINUS_8_DBM,
            TX_POWER_MINUS_5_DBM,
            TX_POWER_MINUS_3_DBM,
            TX_POWER_MINUS_1_DBM,
            TX_POWER_0_DBM,
            TX_POWER_1_DBM,
            TX_POWER_2_DBM,
            TX_POWER_3_DBM,
            TX_POWER_4_DBM,
            TX_POWER_5_DBM,
            TX_POWER_6_DBM,
        }

        if tx_power not in _VALID_TX_POWER_VALUES:
            raise ValueError(f"Invalid tx_power value: {tx_power}")

        await self._tx_power_characteristic.write(struct.pack("<b", tx_power), timeout_ms=5000)

    @property
    def remote_device_name(self):
        return self._remote_device_name

    @property
    def remote_model_number(self):
        return self._remote_model_number

    @property
    def remote_firmware_version(self):
        return self._remote_firmware_version

    @property
    def remote_firmware_version_major(self):
        return self._remote_firmware_version[0]

    @property
    def remote_firmware_version_minor(self):
        return self._remote_firmware_version[1]

    @property
    def remote_firmware_version_patch(self):
        return self._remote_firmware_version[2]

    @property
    def remote_bluetooth_device_address(self):
        return self._connection.device.addr_hex().upper()

    @property
    def is_connected(self):
        return self._connection and self._connection.is_connected()

    async def update(self):
        self._prev_inputs.assign(self._current_inputs)

        if self._connection == None or self._inputs_characteristic == None or not self._connection.is_connected():
            return

        try:
            self._current_inputs.parse_and_set(await self._inputs_characteristic.notified(timeout_ms=1))
        except Exception:
            pass

    def pressed(self, button):
        return ((self._prev_inputs.button_states & button) == 0) and ((self._current_inputs.button_states & button) != 0)

    def released(self, button):
        return ((self._prev_inputs.button_states & button) != 0) and ((self._current_inputs.button_states & button) == 0)

    def holding(self, button):
        return ((self._prev_inputs.button_states & button) != 0) and ((self._current_inputs.button_states & button) != 0)

    def button_state(self, button):
        return (self._current_inputs.button_states & button) != 0

    @property
    def button_states(self) -> int:
        return self._current_inputs.button_states

    def axis_value(self, axis):
        return self._current_inputs.axis_values[axis]

    @property
    def axis_values(self):
        return tuple(self._current_inputs.axis_values)

    def _has_axis_value_changed_significantly(self, prev_value, current_value, threshold):
        return prev_value != current_value and (current_value == 0 or current_value == 255 or abs(current_value - prev_value) >= threshold)

    def has_axis_value_changed(self, axis, threshold):
        return self._has_axis_value_changed_significantly(self._prev_inputs.axis_values[axis], self._current_inputs.axis_values[axis], threshold)
