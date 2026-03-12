"""
MicroPython 驱动，用于 TTS20 语音合成模块（I2C接口）。
从 Arduino 库移植而来。
"""

import time

from machine import I2C

# 常量定义
CMD_CLEAR_RX_BUFFER = 1 << 0  # 清除接收缓冲区的命令
DEFAULT_TIMEOUT_MS = 1000  # 默认超时时间（毫秒）

RESPONSE_SUCCESS = 0x41  # 成功响应
RESPONSE_BUSY = 0x4E  # 忙状态
RESPONSE_IDLE = 0x4F  # 空闲状态

# 寄存器地址映射
MEM_ADDR_DEVICE_ID = 0x00
MEM_ADDR_MAJOR_VERSION = 0x01
MEM_ADDR_MINOR_VERSION = 0x02
MEM_ADDR_PATCH_VERSION = 0x03
MEM_ADDR_NAME = 0x04
MEM_ADDR_COMMAND = 0x10
MEM_ADDR_TX_BUFFER_FREE_SPACE = 0x11
MEM_ADDR_TX_BUFFER_IS_EMPTY = 0x12
MEM_ADDR_TX_BUFFER = 0x13
MEM_ADDR_RX_BUFFER_CAPACITY = 0x53
MEM_ADDR_RX_BUFFER_READ_PTR = 0x54
MEM_ADDR_RX_BUFFER_WRITE_PTR = 0x55
MEM_ADDR_RX_BUFFER_DATA = 0x56
MEM_ADDR_RX_BUFFER_OVERFLOW = 0x96

# I2C 单次传输安全上限（保守值）
WIRE_BUFFER_CAPACITY = 128


class TTS20:
    DefaultI2cAddress: int = 0x40

    """TTS20 语音合成模块驱动类。"""

    def __init__(i2c: I2C, self, i2c_address: int = DefaultI2cAddress):
        """
        初始化 TTS20 驱动。

        :param i2c_address: 模块的 7 位 I2C 地址。
        :param i2c: 已配置好的 machine.I2C 对象。
        """
        self.addr = i2c_address
        self.i2c = i2c
        self.rx_buffer_capacity = 0  # 将在 init() 中获取

    def init(self) -> None:
        """
        初始化模块：读取接收缓冲区大小，发送启动命令，等待就绪。
        若连续 5 次失败则抛出 RuntimeError。
        """
        for _ in range(5):
            try:
                # 读取接收缓冲区容量（必须成功）
                self.i2c.writeto(self.addr, bytes([MEM_ADDR_RX_BUFFER_CAPACITY]))
                data = self.i2c.readfrom(self.addr, 1)
                if len(data) != 1:
                    continue
                self.rx_buffer_capacity = data[0]

                # 初始化命令（来自 Arduino 库）
                init_cmd = bytes(
                    [
                        0xFD,
                        0x00,
                        0x12,
                        0x01,
                        0x04,
                        0x5B,
                        0x76,
                        0x35,
                        0x5D,
                        0x5B,
                        0x73,
                        0x35,
                        0x5D,
                        0x5B,
                        0x74,
                        0x35,
                        0x5D,
                        0x5B,
                        0x6D,
                        0x30,
                        0x5D,
                    ]
                )
                self._write(init_cmd)

                if self._read_until(RESPONSE_SUCCESS, DEFAULT_TIMEOUT_MS):
                    # 等待模块变为空闲
                    while self.is_busy():
                        pass
                    return
            except Exception:
                continue

        raise RuntimeError("TTS20 初始化失败")

    def firmware_version(self) -> str:
        """返回固件版本字符串 '主版本号.次版本号.修订号'。"""
        self.i2c.writeto(self.addr, bytes([MEM_ADDR_MAJOR_VERSION]))
        data = self.i2c.readfrom(self.addr, 3)
        if len(data) != 3:
            raise RuntimeError("读取固件版本失败")
        return "{}.{}.{}".format(data[0], data[1], data[2])

    def device_id(self) -> int:
        """返回设备标识字节。"""
        self.i2c.writeto(self.addr, bytes([MEM_ADDR_DEVICE_ID]))
        data = self.i2c.readfrom(self.addr, 1)
        if len(data) != 1:
            raise RuntimeError("读取设备 ID 失败")
        return data[0]

    def name(self) -> str:
        """返回 8 字符的设备名称字符串。"""
        self.i2c.writeto(self.addr, bytes([MEM_ADDR_NAME]))
        data = self.i2c.readfrom(self.addr, 8)
        if len(data) != 8:
            raise RuntimeError("读取名称失败")
        return "".join(chr(b) for b in data)

    def play(self, text: str) -> bool:
        """
        发送要朗读的文本。

        :param text: 要朗读的字符串（UTF-8 编码）。
        :return: 若模块以成功响应应答则返回 True，否则 False。
        """
        if not text:
            raise ValueError("文本不能为空")
        text_bytes = text.encode("utf-8")
        length = len(text_bytes)
        # 构造帧头
        header = bytes([0xFD, (length + 2) >> 8, (length + 2) & 0xFF, 0x01, 0x04])
        self.clear_rx_buffer()
        self._write(header)
        self._write(text_bytes)
        return self._read_until(RESPONSE_SUCCESS, DEFAULT_TIMEOUT_MS)

    def is_busy(self) -> bool:
        """
        查询模块是否正在朗读。

        :return: 忙碌返回 True，空闲返回 False。
        """
        start = time.ticks_ms()
        while time.ticks_diff(time.ticks_ms(), start) < 5000:
            self.clear_rx_buffer()
            query_cmd = bytes([0xFD, 0x00, 0x01, 0x21])
            self._write(query_cmd)
            data = self._read(1, 500)
            if len(data) == 1:
                if data[0] == RESPONSE_BUSY:
                    return True
                elif data[0] == RESPONSE_IDLE:
                    return False
        return True  # 超时，保守返回忙碌

    def stop(self) -> bool:
        """停止当前朗读。"""
        self.clear_rx_buffer()
        stop_cmd = bytes([0xFD, 0x00, 0x01, 0x02])
        self._write(stop_cmd)
        return self._read_until(RESPONSE_SUCCESS, DEFAULT_TIMEOUT_MS)

    def pause(self) -> bool:
        """暂停当前朗读。"""
        self.clear_rx_buffer()
        pause_cmd = bytes([0xFD, 0x00, 0x01, 0x03])
        self._write(pause_cmd)
        return self._read_until(RESPONSE_SUCCESS, DEFAULT_TIMEOUT_MS)

    def resume(self) -> bool:
        """恢复暂停的朗读。"""
        self.clear_rx_buffer()
        resume_cmd = bytes([0xFD, 0x00, 0x01, 0x04])
        self._write(resume_cmd)
        return self._read_until(RESPONSE_SUCCESS, DEFAULT_TIMEOUT_MS)

    def clear_rx_buffer(self) -> None:
        """通过命令寄存器清除模块的接收缓冲区。"""
        self.i2c.writeto(self.addr, bytes([MEM_ADDR_COMMAND, CMD_CLEAR_RX_BUFFER]))

    # ----------------------------------------------------------------------
    # 底层 I2C 通信辅助函数
    # ----------------------------------------------------------------------

    def _write(self, data: bytes) -> None:
        """
        将数据写入模块的发送缓冲区，等待空闲空间并确保全部发送完成。

        :param data: 要发送的字节数据。
        """
        offset = 0
        size = len(data)
        while offset < size:
            # 查询发送缓冲区空闲空间
            self.i2c.writeto(self.addr, bytes([MEM_ADDR_TX_BUFFER_FREE_SPACE]))
            free = self.i2c.readfrom(self.addr, 1)[0]
            if free == 0:
                continue

            # 计算本次可以发送的块大小（受限于空闲空间和 I2C 缓冲区上限）
            chunk = min(size - offset, free, WIRE_BUFFER_CAPACITY - 1)
            # 写入寄存器地址 + 数据块
            self.i2c.writeto(
                self.addr, bytes([MEM_ADDR_TX_BUFFER]) + data[offset : offset + chunk]
            )
            offset += chunk

        # 等待发送缓冲区完全变空
        while True:
            self.i2c.writeto(self.addr, bytes([MEM_ADDR_TX_BUFFER_IS_EMPTY]))
            empty = self.i2c.readfrom(self.addr, 1)[0]
            if empty != 0:
                break

    def _read(self, expected_length: int, timeout_ms: int) -> bytes:
        """
        从模块的接收缓冲区读取最多 expected_length 字节，处理环形缓冲区读写指针。

        :param expected_length: 期望读取的最大字节数。
        :param timeout_ms: 超时时间（毫秒）。
        :return: 实际读取到的字节串（可能少于期望长度）。
        """
        result = bytearray()
        start = time.ticks_ms()

        while (
            len(result) < expected_length
            and time.ticks_diff(time.ticks_ms(), start) < timeout_ms
        ):
            # 读取当前的读指针和写指针
            self.i2c.writeto(self.addr, bytes([MEM_ADDR_RX_BUFFER_READ_PTR]))
            ptrs = self.i2c.readfrom(self.addr, 2)
            if len(ptrs) != 2:
                continue
            rd_ptr, wr_ptr = ptrs[0], ptrs[1]

            if rd_ptr == wr_ptr:
                continue  # 缓冲区为空

            # 计算环形缓冲区中可用数据量
            avail = (
                wr_ptr + self.rx_buffer_capacity - rd_ptr
            ) % self.rx_buffer_capacity
            # 本次可读的块大小受限于剩余需要量、可用数据量以及缓冲区尾部空间
            chunk = min(
                expected_length - len(result), avail, self.rx_buffer_capacity - rd_ptr
            )
            if chunk == 0:
                continue

            # 从当前读指针开始读取数据
            addr = MEM_ADDR_RX_BUFFER_DATA + rd_ptr
            self.i2c.writeto(self.addr, bytes([addr]))
            chunk_data = self.i2c.readfrom(self.addr, chunk)
            if len(chunk_data) != chunk:
                continue  # 读取不足，重试
            result.extend(chunk_data)

            # 更新读指针
            new_rd = (rd_ptr + chunk) % self.rx_buffer_capacity
            self.i2c.writeto(self.addr, bytes([MEM_ADDR_RX_BUFFER_READ_PTR, new_rd]))

        return bytes(result)

    def _read_until(self, target: int, timeout_ms: int) -> bool:
        """
        读取一个字节并检查是否等于目标值。

        :param target: 期望的字节值。
        :param timeout_ms: 超时时间（毫秒）。
        :return: 若接收到目标字节则返回 True，否则 False。
        """
        data = self._read(1, timeout_ms)
        return len(data) == 1 and data[0] == target
