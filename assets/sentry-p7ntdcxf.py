import struct
from time import sleep_ms

# =========================== 常量定义 ===========================

SENTRY_FIRMWARE_VERSION = 0xFF
SENTRY_MAX_RESULT = 25

SENTRY_OK = 0x00
SENTRY_FAIL = 0x01
SENTRY_WRITE_TIMEOUT = 0x02
SENTRY_READ_TIMEOUT = 0x03
SENTRY_CHECK_ERROR = 0x04
SENTRY_UNSUPPORT_PARAM = 0x10
SENTRY_UNKNOWN_PROTOCOL = 0x11

# Protocol Error Type
SENTRY_PROTOC_OK = 0xE0
SENTRY_PROTOC_FAIL = 0xE1
SENTRY_PROTOC_UNKNOWN = 0xE2
SENTRY_PROTOC_TIMEOUT = 0xE3
SENTRY_PROTOC_CHECK_ERROR = 0xE4
SENTRY_PROTOC_LENGTH_ERROR = 0xE5
SENTRY_PROTOC_UNSUPPORT_COMMAND = 0xE6
SENTRY_PROTOC_UNSUPPORT_REG_ADDRESS = 0xE7
SENTRY_PROTOC_UNSUPPORT_REG_VALUE = 0xE8
SENTRY_PROTOC_READ_ONLY = 0xE9
SENTRY_PROTOC_RESTART_ERROR = 0xEA
SENTRY_PROTOC_RESULT_NOT_END = 0xEC

# Protocol
SENTRY_PROTOC_START = 0xFF
SENTRY_PROTOC_END = 0xED
SENTRY_PROTOC_COMMAND_SET = 0x01
SENTRY_PROTOC_COMMAND_GET = 0x02
SENTRY_PROTOC_SET_PARAM = 0x21
SENTRY_PROTOC_GET_RESULT = 0x23
SENTRY_PROTOC_MESSAGE = 0x11
SENTRY_PROTOC_GET_STRING = 0x27

# sentry_reg (寄存器地址)
kRegDeviceId = 0x01
kRegFirmwareVersion = 0x02
kRegRestart = 0x03
kRegSensorConfig1 = 0x04
kRegLock = 0x05
kRegLed = 0x06
kRegLedLevel = 0x08
kRegUart = 0x09
kRegUSBCongig = 0x0B
kRegLcdConfig = 0x0C
kRegHWConfig = 0x0F
kRegCameraConfig1 = 0x10
kRegCameraConfig2 = 0x11
kRegCameraConfig3 = 0x12
kRegCameraConfig4 = 0x13
kRegCameraConfig5 = 0x14
kRegFrameWidthH = 0x1B
kRegFrameWidthL = 0x1C
kRegFrameHeightH = 0x1D
kRegFrameHeightL = 0x1E
kRegFrameCount = 0x1F
kRegVisionId = 0x20
kRegVisionConfig1 = 0x21
kRegVisionConfig2 = 0x22
kRegParamNum = 0x23
kRegParamId = 0x24
kRegVisionStatus1 = 0x2A
kRegVisionStatus2 = 0x2B
kRegVisionDetect1 = 0x30
kRegVisionDetect2 = 0x31
kRegResultNumber = 0x34
kRegResultId = 0x35
kRegReadStatus1 = 0x36
kRegStringNum = 0x6A
kRegStringData = 0x6C
kRegStringRxAll = 0x6E
kRegParamValue1H = 0x70
kRegParamValue1L = 0x71
kRegParamValue2H = 0x72
kRegParamValue2L = 0x73
kRegParamValue3H = 0x74
kRegParamValue3L = 0x75
kRegParamValue4H = 0x76
kRegParamValue4L = 0x77
kRegParamValue5H = 0x78
kRegParamValue5L = 0x79
kRegResultData1H = 0x80
kRegResultData1L = 0x81
kRegResultData2H = 0x82
kRegResultData2L = 0x83
kRegResultData3H = 0x84
kRegResultData3L = 0x85
kRegResultData4H = 0x86
kRegResultData4L = 0x87
kRegResultData5H = 0x88
kRegResultData5L = 0x89
kRegSn = 0xD0

# UART 协议结果数据包中的偏移量常量
_RES_OFFSET_DATA1_H = 6
_RES_OFFSET_DATA1_L = 7
_RES_OFFSET_DATA2_H = 8
_RES_OFFSET_DATA2_L = 9
_RES_OFFSET_DATA3_H = 10
_RES_OFFSET_DATA3_L = 11
_RES_OFFSET_DATA4_H = 12
_RES_OFFSET_DATA4_L = 13
_RES_OFFSET_DATA5_H = 14
_RES_OFFSET_DATA5_L = 15
_RES_OFFSET_QR_START = 17

# =========================== 辅助类 ===========================

LOG_OFF = 60
LOG_CRITICAL = 50
LOG_ERROR = 40
LOG_WARNING = 30
LOG_INFO = 20
LOG_DEBUG = 10
LOG_NOTSET = 0

_global_log_level = LOG_INFO


class SentryLogger:
    def __init__(self):
        self._level = _global_log_level

    def setLevel(self, level):
        global _global_log_level
        _global_log_level = level

    def isEnabledFor(self, level):
        return level >= _global_log_level

    def log(self, name, level, msg, *args):
        if self.isEnabledFor(level):
            levelname = self._level_str(level)
            msgformat = ["%s.%s:" % (name, levelname)]
            if isinstance(msg, str) and args:
                try:
                    msgformat.append(msg % args)
                except TypeError:
                    msgformat.append(msg)
                    msgformat.extend(args)
            else:
                msgformat.append(msg)
                msgformat.extend(args)
            print(*msgformat, sep=" ")

    @staticmethod
    def _level_str(level):
        levels = {
            LOG_CRITICAL: "CRIT",
            LOG_ERROR: "ERROR",
            LOG_WARNING: "WARN",
            LOG_INFO: "INFO",
            LOG_DEBUG: "DEBUG",
        }
        return levels.get(level, f"LVL{level}")


class result:
    __slots__ = ("data1", "data2", "data3", "data4", "data5", "bytestr")

    def __init__(self):
        self.data1 = 0
        self.data2 = 0
        self.data3 = 0
        self.data4 = 0
        self.data5 = 0
        self.bytestr = ""

    def __str__(self):
        return str([self.data1, self.data2, self.data3, self.data4, self.data5])


class VisionState:
    __slots__ = ("vision_type", "frame", "detect", "result")

    def __init__(self, vision_type):
        self.vision_type = vision_type
        self.frame = 0
        self.detect = 0
        self.result = [result() for _ in range(SENTRY_MAX_RESULT)]

    def sortd(self):
        for i in range(self.detect - 1):
            for j in range(self.detect - i - 1):
                if self._compare(self.result[j], self.result[j + 1]) > 0:
                    self.result[j], self.result[j + 1] = (
                        self.result[j + 1],
                        self.result[j],
                    )
        print("sortd:", self.detect)
        for k in range(self.detect):
            print(self.result[k])

    @staticmethod
    def _compare(r1, r2):
        d1 = max(r1.data4, r2.data4) // 4
        d2 = abs(r1.data2 - r2.data2)
        if d2 < d1:
            return -1 if r1.data1 < r2.data1 else 1
        else:
            return -1 if r1.data2 < r2.data2 else 1


# =========================== I2C 通信类 ===========================


class SentryI2CMethod:
    def __init__(self, address, communication_port, logger=None):
        self._addr = address
        self._port = communication_port
        self._logger = logger
        if address not in communication_port.scan():
            raise ValueError(
                f"SentryI2CMethod Init Error!!! address {address:#x} cannot found!"
            )

    def _log(self, level, msg, *args):
        if self._logger:
            self._logger(self.__class__.__name__, level, msg, *args)

    def Set(self, reg_address, value):
        data = struct.pack("<b", value)
        self._port.writeto_mem(self._addr, reg_address, data)
        self._log(LOG_DEBUG, "set-> reg:%#x var:%#x", reg_address, value)
        return SENTRY_OK

    def Get(self, reg_address):
        data = struct.pack("<b", reg_address)
        self._port.writeto(self._addr, data)
        value = self._port.readfrom(self._addr, 1)
        if value:
            self._log(LOG_DEBUG, "Get-> reg:%#x var:%#x", reg_address, value[0])
            return (SENTRY_OK, value[0])
        else:
            self._log(LOG_ERROR, "Get-> reg:%#x TimeOut!", reg_address)
            return (SENTRY_READ_TIMEOUT, 0)

    def _get_result_data(self, reg_l, reg_h):
        err, low = self.Get(reg_l)
        if err:
            return err, 0
        err, high = self.Get(reg_h)
        if err:
            return err, 0
        return SENTRY_OK, (high << 8) | low

    def Read(self, vision_type, vision_state, is_qr=False):
        err = self.Set(kRegVisionId, vision_type)
        if err:
            return err, vision_state
        err, vision_state.frame = self.Get(kRegFrameCount)
        if err:
            return err, vision_state
        err, vision_state.detect = self.Get(kRegResultNumber)
        if err:
            return err, vision_state
        if not vision_state.detect:
            return SENTRY_OK, vision_state

        vision_state.detect = min(vision_state.detect, SENTRY_MAX_RESULT)
        if is_qr:
            vision_state.detect = 1

        for i in range(vision_state.detect):
            err = self.Set(kRegResultId, i + 1)
            if err:
                return err, vision_state
            err, vision_state.result[i].data1 = self._get_result_data(
                kRegResultData1L, kRegResultData1H
            )
            if err:
                return err, vision_state
            err, vision_state.result[i].data2 = self._get_result_data(
                kRegResultData2L, kRegResultData2H
            )
            if err:
                return err, vision_state
            err, vision_state.result[i].data3 = self._get_result_data(
                kRegResultData3L, kRegResultData3H
            )
            if err:
                return err, vision_state
            err, vision_state.result[i].data4 = self._get_result_data(
                kRegResultData4L, kRegResultData4H
            )
            if err:
                return err, vision_state
            err, vision_state.result[i].data5 = self._get_result_data(
                kRegResultData5L, kRegResultData5H
            )
            if err:
                return err, vision_state

            if is_qr:
                byt = bytearray()
                for j in range(vision_state.result[i].data5):
                    result_id = j // 5 + 2
                    offset = j % 5
                    if offset == 0:
                        err = self.Set(kRegResultId, result_id)
                        if err:
                            return err, vision_state
                    err, bytec = self.Get(kRegResultData1L + 2 * offset)
                    if err:
                        return err, vision_state
                    byt.append(bytec)
                vision_state.result[i].bytestr = byt.decode("utf-8", "replace")
        return SENTRY_OK, vision_state

    def SetParam(self, vision_id, param, param_id):
        err = self.Set(kRegVisionId, vision_id)
        if err:
            return err
        err = self.Set(kRegParamId, param_id)
        if err:
            return err
        self.Set(kRegParamValue1H, param[0])
        self.Set(kRegParamValue1L, param[1])
        self.Set(kRegParamValue2H, param[2])
        self.Set(kRegParamValue2L, param[3])
        self.Set(kRegParamValue3H, param[4])
        self.Set(kRegParamValue3L, param[5])
        self.Set(kRegParamValue4H, param[6])
        self.Set(kRegParamValue4L, param[7])
        self.Set(kRegParamValue5H, param[8])
        self.Set(kRegParamValue5L, param[9])
        return SENTRY_OK

    def ReadString(self, vision_type, obj_id, vision_state):
        return SENTRY_UNSUPPORT_PARAM


# =========================== UART 通信类 ===========================


class SentryUartMethod:
    def __init__(self, address, communication_port, logger=None):
        self._addr = address
        self._port = communication_port
        self._logger = logger
        self._port.init(timeout=1000, timeout_char=10)

    def _log(self, level, msg, *args):
        if self._logger:
            self._logger(self.__class__.__name__, level, msg, *args)

    @staticmethod
    def _calc_checksum(data):
        chk = sum(data[:-2]) & 0xFF
        return chk == data[-2]

    def _read_packet(self):
        for _ in range(1000):
            if self._port.any() >= 6:
                break
            sleep_ms(1)
        else:
            self._log(LOG_ERROR, "Waiting for reception timeout")
            return SENTRY_PROTOC_TIMEOUT, []

        buf = bytearray()
        start_found = False
        while self._port.any():
            c = self._port.read(1)[0]
            if not start_found:
                if c == SENTRY_PROTOC_START:
                    start_found = True
                    buf.append(c)
            else:
                buf.append(c)
                if len(buf) == 2:
                    data_len = buf[1]
                if len(buf) >= 2 and len(buf) == data_len:
                    break

        if len(buf) < 2:
            return SENTRY_PROTOC_CHECK_ERROR, []
        data_len = buf[1]
        if data_len != len(buf):
            return SENTRY_PROTOC_CHECK_ERROR, []
        if buf[-1] != SENTRY_PROTOC_END:
            return SENTRY_PROTOC_CHECK_ERROR, []
        if not self._calc_checksum(buf):
            return SENTRY_PROTOC_CHECK_ERROR, []

        self._log(LOG_DEBUG, "    rev-> %s", " ".join(f"{b:02x}" for b in buf))
        return SENTRY_PROTOC_OK, buf[3:-2]

    def _send_command(self, cmd_bytes, expected_cmd, reg_addr=None):
        if self._port.any():
            self._port.read()
        self._port.write(cmd_bytes)
        for _ in range(3):
            err, data = self._read_packet()
            if err == SENTRY_PROTOC_OK:
                if data[0] == SENTRY_PROTOC_OK or data[1] == expected_cmd:
                    if reg_addr is None or data[2] == reg_addr:
                        return SENTRY_OK, data
            elif err != SENTRY_PROTOC_TIMEOUT:
                break
        return SENTRY_READ_TIMEOUT, []

    def Set(self, reg_address, value):
        data_list = [
            SENTRY_PROTOC_START,
            0,
            self._addr,
            SENTRY_PROTOC_COMMAND_SET,
            reg_address,
            value,
        ]
        data_list[1] = len(data_list) + 2
        chk = sum(data_list) & 0xFF
        data_list.append(chk)
        data_list.append(SENTRY_PROTOC_END)
        cmd = struct.pack(">" + "b" * len(data_list), *data_list)
        self._log(LOG_DEBUG, "Set req-> %s", " ".join(f"{b:02x}" for b in cmd))
        err, _ = self._send_command(cmd, SENTRY_PROTOC_COMMAND_SET, reg_address)
        return err

    def Get(self, reg_address):
        data_list = [
            SENTRY_PROTOC_START,
            0,
            self._addr,
            SENTRY_PROTOC_COMMAND_GET,
            reg_address,
        ]
        data_list[1] = len(data_list) + 2
        chk = sum(data_list) & 0xFF
        data_list.append(chk)
        data_list.append(SENTRY_PROTOC_END)
        cmd = struct.pack(">" + "b" * len(data_list), *data_list)
        self._log(LOG_DEBUG, "Get req-> %s", " ".join(f"{b:02x}" for b in cmd))
        err, data = self._send_command(cmd, SENTRY_PROTOC_COMMAND_GET)
        if err == SENTRY_OK:
            return SENTRY_OK, data[2]
        return err, 0

    def Read(self, vision_type, vision_state, is_qr=False):
        data_list = [
            SENTRY_PROTOC_START,
            0,
            self._addr,
            SENTRY_PROTOC_GET_RESULT,
            vision_type,
            0,
            0,
        ]
        data_list[1] = len(data_list) + 2
        chk = sum(data_list) & 0xFF
        data_list.append(chk)
        data_list.append(SENTRY_PROTOC_END)
        cmd = struct.pack(">" + "b" * len(data_list), *data_list)
        self._log(LOG_DEBUG, "Read req-> %s", " ".join(f"{b:02x}" for b in cmd))
        if self._port.any():
            self._port.read()
        self._port.write(cmd)

        vision_state.detect = 0
        try_count = 0
        while try_count < 3:
            err, data = self._read_packet()
            if err != SENTRY_PROTOC_OK:
                try_count += 1
                continue
            if data[0] not in (SENTRY_PROTOC_OK, SENTRY_PROTOC_RESULT_NOT_END):
                return SENTRY_UNSUPPORT_PARAM, vision_state
            if data[1] != SENTRY_PROTOC_GET_RESULT or data[3] != vision_type:
                return SENTRY_UNSUPPORT_PARAM, vision_state

            vision_state.frame = data[2]
            start_id = data[4]
            stop_id = data[5]
            if stop_id > SENTRY_MAX_RESULT:
                return SENTRY_UNSUPPORT_PARAM, vision_state
            if start_id == 0:
                return SENTRY_OK, vision_state

            if is_qr:
                vision_state.detect = 1
            else:
                vision_state.detect = stop_id - start_id + 1

            for i in range(vision_state.detect):
                idx = i + start_id - 1
                base = 10 * i
                vs = vision_state.result[idx]
                vs.data1 = (data[base + _RES_OFFSET_DATA1_H] << 8) | data[
                    base + _RES_OFFSET_DATA1_L
                ]
                vs.data2 = (data[base + _RES_OFFSET_DATA2_H] << 8) | data[
                    base + _RES_OFFSET_DATA2_L
                ]
                vs.data3 = (data[base + _RES_OFFSET_DATA3_H] << 8) | data[
                    base + _RES_OFFSET_DATA3_L
                ]
                vs.data4 = (data[base + _RES_OFFSET_DATA4_H] << 8) | data[
                    base + _RES_OFFSET_DATA4_L
                ]
                vs.data5 = (data[base + _RES_OFFSET_DATA5_H] << 8) | data[
                    base + _RES_OFFSET_DATA5_L
                ]
                if is_qr:
                    byt = bytearray()
                    for j in range(vs.data5):
                        byt.append(data[_RES_OFFSET_QR_START + 2 * j])
                    vs.bytestr = byt.decode("utf-8", "replace")

            if data[0] == SENTRY_PROTOC_RESULT_NOT_END:
                continue
            else:
                return SENTRY_OK, vision_state

        return SENTRY_READ_TIMEOUT, vision_state

    def SetParam(self, vision_id, param, param_id):
        data_list = [
            SENTRY_PROTOC_START,
            0,
            self._addr,
            SENTRY_PROTOC_SET_PARAM,
            vision_id,
            param_id,
            param_id,
        ]
        data_list.extend(param)
        data_list[1] = len(data_list) + 2
        chk = sum(data_list) & 0xFF
        data_list.append(chk)
        data_list.append(SENTRY_PROTOC_END)
        cmd = struct.pack(">" + "b" * len(data_list), *data_list)
        self._log(LOG_DEBUG, "SetParam req-> %s", " ".join(f"{b:02x}" for b in cmd))
        if self._port.any():
            self._port.read()
        self._port.write(cmd)
        for _ in range(3):
            err, data = self._read_packet()
            if err == SENTRY_PROTOC_OK:
                if data[0] == SENTRY_PROTOC_OK and data[1] == SENTRY_PROTOC_SET_PARAM:
                    return SENTRY_OK
                else:
                    return SENTRY_UNSUPPORT_PARAM
            elif err != SENTRY_PROTOC_TIMEOUT:
                return SENTRY_FAIL
        return SENTRY_READ_TIMEOUT

    def ReadString(self, vision_type, obj_id, vision_state):
        data_list = [
            SENTRY_PROTOC_START,
            0,
            self._addr,
            SENTRY_PROTOC_GET_STRING,
            vision_type,
            obj_id,
            0,
            0,
        ]
        data_list[1] = len(data_list) + 2
        chk = sum(data_list) & 0xFF
        data_list.append(chk)
        data_list.append(SENTRY_PROTOC_END)
        cmd = struct.pack(">" + "b" * len(data_list), *data_list)
        self._log(LOG_DEBUG, "ReadString req-> %s", " ".join(f"{b:02x}" for b in cmd))
        if self._port.any():
            self._port.read()
        self._port.write(cmd)

        str_data = bytearray()
        for _ in range(3):
            err, data = self._read_packet()
            if err != SENTRY_PROTOC_OK:
                continue
            if data[0] not in (SENTRY_PROTOC_OK, SENTRY_PROTOC_RESULT_NOT_END):
                return SENTRY_UNSUPPORT_PARAM
            if (
                data[1] != SENTRY_PROTOC_GET_STRING
                or data[3] != vision_type
                or data[4] != obj_id
            ):
                return SENTRY_UNSUPPORT_PARAM
            start_idx = data[5]
            stop_idx = data[6]
            expected_len = stop_idx - start_idx + 1
            if expected_len != len(data) - 7:
                self._log(
                    LOG_ERROR,
                    "String length mismatch: expected %d, got %d",
                    expected_len,
                    len(data) - 7,
                )
                return SENTRY_CHECK_ERROR
            if len(data) > 7:
                str_data.extend(data[7:])
            if data[0] == SENTRY_PROTOC_OK:
                break
        else:
            return SENTRY_READ_TIMEOUT

        vision_state.result[obj_id - 1].bytestr = str_data.decode("utf-8", "replace")
        return SENTRY_OK


# =========================== 基类 SentryBase（包含公共枚举） ===========================


class SentryBase:
    # ---------- 公共枚举 ----------
    # sentry_obj_info_e
    kStatus = 1
    kXValue = 2
    kYValue = 3
    kWidthValue = 4
    kHeightValue = 5
    kLabel = 6
    kRValue = 7
    kGValue = 8
    kBValue = 9

    # sentry_mode_e
    kSerialMode = 0x00
    kI2CMode = 0x01
    kUnknownMode = 0x02

    # sentry_led_color_e
    kLedClose = 0
    kLedRed = 1
    kLedGreen = 2
    kLedYellow = 3
    kLedBlue = 4
    kLedPurple = 5
    kLedCyan = 6
    kLedWhite = 7

    # sentry_baudrate_e
    kBaud9600 = 0x00
    kBaud19200 = 0x01
    kBaud38400 = 0x02
    kBaud57600 = 0x03
    kBaud115200 = 0x04
    kBaud921600 = 0x05
    kBaud1152000 = 0x06
    kBaud2000000 = 0x07

    # sentry_camera_zoom_e
    kZoomDefault = 0
    kZoom1 = 1
    kZoom2 = 2
    kZoom3 = 3
    kZoom4 = 4
    kZoom5 = 5

    # sentry_camera_fps_e
    kFPSNormal = 0
    kFPSHigh = 1

    # sentry_camera_white_balance_e
    kAutoWhiteBalance = 0
    kLockWhiteBalance = 1
    kWhiteLight = 2
    kYellowLight = 3
    kWhiteBalanceCalibrating = 4

    # color_label_e
    kColorBlack = 1
    kColorWhite = 2
    kColorRed = 3
    kColorGreen = 4
    kColorBlue = 5
    kColorYellow = 6

    # 其他公共常量
    kMaxResult = SENTRY_MAX_RESULT

    def __init__(
        self, device_id, address=0x60, log_level=LOG_ERROR, qr_vision_type=None
    ):
        self._device_id = device_id
        self._address = address
        self._stream = None
        self._img_w = 0
        self._img_h = 0
        self._debug = None
        self._vision_states = {}
        self._qr_vision_type = qr_vision_type
        self.SetDebug(log_level)

    def _log(self, *args):
        if self._logger:
            self._logger(self.__class__.__name__, *args)

    def SetDebug(self, log_level=LOG_OFF):
        if log_level < LOG_OFF:
            self._debug = SentryLogger()
            self._logger = self._debug.log
            self._debug.setLevel(log_level)
        else:
            if self._debug:
                self._debug.setLevel(LOG_OFF)

    @property
    def stream(self):
        return self._stream

    def _lock_reg(self, lock):
        return self._stream.Set(kRegLock, 1 if lock else 0)

    def _sensor_startup_check(self):
        for _ in range(200):
            err, val = self._stream.Get(kRegSensorConfig1)
            if err:
                self._log(LOG_ERROR, "SensorStartupCheck error: %d", err)
                return err
            if val & 0x01:
                return SENTRY_OK
            sleep_ms(10)
        self._log(LOG_ERROR, "SensorStartupCheck timeout")
        return SENTRY_UNKNOWN_PROTOCOL

    def _protocol_version_check(self):
        for _ in range(3):
            err, ver = self._stream.Get(kRegDeviceId)
            if not err and ver == self._device_id:
                return SENTRY_OK
        self._log(LOG_ERROR, "ProtocolVersionCheck error")
        return SENTRY_UNKNOWN_PROTOCOL

    def GetImageShape(self):
        err, low = self._stream.Get(kRegFrameWidthL)
        if err:
            return err
        err, high = self._stream.Get(kRegFrameWidthH)
        if err:
            return err
        self._img_w = (high << 8) | low
        err, low = self._stream.Get(kRegFrameHeightL)
        if err:
            return err
        err, high = self._stream.Get(kRegFrameHeightH)
        if err:
            return err
        self._img_h = (high << 8) | low
        return SENTRY_OK

    def rows(self):
        return self._img_h

    def cols(self):
        return self._img_w

    def SensorInit(self):
        err = self._sensor_startup_check()
        if err:
            return err
        err = self._protocol_version_check()
        if err:
            return err
        err = self.SensorSetDefault()
        if err:
            return err
        err = self.GetImageShape()
        if err:
            return err
        return SENTRY_OK

    def begin(self, communication_port=None):
        if communication_port is None:
            from machine import I2C, Pin

            communication_port = I2C(scl=Pin(Pin.P19), sda=Pin(Pin.P20), freq=400000)
            return self.begin(communication_port)
        if "I2C" in communication_port.__class__.__name__:
            self._stream = SentryI2CMethod(
                self._address, communication_port, logger=self._logger
            )
            self._log(LOG_INFO, "Begin I2C mode succeed!")
        elif "UART" == communication_port.__class__.__name__:
            self._stream = SentryUartMethod(
                self._address, communication_port, logger=self._logger
            )
            self._log(LOG_INFO, "Begin UART mode succeed!")
        else:
            return SENTRY_UNSUPPORT_PARAM
        if self._stream:
            return self.SensorInit()
        return SENTRY_FAIL

    def VisionBegin(self, vision_type):
        return self.VisionSetStatus(vision_type, True)

    def VisionEnd(self, vision_type):
        return self.VisionSetStatus(vision_type, False)

    def GetValue(self, vision_type, object_inf, obj_id=1):
        if object_inf == self.kStatus:
            while self.UpdateResult(vision_type):
                sleep_ms(10)
        return self._read(vision_type, object_inf, obj_id)

    def SetParamNum(self, vision_type, max_num):
        err = self._stream.Set(kRegVisionId, vision_type)
        if err:
            return err
        return self._stream.Set(kRegParamNum, max_num)

    def SetParam(self, vision_type, param, param_id):
        if param_id < 0 or param_id > SENTRY_MAX_RESULT:
            return SENTRY_FAIL
        params = [0] * 10
        for i in range(min(len(param), 5)):
            params[2 * i] = param[i] >> 8
            params[2 * i + 1] = param[i] & 0xFF
        return self._stream.SetParam(vision_type, params, param_id)

    def VisionSetMode(self, vision_type, mode):
        err = self._stream.Set(kRegVisionId, vision_type)
        if err:
            return err
        err, val = self._stream.Get(kRegVisionConfig2)
        if err:
            return err
        if (val & 0x0F) != mode:
            val = (val & 0xF0) | mode
            err = self._stream.Set(kRegVisionConfig2, val)
        return err

    def GetVisionState(self, vision_type):
        return self._vision_states.get(vision_type)

    def VisionSetStatus(self, vision_type, enable):
        err = self._stream.Set(kRegVisionId, vision_type)
        if err:
            return err
        err, val = self._stream.Get(kRegVisionConfig1)
        if err:
            return err
        status = val & 0x01
        if status != enable:
            val = (val & 0xFE) | (1 if enable else 0)
            err = self._stream.Set(kRegVisionConfig1, val)
            if err:
                return err
        if enable:
            self._vision_states[vision_type] = VisionState(vision_type)
        else:
            self._vision_states.pop(vision_type, None)
        return SENTRY_OK

    def VisionSetDefault(self, vision_type):
        err = self._stream.Set(kRegVisionId, vision_type)
        if err:
            return err
        err, val = self._stream.Get(kRegVisionConfig1)
        if err:
            return err
        val = (val & 0xFD) | (0x01 << 1)
        default_setting = (val >> 1) & 0x01
        err = self._stream.Set(kRegVisionConfig1, val)
        if err:
            return err
        while default_setting:
            sleep_ms(10)
            err, val = self._stream.Get(kRegVisionConfig1)
            if err:
                return err
            default_setting = (val >> 1) & 0x01
        return SENTRY_OK

    def VisionGetStatus(self, vision_type):
        err = self._stream.Set(kRegVisionId, vision_type)
        if err:
            return 0
        err, val = self._stream.Get(kRegVisionConfig1)
        if err:
            return 0
        return val & 0x01

    def UpdateResult(self, vision_type):
        state = self._vision_states.get(vision_type)
        if state is None:
            return SENTRY_FAIL

        while self._lock_reg(False) != SENTRY_OK:
            pass
        try:
            err, frame = self._stream.Get(kRegFrameCount)
            if err:
                return err
            if frame == state.frame:
                return SENTRY_FAIL
            while self._lock_reg(True) != SENTRY_OK:
                pass
            try:
                is_qr = vision_type == self._qr_vision_type
                err, new_state = self._stream.Read(vision_type, state, is_qr)
            finally:
                while self._lock_reg(False) != SENTRY_OK:
                    pass
            if err == SENTRY_OK:
                self._vision_states[vision_type] = new_state
            return err
        finally:
            while self._lock_reg(False) != SENTRY_OK:
                pass

    def _read(self, vision_type, object_inf, obj_id):
        state = self._vision_states.get(vision_type)
        if state is None or obj_id < 1 or obj_id > SENTRY_MAX_RESULT:
            return 0
        idx = obj_id - 1
        if idx >= state.detect:
            return 0
        res = state.result[idx]
        if object_inf == self.kStatus:
            return state.detect
        elif object_inf == self.kXValue:
            return res.data1
        elif object_inf == self.kYValue:
            return res.data2
        elif object_inf == self.kWidthValue:
            return res.data3
        elif object_inf == self.kHeightValue:
            return res.data4
        elif object_inf == self.kLabel:
            return res.data5
        elif object_inf == self.kRValue:
            return res.data1
        elif object_inf == self.kGValue:
            return res.data2
        elif object_inf == self.kBValue:
            return res.data3
        return 0

    def GetString(self, vision_type, obj_id=1):
        state = self._vision_states.get(vision_type)
        if state is None or obj_id < 1 or obj_id > SENTRY_MAX_RESULT:
            return ""
        err = self._stream.ReadString(vision_type, obj_id, state)
        if err:
            return ""
        return state.result[obj_id - 1].bytestr

    def GetQrCodeValue(self):
        if self._qr_vision_type is None:
            return ""
        state = self._vision_states.get(self._qr_vision_type)
        if state and state.detect > 0:
            return state.result[0].bytestr
        return ""

    def SensorSetRestart(self):
        return self._stream.Set(kRegRestart, 1)

    def SensorSetDefault(self):
        err, val = self._stream.Get(kRegSensorConfig1)
        if err:
            return err
        val |= 0x08
        err = self._stream.Set(kRegSensorConfig1, val)
        if err:
            return err
        while True:
            err, val = self._stream.Get(kRegSensorConfig1)
            if err:
                return err
            if not (val & 0x08):
                self._log(LOG_INFO, "SensorSetDefault succeed!")
                break
        return SENTRY_OK

    def SensorSetCoordinateType(self, coordinate):
        err, val = self._stream.Get(kRegHWConfig)
        if err:
            return err
        if ((val >> 2) & 0x03) != coordinate:
            val = (val & 0xF3) | ((coordinate & 0x03) << 2)
            err = self._stream.Set(kRegHWConfig, val)
        return err

    def LedSetColor(self, detected_color, undetected_color, level):
        err, led_level = self._stream.Get(kRegLedLevel)
        if err:
            return err
        led_level = (led_level & 0xF0) | (level & 0x0F)
        err = self._stream.Set(kRegLedLevel, led_level)
        if err:
            return err
        err, led_val = self._stream.Get(kRegLed)
        if err:
            return err
        led_val &= 0x10
        if detected_color == undetected_color:
            led_val |= 0x01
        led_val |= (detected_color & 0x07) << 1
        led_val |= (undetected_color & 0x07) << 5
        return self._stream.Set(kRegLed, led_val)

    def LcdSetMode(self, on):
        err, val = self._stream.Get(kRegLcdConfig)
        if err:
            return err
        val = (val & 0xFE) | (1 if on else 0)
        return self._stream.Set(kRegLcdConfig, val)

    def CameraSetZoom(self, zoom):
        err, val = self._stream.Get(kRegCameraConfig1)
        if err:
            return err
        if (val & 0x07) != zoom:
            val = (val & 0xF8) | (zoom & 0x07)
            err = self._stream.Set(kRegCameraConfig1, val)
        return err

    def CameraSetRotate(self, enable):
        err, val = self._stream.Get(kRegCameraConfig1)
        if err:
            return err
        if ((val >> 3) & 0x01) != enable:
            val = (val & 0xF7) | ((enable & 0x01) << 3)
            err = self._stream.Set(kRegCameraConfig1, val)
        return err

    def CameraSetFPS(self, fps):
        err, val = self._stream.Get(kRegCameraConfig1)
        if err:
            return err
        if ((val >> 4) & 0x01) != fps:
            val = (val & 0xEF) | ((fps & 0x01) << 4)
            err = self._stream.Set(kRegCameraConfig1, val)
        return err

    def CameraSetAwb(self, awb):
        err, val = self._stream.Get(kRegCameraConfig1)
        if err:
            return err
        white_balance = (val >> 5) & 0x03
        if awb == self.kLockWhiteBalance:
            val = (val & 0x1F) | ((awb & 0x03) << 5)
            err = self._stream.Set(kRegCameraConfig1, val)
            if err:
                return err
            while ((val >> 7) & 0x01) == 0:
                err, val = self._stream.Get(kRegCameraConfig1)
                if err:
                    return err
        elif white_balance != awb:
            val = (val & 0x1F) | ((awb & 0x03) << 5)
            err = self._stream.Set(kRegCameraConfig1, val)
        return err

    def CameraSetBrightness(self, brightness):
        err, val = self._stream.Get(kRegCameraConfig3)
        if err:
            return err
        if (val & 0x0F) != brightness:
            val = (val & 0xF0) | (brightness & 0x0F)
            err = self._stream.Set(kRegCameraConfig3, val)
        return err

    def CameraSetContrast(self, contrast):
        err, val = self._stream.Get(kRegCameraConfig3)
        if err:
            return err
        if ((val >> 4) & 0x0F) != contrast:
            val = (val & 0x0F) | ((contrast & 0x0F) << 4)
            err = self._stream.Set(kRegCameraConfig3, val)
        return err

    def CameraSetSaturation(self, saturation):
        err, val = self._stream.Get(kRegCameraConfig4)
        if err:
            return err
        if (val & 0x0F) != saturation:
            val = (val & 0xF0) | (saturation & 0x0F)
            err = self._stream.Set(kRegCameraConfig4, val)
        return err

    def CameraSetSharpness(self, sharpness):
        err, val = self._stream.Get(kRegCameraConfig5)
        if err:
            return err
        if (val & 0x0F) != sharpness:
            val = (val & 0xF0) | (sharpness & 0x0F)
            err = self._stream.Set(kRegCameraConfig5, val)
        return err

    def CameraGetZoom(self):
        err, val = self._stream.Get(kRegCameraConfig1)
        return val & 0x07 if not err else 0

    def CameraGetAwb(self):
        err, val = self._stream.Get(kRegCameraConfig1)
        return (val >> 5) & 0x03 if not err else 0

    def CameraGetRotate(self):
        err, val = self._stream.Get(kRegCameraConfig1)
        return (val >> 3) & 0x01 if not err else 0

    def CameraGetFPS(self):
        err, val = self._stream.Get(kRegCameraConfig1)
        return (val >> 4) & 0x01 if not err else 0

    def CameraGetBrightness(self):
        err, val = self._stream.Get(kRegCameraConfig3)
        return val & 0x0F if not err else 0

    def CameraGetContrast(self):
        err, val = self._stream.Get(kRegCameraConfig3)
        return (val >> 4) & 0x0F if not err else 0

    def CameraGetSaturation(self):
        err, val = self._stream.Get(kRegCameraConfig4)
        return val & 0x0F if not err else 0

    def CameraGetSharpness(self):
        err, val = self._stream.Get(kRegCameraConfig5)
        return val & 0x0F if not err else 0

    def UartSetBaudrate(self, baud):
        err, val = self._stream.Get(kRegUart)
        if err:
            return err
        if (val & 0x07) != baud:
            val = (val & 0xF8) | (baud & 0x07)
            err = self._stream.Set(kRegUart, val)
        return err


# =========================== 各设备类（特有枚举直接作为类属性） ===========================


class Sengo1(SentryBase):
    # 视觉类型
    kVisionColor = 1
    kVisionBlob = 2
    kVisionBall = 3
    kVisionLine = 4
    kVisionCard = 6
    kVisionBody = 7
    kVisionFace = 8
    kVisionQrCode = 9
    kVisionMaxType = 10

    # 卡片标签
    kCardForward = 1
    kCardLeft = 2
    kCardRight = 3
    kCardTurnAround = 4
    kCardPark = 5

    # 球体标签
    kBallTableTennis = 1
    kBallTennis = 2

    def __init__(self, address=0x60, log_level=LOG_ERROR):
        super().__init__(0x06, address, log_level, qr_vision_type=self.kVisionQrCode)


class Sengo2(SentryBase):
    # 视觉类型
    kVisionColor = 1
    kVisionBlob = 2
    kVisionAprilTag = 3
    kVisionLine = 4
    kVisionLearning = 5
    kVisionCard = 6
    kVisionFace = 7
    kVision20Class = 8
    kVisionQrCode = 9
    kVisionMotion = 11
    kVisionMaxType = 12

    # 卡片标签
    kCardForward = 1
    kCardLeft = 2
    kCardRight = 3
    kCardTurnAround = 4
    kCardPark = 5
    kCardGreenLight = 6
    kCardRedLight = 7
    kCardSpeed40 = 8
    kCardSpeed60 = 9
    kCardSpeed80 = 10
    kCardCheck = 11
    kCardCross = 12
    kCardCircle = 13
    kCardSquare = 14
    kCardTriangle = 15
    kCardPlus = 16
    kCardMinus = 17
    kCardDivide = 18
    kCardEqual = 19
    kCardZero = 20
    kCardOne = 21
    kCardTwo = 22
    kCardThree = 23
    kCardFour = 24
    kCardFive = 25
    kCardSix = 26
    kCardSeven = 27
    kCardEight = 28
    kCardNine = 29

    # AprilTag 模式
    kVisionModeFamily16H5 = 0
    kVisionModeFamily25H9 = 1
    kVisionModeFamily36H11 = 2

    # 20类标签
    kAirplane = 1
    kBicycle = 2
    kBird = 3
    kBoat = 4
    kBottle = 5
    kBus = 6
    kCar = 7
    kCat = 8
    kChair = 9
    kCow = 10
    kTable = 11
    kDog = 12
    kHorse = 13
    kMotorBike = 14
    kPerson = 15
    kPlant = 16
    kSheep = 17
    kSofa = 18
    kTrain = 19
    kMonitor = 20

    def __init__(self, address=0x60, log_level=LOG_ERROR):
        super().__init__(0x07, address, log_level, qr_vision_type=self.kVisionQrCode)


class Sentry1(SentryBase):
    # 视觉类型
    kVisionColor = 1
    kVisionBlob = 2
    kVisionBall = 3
    kVisionLine = 4
    kVisionCard = 6
    kVisionBody = 7
    kVisionMaxType = 8
    kVisionQrCode = 9
    kVisionMotionDetect = 11

    # 卡片标签
    kCardForward = 1
    kCardLeft = 2
    kCardRight = 3
    kCardTurnAround = 4
    kCardPark = 5

    # 球体标签
    kBallTableTennis = 1
    kBallTennis = 2

    # 形状卡片
    kCardCheck = 11
    kCardCross = 12
    kCardCircle = 13
    kCardSquare = 14
    kCardTriangle = 15

    def __init__(self, address=0x60, log_level=LOG_ERROR):
        super().__init__(0x05, address, log_level, qr_vision_type=self.kVisionQrCode)


class Sentry2(SentryBase):
    # 视觉类型
    kVisionColor = 1
    kVisionBlob = 2
    kVisionAprilTag = 3
    kVisionLine = 4
    kVisionLearning = 5
    kVisionCard = 6
    kVisionFace = 7
    kVision20Class = 8
    kVisionQrCode = 9
    kVisionCustom = 10
    kVisionMotion = 11
    kVisionMaxType = 12

    # 卡片标签
    kCardForward = 1
    kCardLeft = 2
    kCardRight = 3
    kCardTurnAround = 4
    kCardPark = 5
    kCardGreenLight = 6
    kCardRedLight = 7
    kCardSpeed40 = 8
    kCardSpeed60 = 9
    kCardSpeed80 = 10
    kCardCheck = 11
    kCardCross = 12
    kCardCircle = 13
    kCardSquare = 14
    kCardTriangle = 15
    kCardPlus = 16
    kCardMinus = 17
    kCardDivide = 18
    kCardEqual = 19
    kCardZero = 20
    kCardOne = 21
    kCardTwo = 22
    kCardThree = 23
    kCardFour = 24
    kCardFive = 25
    kCardSix = 26
    kCardSeven = 27
    kCardEight = 28
    kCardNine = 29
    kCardA = 31
    kCardB = 32
    kCardC = 33
    kCardD = 34
    kCardE = 35
    kCardF = 36
    kCardG = 37
    kCardH = 38
    kCardI = 39
    kCardJ = 40
    kCardK = 41
    kCardL = 42
    kCardM = 43
    kCardN = 44
    kCardO = 45
    kCardP = 46
    kCardQ = 47
    kCardR = 48
    kCardS = 49
    kCardT = 50
    kCardU = 51
    kCardV = 52
    kCardW = 53
    kCardX = 54
    kCardY = 55
    kCardZ = 56

    # AprilTag 模式
    kVisionModeFamily16H5 = 0
    kVisionModeFamily25H9 = 1
    kVisionModeFamily36H11 = 2

    # 20类标签
    kAirplane = 1
    kBicycle = 2
    kBird = 3
    kBoat = 4
    kBottle = 5
    kBus = 6
    kCar = 7
    kCat = 8
    kChair = 9
    kCow = 10
    kTable = 11
    kDog = 12
    kHorse = 13
    kMotorBike = 14
    kPerson = 15
    kPlant = 16
    kSheep = 17
    kSofa = 18
    kTrain = 19
    kMonitor = 20

    def __init__(self, address=0x60, log_level=LOG_ERROR):
        super().__init__(0x04, address, log_level, qr_vision_type=self.kVisionQrCode)


class Sentry3(SentryBase):
    # 视觉类型
    kVisionColor = 1
    kVisionBlob = 2
    kVisionAprilTag = 3
    kVisionLine = 4
    kVisionLearning = 5
    kVisionFace = 7
    kVisionYolo = 8
    kVisionQrCode = 9
    kVisionBarCode = 10
    kVisionOCR = 12
    kVisionHandPose = 13
    kVisionLicensePlate = 14
    kVisionMaxType = 15

    # Yolo 标签
    kPerson = 1
    kBicycle = 2
    kCar = 3
    kMotorcycle = 4
    kAirplane = 5
    kBus = 6
    kTrain = 7
    kTruck = 8
    kBoat = 9
    kTrafficLight = 10
    kFireHydrant = 11
    kStopSign = 12
    kParkingMeter = 13
    kBench = 14
    kBird = 15
    kCat = 16
    kDog = 17
    kHorse = 18
    kSheep = 19
    kCow = 20
    kElephant = 21
    kBear = 22
    kZebra = 23
    kGiraffe = 24
    kBackpack = 25
    kUmbrella = 26
    kHandbag = 27
    kTie = 28
    kSuitcase = 29
    kFrisbee = 30
    kSkis = 31
    kSnowboard = 32
    kSportsBall = 33
    kKite = 34
    kBaseballBat = 35
    kBaseballGlove = 36
    kSkateboard = 37
    kSurfboard = 38
    kTennisRacket = 39
    kBottle = 40
    kWineGlass = 41
    kCup = 42
    kFork = 43
    kKnife = 44
    kSpoon = 45
    kBowl = 46
    kBanana = 47
    kApple = 48
    kSandwich = 49
    kOrange = 50
    kBroccoli = 51
    kCarrot = 52
    kHotDog = 53
    kPizza = 54
    kDonut = 55
    kCake = 56
    kChair = 57
    kCouch = 58
    kPottedPlant = 59
    kBed = 60
    kDiningTable = 61
    kToilet = 62
    kTv = 63
    kLaptop = 64
    kMouse = 65
    kRemote = 66
    kKeyboard = 67
    kCellPhone = 68
    kMicrowave = 69
    kOven = 70
    kToaster = 71
    kSink = 72
    kRefrigerator = 73
    kBook = 74
    kClock = 75
    kVase = 76
    kScissors = 77
    kTeddyBear = 78
    kHairDrier = 79
    kToothbrush = 80

    # Barcode 模式
    kVisionModeFamilyAll = 14
    kVisionModeFamilyENA13 = 2
    kVisionModeFamilyCode128 = 4
    kVisionModeFamilyCode39 = 8

    # AprilTag 模式（扩展）
    kVisionModeFamily16H5 = 0
    kVisionModeFamily25H9 = 1
    kVisionModeFamily36H11 = 2
    kVisionModeFamilyCircle21H7 = 3
    kVisionModeFamilyStandard41H12 = 4

    def __init__(self, address=0x60, log_level=LOG_ERROR):
        super().__init__(0x08, address, log_level, qr_vision_type=self.kVisionQrCode)


# =========================== 文本协议扩展（Sentry3 专用） ===========================


class SentryTextProtocol:
    def __init__(self, sentry, logger=None):
        self._sentry = sentry
        self._logger = logger
        self._last_error = ""

    def _log(self, level, msg, *args):
        if self._logger:
            self._logger(self.__class__.__name__, level, msg, *args)

    def _send_command(self, cmd, wait_str="ok"):
        stream = self._sentry.stream
        if stream is None:
            return SENTRY_FAIL, ""
        stream.clear()
        stream.write(cmd)
        res = stream.read_until(0)
        if res is None:
            return SENTRY_READ_TIMEOUT, ""
        self._last_error = res.decode("utf-8", "replace")
        if wait_str in self._last_error:
            return SENTRY_OK, self._last_error
        return SENTRY_FAIL, self._last_error

    def Error(self):
        return self._last_error

    def Set(self, key, value, wait_str="ok"):
        cmd = f'wifi{{"{key}":"{value}"}}\n'
        return self._send_command(cmd, wait_str)


class SentryWiFi(SentryTextProtocol):
    def Config(self, ssid, password):
        cmd = f'wifi{{"wifi_ssid":"{ssid}","wifi_password":"{password}"}}\n'
        err, resp = self._send_command(cmd, "ok")
        return err


class SentryLLM(SentryTextProtocol):
    kModeChat = 0
    kModeImage = 1
    kModeTalk = 2
    kModeASR = 3
    kModeTTS = 4

    def SetMode(self, mode):
        if isinstance(mode, int):
            mode_map = {
                self.kModeChat: "chat",
                self.kModeImage: "image",
                self.kModeTalk: "talk",
                self.kModeASR: "asr",
                self.kModeTTS: "tts",
            }
            mode = mode_map.get(mode, "chat")
        err, _ = self.Set("mode", mode, "connected")
        if err != SENTRY_OK:
            return err
        return SENTRY_OK

    def SetModel(self, model):
        return self.Set("model", model)[0]

    def SetAPIKey(self, api_key):
        return self.Set("api_key", api_key)[0]

    def SetSystemPrompt(self, prompt):
        return self.Set("prompt", prompt)[0]

    def SetVoice(self, voice):
        return self.Set("voice", voice)[0]

    def EnableThinking(self, flag=True):
        return self.Set("enable_thinking", "true" if flag else "false")[0]

    def ChatCompletions(self, text):
        err, _ = self.Set("text", text)
        if err != SENTRY_OK:
            return err, ""
        stream = self._sentry.stream
        stream.clear()
        res = stream.read_until(0)
        if res is None:
            return SENTRY_READ_TIMEOUT, ""
        return SENTRY_OK, res.decode("utf-8", "replace")
