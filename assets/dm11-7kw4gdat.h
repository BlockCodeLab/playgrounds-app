#pragma once
#include <Arduino.h>
#include <Wire.h>
#include <stdint.h>

namespace em {

class Dm11 {
public:
  static constexpr uint8_t kDefaultI2cAddress = 0x15;
  static constexpr uint16_t kMinFrequencyHz = 1;
  static constexpr uint16_t kMaxFrequencyHz = 10000;
  static constexpr uint16_t kMaxPwmDuty = 4095;

  enum ErrorCode : uint32_t {
    kOK = 0,
    kI2cDataTooLongToFitInTransmitBuffer = 1,
    kI2cReceivedNackOnTransmitOfAddress = 2,
    kI2cReceivedNackOnTransmitOfData = 3,
    kI2cOtherError = 4,
    kI2cTimeout = 5,
    kInvalidParameter = 6,
    kUnknownError = 7,
  };

  enum PwmChannel : uint8_t {
    kPwmChannel0 = 0,
    kPwmChannel1 = 1,
    kPwmChannel2 = 2,
    kPwmChannel3 = 3,
    kPwmChannelNum = 4,
  };

  explicit Dm11(const uint8_t i2c_address = kDefaultI2cAddress,
                TwoWire &wire = Wire);
  explicit Dm11(TwoWire &wire) : Dm11(kDefaultI2cAddress, wire) {}

  ErrorCode Init(const uint16_t frequency_hz = 1000);
  ErrorCode PwmDuty(const PwmChannel pwm_channel, uint16_t duty);

private:
  Dm11(const Dm11 &) = delete;
  Dm11 &operator=(const Dm11 &) = delete;

  const uint8_t i2c_address_ = kDefaultI2cAddress;
  TwoWire &wire_ = Wire;
};

} // namespace em
