#pragma once
#include <Wire.h>
#include <stdint.h>

class NLCS11 {
public:
  static constexpr uint32_t kVersionMajor = 2;
  static constexpr uint32_t kVersionMinor = 0;
  static constexpr uint32_t kVersionPatch = 2;
  static constexpr uint8_t kDefaultI2cAddress = 0x43;

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

  enum Gain : uint8_t {
    kGain1X,   /**<  No gain  */
    kGain1p5X, /**<  1.5x gain  */
    kGain2X,   /**<  2x gain */
    kGain2p5X, /**<  2.5x gain */
  };

  enum IntegrationTime : uint8_t {
    kIntegrationTime10ms,
    kIntegrationTime20ms,
    kIntegrationTime40ms,
    kIntegrationTime80ms,
    kIntegrationTime100ms,
    kIntegrationTime200ms,
    kIntegrationTime400ms,
    kIntegrationTime800ms,
  };

  struct Color {
    /* data */
    uint16_t r = 0;
    uint16_t g = 0;
    uint16_t b = 0;
    uint16_t c = 0;
  };

  explicit NLCS11(const Gain gain = kGain1X,
                  const IntegrationTime integration_time = kIntegrationTime10ms,
                  const uint8_t i2c_address = kDefaultI2cAddress,
                  TwoWire &wire = Wire);

  explicit NLCS11(const Gain gain, const IntegrationTime integration_time,
                  TwoWire &wire)
      : NLCS11(gain, integration_time, kDefaultI2cAddress, wire) {}

  ErrorCode Initialize();

  bool GetColor(Color *const color) const;
  uint16_t GetRed() const;
  uint16_t GetGreen() const;
  uint16_t GetBlue() const;

private:
  NLCS11(const NLCS11 &) = delete;
  NLCS11 &operator=(const NLCS11 &) = delete;

  const uint8_t i2c_address_ = kDefaultI2cAddress;
  TwoWire &wire_ = Wire;
  const Gain gain_ = kGain1X;
  const IntegrationTime integration_time_ = kIntegrationTime10ms;
  mutable uint64_t last_read_time_ = 0;
  mutable Color color_;
};
