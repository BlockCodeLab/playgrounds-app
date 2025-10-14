#include "digit_display.h"

#include <Wire.h>

#define HT16K33_CMD_BLINK (0x80)         ///< I2C register for BLINK setting
#define HT16K33_BLINK_DISPLAY_ON (0x01)  ///< I2C value for steady on
#define HT16K33_CMD_BRIGHTNESS (0xE0)    ///< I2C register for BRIGHTNESS setting

#define DIGIT_NUMBER (4)
#define COLON_BUFFER_POSITION (2)

namespace {
constexpr uint8_t g_number_table[] = {
    0x3F, /* 0 */
    0x06, /* 1 */
    0x5B, /* 2 */
    0x4F, /* 3 */
    0x66, /* 4 */
    0x6D, /* 5 */
    0x7D, /* 6 */
    0x07, /* 7 */
    0x7F, /* 8 */
    0x6F, /* 9 */
    0x77, /* a */
    0x7C, /* b */
    0x39, /* C */
    0x5E, /* d */
    0x79, /* E */
    0x71, /* F */
};
}

DigitDisplay::DigitDisplay(const uint8_t device_i2c_address) : device_i2c_address_(device_i2c_address) {
}

void DigitDisplay::Setup() {
  Wire.begin();
  Wire.beginTransmission(device_i2c_address_);
  Wire.write(0x21);  // turn on oscillator
  Wire.endTransmission();
  SetBlinkRate(kBlinkOff);
  SetBrightness(14);
  Clear();
  Display();
}

void DigitDisplay::Clear() {
  memset(display_buffer_, 0, sizeof(display_buffer_));
  Display();
}

void DigitDisplay::Display() {
  Wire.beginTransmission(device_i2c_address_);
  Wire.write((uint8_t)0x00);  // start at address $00
  for (const auto display_buffer : display_buffer_) {
    Wire.write(display_buffer & 0xFF);
    Wire.write(display_buffer >> 8);
  }
  Wire.endTransmission();
}

void DigitDisplay::SetBlinkRate(const BlinkRate blink_rate) {
  Wire.beginTransmission(device_i2c_address_);
  Wire.write(HT16K33_CMD_BLINK | HT16K33_BLINK_DISPLAY_ON | (blink_rate << 1));
  Wire.endTransmission();
}

void DigitDisplay::SetBrightness(uint8_t brightness) {
  if (brightness > kBrightnessMax) {
    brightness = kBrightnessMax;
  }
  Wire.beginTransmission(device_i2c_address_);
  Wire.write(HT16K33_CMD_BRIGHTNESS | brightness);
  Wire.endTransmission();
}

void DigitDisplay::ShowColon(const bool state) {
  display_buffer_[2] = state << 1;
  Wire.beginTransmission(device_i2c_address_);
  Wire.write(static_cast<uint8_t>(0x04));  // start at address $02
  Wire.write(display_buffer_[2] & 0xFF);
  Wire.write(display_buffer_[2] >> 8);
  Wire.endTransmission();
}

void DigitDisplay::ShowDigitNumber(uint8_t index, const uint8_t number, const bool dot) {
  if (index >= DIGIT_NUMBER || number >= kHex) {
    return;
  }

  if (index >= COLON_BUFFER_POSITION) {
    index++;
  }

  display_buffer_[index] = g_number_table[number] | (dot << 7);
  Wire.beginTransmission(device_i2c_address_);
  Wire.write(index << 1);
  Wire.write(display_buffer_[index] & 0xFF);
  Wire.write(display_buffer_[index] >> 8);
  Wire.endTransmission();
}

void DigitDisplay::ShowNumber(double number, Base base, uint8_t fractional_part_digits) {
  uint8_t numeric_digits = DIGIT_NUMBER;  // available digits on display

  bool is_negative = false;
  if (number < 0) {
    --numeric_digits;
    number = -number;
    is_negative = true;
  }

  uint32_t limit_value = 1;
  for (uint8_t i = 0; i < numeric_digits; ++i) {
    limit_value *= base;
  }

  double to_int_factor = 1.0;
  for (uint8_t i = 0; i < fractional_part_digits; ++i) {
    to_int_factor *= base;
  }

  uint32_t display_number = number * to_int_factor + 0.5;
  while (display_number >= limit_value) {
    --fractional_part_digits;
    to_int_factor /= base;
    display_number = number * to_int_factor + 0.5;
  }

  if (to_int_factor < 1) {
    ShowError();
    return;
  }

  int8_t position = DIGIT_NUMBER;

  for (uint8_t i = 0; i <= fractional_part_digits || display_number > 0 || position == DIGIT_NUMBER; i++) {
    const bool display_decimal = (fractional_part_digits != 0 && i == fractional_part_digits);
    display_buffer_[position--] = g_number_table[display_number % base] | (display_decimal << 7);
    if (position == COLON_BUFFER_POSITION) {
      position--;
    }
    display_number /= base;
  }

  if (is_negative) {
    display_buffer_[position--] = 0x40;
  }
  // clear remaining display positions
  while (position >= 0) {
    display_buffer_[position--] = 0x00;
  }

  Display();
}

void DigitDisplay::ShowError() {
  for (auto& display_buffer : display_buffer_) {
    display_buffer = 0x40;
  }
  Display();
}
