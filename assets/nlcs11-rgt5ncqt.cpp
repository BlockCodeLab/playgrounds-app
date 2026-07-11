#include <math.h>
#include <stdlib.h>

#include "nlcs11.h"

namespace {
constexpr uint16_t kIntegrationTimes[] = {10, 20, 40, 80, 100, 200, 400, 800};
} // namespace

NLCS11::NLCS11(const Gain gain, const IntegrationTime integration_time,
               const uint8_t i2c_address, TwoWire &wire)
    : i2c_address_(i2c_address), wire_(wire), gain_(gain),
      integration_time_(integration_time) {
  // do somethings
}

NLCS11::ErrorCode NLCS11::Initialize() {
  ErrorCode ret = kOK;
  wire_.begin();
  wire_.beginTransmission(i2c_address_);
  wire_.write(0x80);
  wire_.write(0x03);
  wire_.write(gain_ << 4 | integration_time_);
  ret = static_cast<ErrorCode>(wire_.endTransmission());

  gammatable = (byte *)malloc(256 * sizeof(byte));
  for (int i = 0; i < 256; i++) {
    float x = i;
    x /= 255;
    x = pow(x, 2.5);
    x *= 255;
    // Serial.println(i);
    gammatable[i] = (int)(x + 0.5);
  }

  return ret;
}

bool NLCS11::ReadColor(Color *const color) {
  if (color == nullptr) {
    return false;
  }

  if (last_read_time_ == 0) {
    last_read_time_ = millis();
    return false;
  }

  if (millis() - last_read_time_ < kIntegrationTimes[integration_time_]) {
    return false;
  }

  last_read_time_ = millis();

  wire_.beginTransmission(i2c_address_);
  wire_.write(0xA0);
  wire_.endTransmission();

  // 请求从传感器读取4个字节的数据
  wire_.requestFrom(i2c_address_, sizeof(*color));

  // 确认读取的数据大小是否正确
  if (wire_.available() == sizeof(*color)) {
    wire_.readBytes(reinterpret_cast<uint8_t *>(color), sizeof(*color));
  } else {
    *color = Color{};
    return false;
  }

  if (color->c == 0) {
    *color = Color{};
    return false;
  }

  // color->r = static_cast<uint16_t>((float)color->r / color->c * 255);
  // color->g = static_cast<uint16_t>((float)color->g / color->c * 255);
  // color->b = static_cast<uint16_t>((float)color->b / color->c * 255);

  return true;
}

uint16_t NLCS11::GetRed() {
  ReadColor(&color_);
  return (uint16_t)(((float)color_.r / color_.c) * 255);
}

uint16_t NLCS11::GetRedToGamma() {
  uint16_t r = GetRed();
  return (uint16_t)gammatable[r];
}

uint16_t NLCS11::GetGreen() {
  ReadColor(&color_);
  return (uint16_t)(((float)color_.g / color_.c) * 255);
}

uint16_t NLCS11::GetGreenToGamma() {
  uint16_t g = GetGreen();
  return (uint16_t)gammatable[g];
}

uint16_t NLCS11::GetBlue() {
  ReadColor(&color_);
  return (uint16_t)(((float)color_.b / color_.c) * 255);
}

uint16_t NLCS11::GetBlueToGamma() {
  uint16_t b = GetBlue();
  return (uint16_t)gammatable[b];
}

uint32_t NLCS11::GetColor() {
  ReadColor(&color_);
  uint16_t r = (uint16_t)(((float)color_.r / color_.c) * 255);
  uint16_t g = (uint16_t)(((float)color_.g / color_.c) * 255);
  uint16_t b = (uint16_t)(((float)color_.b / color_.c) * 255);
  return ((uint32_t)r << 16) | ((uint32_t)g << 8) | (uint32_t)b;
}

uint32_t NLCS11::GetColorToGamma() {
  ReadColor(&color_);
  uint16_t r = (uint16_t)gammatable[(int)(((float)color_.r / color_.c) * 255)];
  uint16_t g = (uint16_t)gammatable[(int)(((float)color_.g / color_.c) * 255)];
  uint16_t b = (uint16_t)gammatable[(int)(((float)color_.b / color_.c) * 255)];
  return ((uint32_t)r << 16) | ((uint32_t)g << 8) | (uint32_t)b;
}
