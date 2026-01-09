#pragma once

#include <Arduino.h>
#include <stdint.h>

class MatrixKeypad {
private:
  MatrixKeypad(const MatrixKeypad &) = delete;
  MatrixKeypad &operator=(const MatrixKeypad &) = delete;

  const uint8_t i2c_address_;
  const uint16_t debounce_duration_ms_;
  int16_t last_key_states_ = 0;
  uint16_t start_debounce_time_ = UINT16_MAX;
  int16_t key_states_ = 0;

  int16_t ReadKeyStates();

public:
  static constexpr uint8_t kDeviceI2cAddressDefault = 0x65; // 默认I2C地址
  static constexpr uint8_t kDefaultDebounceDurationMs = 20;

  MatrixKeypad(
      const uint8_t i2c_address = kDeviceI2cAddressDefault,
      const uint16_t debounce_duration_ms = kDefaultDebounceDurationMs);

  bool Init();
  const char GetKey();
  bool PressedKey(const char key) { return GetKey() == key; }
};
