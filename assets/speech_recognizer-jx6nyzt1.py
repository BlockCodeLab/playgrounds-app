"""
MicroPython 语音识别模块驱动程序 (I2C 接口)
基于 Arduino 库 (emakefun) 移植
"""

import time

from machine import I2C


class SpeechRecognizer:
    """语音识别模块类，通过 I2C 控制"""

    # 默认 I2C 设备地址
    DEFAULT_I2C_ADDR = 0x30
    # 单个关键词最大字节数
    MAX_KEYWORD_DATA_BYTES = 50

    # 错误码 (与 Arduino 库保持一致)
    OK = 0
    I2C_DATA_TOO_LONG = 1
    I2C_NACK_ADDR = 2
    I2C_NACK_DATA = 3
    I2C_OTHER_ERROR = 4
    I2C_TIMEOUT = 5
    INVALID_PARAM = 6
    UNKNOWN_ERROR = 7

    # 识别模式
    RECOGNITION_AUTO = 0  # 自动识别模式
    BUTTON_TRIGGER = 1  # 按键触发识别模式
    KEYWORD_TRIGGER = 2  # 关键词触发识别模式
    KEYWORD_OR_BUTTON_TRIGGER = 3  # 按键或关键词触发模式

    # 事件类型
    EVENT_NONE = 0  # 无事件
    EVENT_START_WAITING_FOR_TRIGGER = 1  # 开始等待触发
    EVENT_BUTTON_TRIGGERED = 2  # 被按键触发
    EVENT_KEYWORD_TRIGGERED = 3  # 被关键词触发
    EVENT_START_RECOGNIZING = 4  # 开始识别
    EVENT_SPEECH_RECOGNIZED = 5  # 识别成功
    EVENT_SPEECH_RECOGNITION_TIMEOUT = 6  # 识别超时

    # 模块内部寄存器地址映射
    _MEM_VERSION = 0x00  # 版本号
    _MEM_BUSY = 0x01  # 忙标志
    _MEM_RESET = 0x02  # 软件复位
    _MEM_RECOG_MODE = 0x03  # 识别模式
    _MEM_RESULT = 0x04  # 识别结果 (2字节，有符号整数)
    _MEM_EVENT = 0x06  # 事件
    _MEM_TIMEOUT = 0x08  # 超时时间 (4字节，毫秒)
    _MEM_KEYWORD_INDEX = 0x0C  # 待添加关键词的索引
    _MEM_KEYWORD_DATA = 0x0D  # 关键词数据区起始
    _MEM_KEYWORD_LEN = 0x3F  # 关键词长度
    _MEM_ADD_KEYWORD = 0x40  # 添加关键词命令
    _MEM_RECOGNIZE = 0x41  # 开始识别命令

    def __init__(self, i2c: I2C, addr: int = DEFAULT_I2C_ADDR):
        """
        构造函数
        :param i2c: machine.I2C 对象，已初始化
        :param addr: 模块的 I2C 地址，默认为 0x30
        """
        self.i2c = i2c
        self.addr = addr

    def _write_reg(self, reg: int, data) -> int:
        """
        向寄存器写入数据 (1字节或多字节)
        :param reg: 寄存器地址
        :param data: 整数(0-255) 或 字节串(bytes/bytearray)
        :return: 错误码，0 表示成功
        """
        try:
            if isinstance(data, int):
                data = bytes([data])
            elif not isinstance(data, (bytes, bytearray)):
                data = bytes(data)  # 尝试转换为 bytes
            self.i2c.writeto(self.addr, bytes([reg]) + data)
            return self.OK
        except Exception as e:
            # 根据异常类型粗略返回错误码，实际可细化
            return self.I2C_OTHER_ERROR

    def _read_reg(self, reg: int, length: int = 1) -> tuple:
        """
        从寄存器读取数据
        :param reg: 寄存器地址
        :param length: 读取字节数
        :return: (错误码, bytes数据)  错误码为0时数据有效
        """
        try:
            self.i2c.writeto(self.addr, bytes([reg]))
            data = self.i2c.readfrom(self.addr, length)
            return self.OK, data
        except Exception:
            return self.I2C_OTHER_ERROR, b""

    def _wait_until_idle(self, timeout_ms: int = 1000) -> int:
        """
        等待模块空闲 (busy 标志变为 0)
        :param timeout_ms: 超时时间，单位毫秒
        :return: 错误码，0 表示成功
        """
        start = time.ticks_ms()
        while True:
            err, busy_byte = self._read_reg(self._MEM_BUSY, 1)
            if err != self.OK:
                return err
            if busy_byte[0] == 0:
                break
            if time.ticks_diff(time.ticks_ms(), start) > timeout_ms:
                return self.I2C_TIMEOUT
            time.sleep_ms(1)
        return self.OK

    def initialize(self) -> int:
        """
        初始化模块：发送复位命令并等待准备就绪
        :return: 错误码，0 表示成功
        """
        err = self._write_reg(self._MEM_RESET, 1)
        if err != self.OK:
            return err
        return self._wait_until_idle()

    def set_recognition_mode(self, mode: int) -> int:
        """
        设置识别模式
        :param mode: 识别模式，使用类中的 RECOGNITION_* 常量
        :return: 错误码，0 表示成功
        """
        err = self._wait_until_idle()
        if err != self.OK:
            return err
        return self._write_reg(self._MEM_RECOG_MODE, mode)

    def set_timeout(self, timeout_ms: int) -> int:
        """
        设置识别超时时间 (对自动识别模式无效)
        :param timeout_ms: 超时时间，单位毫秒
        :return: 错误码，0 表示成功
        """
        err = self._wait_until_idle()
        if err != self.OK:
            return err
        data = timeout_ms.to_bytes(4, "little")
        return self._write_reg(self._MEM_TIMEOUT, data)

    def add_keyword(self, index: int, keyword) -> int:
        """
        添加语音识别关键词
        :param index: 关键词索引 (0~255)，多个关键词可以共用同一个索引
        :param keyword: 关键词字符串 (str) 或字节串 (bytes)，最大长度 MAX_KEYWORD_DATA_BYTES
        :return: 错误码，0 表示成功
        """
        # 转换为字节串，并截断超长部分
        if isinstance(keyword, str):
            kw_bytes = keyword.encode("utf-8")
        else:
            kw_bytes = bytes(keyword)  # 确保是 bytes 类型

        kw_len = min(len(kw_bytes), self.MAX_KEYWORD_DATA_BYTES)
        kw_data = kw_bytes[:kw_len]

        err = self._wait_until_idle()
        if err != self.OK:
            return err

        # 写关键词索引
        err = self._write_reg(self._MEM_KEYWORD_INDEX, index)
        if err != self.OK:
            return err
        # 写关键词数据 (从 KEYWORD_DATA 起始连续写入)
        err = self._write_reg(self._MEM_KEYWORD_DATA, kw_data)
        if err != self.OK:
            return err
        # 写关键词长度
        err = self._write_reg(self._MEM_KEYWORD_LEN, kw_len)
        if err != self.OK:
            return err
        # 执行添加命令
        err = self._write_reg(self._MEM_ADD_KEYWORD, 1)
        return err

    def recognize(self) -> int:
        """
        启动一次识别并立即读取结果寄存器
        注意：此函数不会等待识别完成，需要用户轮询获取结果。
        :return: 识别结果，结果 <0 表示未识别到，>=0 为关键词索引
        """
        err = self._wait_until_idle()
        if err != self.OK:
            return -1

        # 发送识别命令
        err = self._write_reg(self._MEM_RECOGNIZE, 1)
        if err != self.OK:
            return -1

        # 读取结果寄存器 (2 字节有符号整数)
        err, data = self._read_reg(self._MEM_RESULT, 2)
        if err != self.OK:
            return -1
        if len(data) < 2:
            return -1
        result = int.from_bytes(data, "little")
        return result

    def get_event(self) -> int:
        """
        获取当前事件状态
        :return: (错误码, 事件值)  事件值参见类中的 EVENT_* 常量
        """
        err, data = self._read_reg(self._MEM_EVENT, 1)
        if err != self.OK:
            return self.EVENT_NONE
        if len(data) < 1:
            return self.EVENT_NONE
        return data[0]
