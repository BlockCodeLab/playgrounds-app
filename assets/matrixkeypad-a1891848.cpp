#include "matrixkeypad.h"

#include <Wire.h>

#define SETTING_REGISTER_START_BYTE (0xB0)
#define TOUCH_KEY_STATUS_DATA_REGISTER (0x08)
#define KEY_TRIGGER_THRESHOLD_VALUE (0x3F)
#define KEY_STATUS_STRUCTURE_SIZE (2)

#define WIRE_TIMEOUT_US (3000)

namespace {
constexpr char g_keys[] = {
    '1', '4', '7', '*', '2', '5', '8', '0',
    '3', '6', '9', '#', 'A', 'B', 'C', 'D',
};

template <size_t size>
constexpr uint8_t Checksum(const uint8_t (&data)[size],
                           const size_t index = 0) {
  return index >= size ? 0 : data[index] + Checksum(data, index + 1);
}

} // namespace

MatrixKeypad::MatrixKeypad(const uint8_t i2c_address,
                           const uint16_t debounce_duration_ms)
    : i2c_address_(i2c_address), debounce_duration_ms_(debounce_duration_ms) {}

bool MatrixKeypad::Init() {
  for (uint8_t i = 0; i < 5; i++) {
    Wire.beginTransmission(i2c_address_);
    if (Wire.endTransmission() == 0) {
      return true;
    }
  }
  return false;
}

const char MatrixKeypad::GetKey() {
  int16_t key_states = ReadKeyStates();
  if (start_debounce_time_ == UINT64_MAX || key_states != last_key_states_) {
    last_key_states_ = key_states;
    start_debounce_time_ = millis();
  } else if (key_states_ != last_key_states_ &&
             millis() - start_debounce_time_ >= 40) {
    key_states_ = last_key_states_;
  }

  char touched_key = g_keys[__builtin_ffs(key_states_) - 1];
  return touched_key;
}

int16_t MatrixKeypad::ReadKeyStates() {
  int16_t key_states = 0;
  if (sizeof(key_states) !=
      Wire.requestFrom(i2c_address_, sizeof(key_states))) {
    return key_states;
  }
  if (sizeof(key_states) !=
      Wire.readBytes(reinterpret_cast<uint8_t *>(&key_states),
                     sizeof(key_states))) {
    return key_states;
  }
  return key_states;
}
