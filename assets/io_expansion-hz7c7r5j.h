#pragma once

#include <Arduino.h>
#include <stdint.h>

class IOExpansion {
public:
  enum GpioMode : uint8_t {
    kNone = 0,
    kInputPullUp = 1 << 0,
    kInputPullDown = 1 << 1,
    kInputFloating = 1 << 2,
    kOutput = 1 << 3,
    kAdc = 1 << 4,
    kPwm = 1 << 5,
  };

  enum GpioPin : uint8_t {
    kGpioPinE0 = 0,
    kGpioPinE1 = 1,
    kGpioPinE2 = 2,
    kGpioPinE3 = 3,
    kGpioPinE4 = 4,
    kGpioPinE5 = 5,
    kGpioPinE6 = 6,
    kGpioPinE7 = 7,
  };

  enum {
    kDeviceI2cAddressDefault = 0x24,
  };

  IOExpansion(uint8_t device_i2c_address = kDeviceI2cAddressDefault);

  void Init();

  bool SetGpioMode(GpioPin gpio_pin, GpioMode mode);

  bool SetGpioLevel(GpioPin gpio_pin, uint8_t level);

  uint8_t GetGpioLevel(GpioPin gpio_pin);

  uint16_t GetGpioAdcValue(GpioPin gpio_pin);

  bool SetPwmFrequency(uint16_t frequency);

  bool SetPwmDuty(GpioPin gpio_pin, uint16_t duty);

  bool SetServoAngle(GpioPin gpio_pin, float angle);

private:
  uint8_t device_i2c_address_;
};
