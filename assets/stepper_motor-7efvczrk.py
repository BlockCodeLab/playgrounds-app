import asyncio
import time

from machine import Pin
from micropython import const

FULL_ROTATION = (
    4075.7728395061727 / 8
)  # http://www.jangeox.be/2013/10/stepper-motor-28byj-48_25.html


class StepperMotor:
    MODE_NONE = const(0)
    MODE_RUN_FORWARD = const(1)
    MODE_RUN_BACKWARD = const(2)
    MODE_RUN_WITH_POSITION = const(3)

    SINGLE_PHASE_FULL_STEP_EXCITATION = const(0)
    TWO_PHASE_FULL_STEP_EXCITATION = const(1)
    HALF_PHASE_EXCITATION = const(2)

    STEPS = (
        (  # A, B, C, D
            (1, 0, 0, 0),
            (0, 1, 0, 0),
            (0, 0, 1, 0),
            (0, 0, 0, 1),
        ),
        (
            (1, 1, 0, 0),
            (0, 1, 1, 0),
            (0, 0, 1, 1),
            (1, 0, 0, 1),
        ),
        (
            (1, 0, 0, 0),
            (1, 1, 0, 0),
            (0, 1, 0, 0),
            (0, 1, 1, 0),
            (0, 0, 1, 0),
            (0, 0, 1, 1),
            (0, 0, 0, 1),
            (1, 0, 0, 1),
        ),
    )

    def __init__(self, pin_a, pin_b, pin_c, pin_d) -> None:
        self._pin_ins = (
            Pin(pin_a, Pin.OUT),
            Pin(pin_b, Pin.OUT),
            Pin(pin_c, Pin.OUT),
            Pin(pin_d, Pin.OUT),
        )
        for pin in self._pin_ins:
            pin.value(1)
        self._excitation = StepperMotor.HALF_PHASE_EXCITATION
        self._current_step = 0
        self._target_step = 0
        self._mode = StepperMotor.MODE_NONE
        self._last_step_time_us = -1
        self._rpm = 10
        self._step_us = 2000
        self._step_values = StepperMotor.STEPS[self._excitation]
        self._update_step_us()

    @property
    def excitation(self):
        return self._excitation

    @excitation.setter
    def excitation(self, excitation):
        self._excitation = excitation
        self._step_values = StepperMotor.STEPS[self._excitation]
        self._update_step_us()

    @property
    def rpm(self):
        return self._rpm

    @rpm.setter
    def rpm(self, rpm):
        if rpm <= 0:
            raise ValueError(f"{rpm} is not rpm value")

        self._rpm = float(rpm)
        self._update_step_us()

    def _update_step_us(self):
        self._step_us = (60 * 1000 * 1000) / (
            self._rpm * FULL_ROTATION * len(self._step_values)
        )

    def _angle_to_step(self, angle):
        return round(angle * FULL_ROTATION * len(self._step_values) / 360)

    def _step_to_angle(self, step):
        return step * 360.0 / len(self._step_values) / FULL_ROTATION

    @property
    def reached_target_angle(self):
        return self._mode == StepperMotor.MODE_NONE

    @property
    def current_step(self):
        return self._current_step

    @current_step.setter
    def current_step(self, current_step):
        self._current_step = current_step

    @property
    def current_angle(self):
        return self._step_to_angle(self._current_step)

    @current_angle.setter
    def current_angle(self, current_angle):
        self._current_step = self._angle_to_step(current_angle)

    @property
    def target_step(self):
        return self._target_step

    @target_step.setter
    def target_step(self, target_step):
        self._mode = StepperMotor.MODE_RUN_WITH_POSITION
        self._target_step = float(target_step)

    def move(self, steps):
        self.target_step = self.current_step - steps

    @property
    def target_angle(self):
        return self._target_angle

    @target_angle.setter
    def target_angle(self, target_angle):
        self._target_angle = float(target_angle)
        self._mode = StepperMotor.MODE_RUN_WITH_POSITION
        self._target_step = self._angle_to_step(self._target_angle)

    def rotate(self, angle):
        self.target_angle = self.current_angle - angle

    def forward(self):
        self._mode = StepperMotor.MODE_RUN_FORWARD

    def backward(self):
        self._mode = StepperMotor.MODE_RUN_BACKWARD

    def stop(self):
        self._mode = StepperMotor.MODE_NONE
        for pin in self._pin_ins:
            pin.value(1)

    def tick(self):
        if (
            self._last_step_time_us != -1
            and time.ticks_us() - self._last_step_time_us < self._step_us
        ):
            return

        self._last_step_time_us = time.ticks_us()

        if self._mode == StepperMotor.MODE_RUN_WITH_POSITION:
            if self._target_step > self._current_step:
                self._current_step += 1
            elif self._target_step < self._current_step:
                self._current_step -= 1
            if self._current_step == self._target_step:
                self._mode = StepperMotor.MODE_NONE
        elif self._mode == StepperMotor.MODE_RUN_FORWARD:
            self._current_step -= 1
        elif self._mode == StepperMotor.MODE_RUN_BACKWARD:
            self._current_step += 1

        current_step = self._current_step % len(self._step_values)
        if current_step < 0:
            current_step += len(self._step_values)

        step_value = self._step_values[current_step]
        for i in range(4):
            self._pin_ins[i].value(step_value[i])

    async def run_wait(self):
        while self._mode != StepperMotor.MODE_NONE:
            self.tick()
            await asyncio.sleep(0)

    def run(self):
        asyncio.create_task(self.run_wait())
