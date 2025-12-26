# 灵感来源 Arduino OneButton 库，https://www.mathertel.de/Arduino/OneButton
import time

from machine import Pin, Timer

__all__ = ("OneButton",)


class OneButton:
    # 状态追踪
    IDLE = "IDLE"
    PRESSED = "PRESSED"
    DOUBLE_PRESSED = "DOUBLE_PRESSED"
    CLICK_WAIT = "CLICK_WAIT"

    def __init__(self, pin):
        self.pin = Pin(pin, Pin.IN, Pin.PULL_UP)
        self.callbacks = {}

        # 时间阈值配置（单位：毫秒）
        self.DEBOUNCE_MS = 50  # 增加消抖时间，避免误触发
        self.CLICK_MS = 400  # 单击最长判定时间
        self.LONG_PRESS_MS = 800  # 长按判定时间
        self.HOLD_INTERVAL_MS = 200  # 长按持续触发间隔

        # 状态变量 - 增加状态追踪
        self.last_press_time = 0
        self.press_start_time = 0
        self.click_count = 0
        self.last_click_time = 0
        self.last_hold_time = 0
        self.long_press_detected = False
        self.ignore_next_release = False
        self.state = OneButton.IDLE
        self.timer = Timer(-1)

        # 绑定中断
        self.pin.irq(
            trigger=Pin.IRQ_FALLING | Pin.IRQ_RISING,
            handler=self._irq_handler,
        )

    def is_pressed(self):
        """检测按钮当前是否被按下"""
        return self.pin.value() == 0

    def _reset_state(self):
        """重置所有状态到初始值 - 这是关键修复！"""
        self.click_count = 0
        self.long_press_detected = False
        self.ignore_next_release = False
        self.state = OneButton.IDLE
        if self.timer:
            self.timer.deinit()

    def _irq_handler(self, pin):
        """中断处理函数"""
        current_time = time.ticks_ms()
        pin_state = pin.value()

        # 消抖处理
        if time.ticks_diff(current_time, self.last_press_time) < self.DEBOUNCE_MS:
            return

        self.last_press_time = current_time

        if pin_state == 0:  # 按下
            self._on_press(current_time)
        else:  # 释放
            self._on_release(current_time)

    def _on_press(self, current_time):
        """按下事件处理"""

        # 停止所有定时器
        self.timer.deinit()

        # 处理不同的前序状态
        if self.state == OneButton.CLICK_WAIT:
            # 在双击等待期内第二次按下
            self.click_count = 2
            self.state = OneButton.DOUBLE_PRESSED

        else:
            # 全新开始
            self._reset_state()  # 确保状态干净
            self.press_start_time = current_time
            self.last_hold_time = current_time
            self.click_count = 1
            self.state = OneButton.PRESSED

            # 启动长按检测
            self.timer.init(
                period=50,
                mode=Timer.PERIODIC,
                callback=lambda t: self._check_long_press(),
            )

    def _on_release(self, current_time):
        """释放事件处理"""
        # 处理长按后的释放
        if self.long_press_detected:
            if "long_press_end" in self.callbacks:
                self.callbacks["long_press_end"]()

        # 处理双击
        elif self.state == OneButton.DOUBLE_PRESSED:
            if "double_click" in self.callbacks:
                self.callbacks["double_click"]()

        # 处理单击或启动双击等待
        elif self.state == OneButton.PRESSED:
            self.state = OneButton.CLICK_WAIT
            self.last_click_time = current_time

            # 启动双击等待定时器
            self.timer.init(
                period=self.CLICK_MS,
                mode=Timer.ONE_SHOT,
                callback=lambda t: self._timeout_clicks(),
            )
            return

        self._reset_state()

    def _timeout_clicks(self):
        """双击等待超时 - 触发单击"""
        if self.state == OneButton.CLICK_WAIT and self.click_count == 1:
            if "click" in self.callbacks:
                self.callbacks["click"]()
        self._reset_state()

    def _check_long_press(self):
        """检查长按"""
        if not self.is_pressed():
            return  # 按钮已释放，停止检查

        current_time = time.ticks_ms()
        press_duration = time.ticks_diff(current_time, self.press_start_time)

        # 长按开始
        if not self.long_press_detected and press_duration > self.LONG_PRESS_MS:
            self.long_press_detected = True
            if "long_press_start" in self.callbacks:
                self.callbacks["long_press_start"]()
            # 清除单击计数，避免长按后触发单击
            self.click_count = 0

        # 长按持续
        elif self.long_press_detected:
            hold_diff = time.ticks_diff(current_time, self.last_hold_time)
            if hold_diff > self.HOLD_INTERVAL_MS:
                self.last_hold_time = current_time
                if "during_long_press" in self.callbacks:
                    self.callbacks["during_long_press"]()

    # 回调注册方法
    def on_click(self, callback):
        self.callbacks["click"] = callback

    def on_double_click(self, callback):
        self.callbacks["double_click"] = callback

    def on_long_press_start(self, callback):
        self.callbacks["long_press_start"] = callback

    def on_during_long_press(self, callback):
        self.callbacks["during_long_press"] = callback

    def on_long_press_end(self, callback):
        self.callbacks["long_press_end"] = callback

    def get_state(self):
        """获取当前状态（调试用）"""
        return {
            "state": self.state,
            "clicks": self.click_count,
            "long": self.long_press_detected,
            OneButton.pressed: self.is_pressed(),
        }

    def deinit(self):
        """清理资源"""
        self._reset_state()
        self.pin.irq(handler=None)
        self.callbacks.clear()
