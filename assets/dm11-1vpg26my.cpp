#include "dm11.h"

namespace {
enum MemoryAddress : uint8_t {
  kMemAddrPwmDuty0 = 0x50,
  kMemAddrPwmDuty1 = 0x52,
  kMemAddrPwmDuty2 = 0x54,
  kMemAddrPwmDuty3 = 0x56,
  kMemAddrFrequency = 0x60,
};
}

Dm11::Dm11(const uint8_t i2c_address, TwoWire &wire)
    : i2c_address_(i2c_address), wire_(wire) {}

Dm11::ErrorCode Dm11::Init(const uint16_t frequency_hz) {
  if (frequency_hz < kMinFrequencyHz || frequency_hz > kMaxFrequencyHz) {
    return kInvalidParameter;
  }

  wire_.begin();
  wire_.beginTransmission(i2c_address_);
  wire_.write(kMemAddrFrequency);
  wire_.write(reinterpret_cast<const uint8_t *>(&frequency_hz),
              sizeof(frequency_hz));
  const auto ret = static_cast<ErrorCode>(wire_.endTransmission());
  if (ret != kOK) {
    return ret;
  }

  const uint16_t duties[kPwmChannelNum] = {0};
  wire_.beginTransmission(i2c_address_);
  wire_.write(kMemAddrPwmDuty0);
  wire_.write(reinterpret_cast<const uint8_t *>(duties), sizeof(duties));
  return static_cast<ErrorCode>(wire_.endTransmission());
}

Dm11::ErrorCode Dm11::PwmDuty(const PwmChannel pwm_channel, uint16_t duty) {
  if (pwm_channel >= kPwmChannelNum) {
    return kInvalidParameter;
  }
  duty = min(kMaxPwmDuty, duty);
  wire_.beginTransmission(i2c_address_);
  wire_.write(kMemAddrPwmDuty0 + (((pwm_channel + 2) % kPwmChannelNum) << 1));
  wire_.write(reinterpret_cast<const uint8_t *>(&duty), sizeof(duty));
  return static_cast<ErrorCode>(wire_.endTransmission());
}
