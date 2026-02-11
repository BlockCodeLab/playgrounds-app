#pragma once

#include <Arduino.h>
#include <Wire.h>

#include "em_check.h"

namespace em {

class Tts20 {
public:
  static constexpr uint8_t kDefaultI2cAddress = 0x40;

  Tts20(const uint8_t i2c_address = kDefaultI2cAddress, TwoWire &wire = Wire);

  void Init();
  String firmware_version();
  uint8_t device_id();
  String name();
  bool Play(const String &text);
  bool IsBusy();
  bool Stop();
  bool Pause();
  bool Resume();

private:
  Tts20(const Tts20 &) = delete;
  Tts20 &operator=(const Tts20 &) = delete;

  void ClearRxBuffer();
  void Write(const uint8_t *data, const size_t size);
  uint8_t Read(uint8_t *buffer, const uint8_t expected_length,
               const uint32_t timeout_ms);
  bool ReadUntil(const uint8_t target_byte, const uint32_t timeout_ms);

  const uint8_t i2c_address_ = kDefaultI2cAddress;
  TwoWire &wire_ = Wire;
  uint8_t rx_buffer_capacity_ = 0;
};

} // namespace em
