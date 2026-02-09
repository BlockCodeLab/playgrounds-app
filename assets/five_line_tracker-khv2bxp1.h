#pragma once

#include <Wire.h>
#include <stdint.h>

class FiveLineTracker {
public:
  static constexpr uint8_t kDefaultI2cAddress = 0x50;
  static constexpr uint8_t kLineNumber = 5;

  enum ErrorCode : uint32_t {
    kOK = 0,
    kI2cDataTooLongToFitInTransmitBuffer = 1,
    kI2cReceivedNackOnTransmitOfAddress = 2,
    kI2cReceivedNackOnTransmitOfData = 3,
    kI2cOtherError = 4,
    kI2cTimeout = 5,
    kInvalidParameter = 6,
  };

  explicit FiveLineTracker(TwoWire &wire = Wire,
                           const uint8_t i2c_address = kDefaultI2cAddress);
  ErrorCode Initialize();
  uint8_t DeviceId();
  uint8_t FirmwareVersion();
  void HighThresholds(const uint16_t high_thresholds[kLineNumber]);
  void HighThreshold(const uint8_t channel, const uint16_t high_threshold);
  void LowThresholds(const uint16_t low_thresholds[kLineNumber]);
  void LowThreshold(const uint8_t channel, const uint16_t low_threshold);
  void AnalogValues(uint16_t analog_values[kLineNumber]);
  uint16_t AnalogValue(uint8_t channel);
  uint8_t DigitalValues();
  uint8_t DigitalValue(uint8_t channel);

private:
  TwoWire &wire_ = Wire;
  const uint8_t i2c_address_ = kDefaultI2cAddress;
};
