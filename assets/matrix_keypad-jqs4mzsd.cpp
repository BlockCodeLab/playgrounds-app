#include "matrix_keypad.h"

MatrixKeypad::MatrixKeypad(TwoWire &wire, const uint8_t i2c_address)
    : wire_(wire), i2c_address_(i2c_address), key_(kKeyNone) {}

MatrixKeypad::ErrorCode MatrixKeypad::Init() {
  wire_.begin();
  tick_time_ = millis();

  ErrorCode ret = kUnknownError;
  for (uint8_t i = 0; i < 5; i++) {
    wire_.beginTransmission(i2c_address_);
    ret = static_cast<ErrorCode>(wire_.endTransmission());
    if (ret == kOK) {
      return ret;
    }
  }
  return ret;
}

void MatrixKeypad::Tick() {
  if (millis() - tick_time_ >= Debouncer<Key>::kDefaultDebounceDurationMs) {
    tick_time_ = millis();
    last_key_ = key_();
    key_ = ReadKey();
  }
}

bool MatrixKeypad::Pressed(const MatrixKeypad::Key key) {
  Tick();
  return (last_key_ & key) == 0 && (key_() & key) != 0;
}

bool MatrixKeypad::Pressing(const MatrixKeypad::Key key) {
  Tick();
  return (last_key_ & key) != 0 && (key_() & key) != 0;
}

bool MatrixKeypad::Released(const MatrixKeypad::Key key) {
  Tick();
  return (last_key_ & key) != 0 && (key_() & key) == 0;
}

bool MatrixKeypad::Idle(const MatrixKeypad::Key key) {
  Tick();
  return (last_key_ & key) == 0 && (key_() & key) == 0;
}

MatrixKeypad::KeyState MatrixKeypad::GetKeyState(const Key key) {
  if (Pressed(key)) {
    return kKeyStatePressed;
  } else if (Pressing(key)) {
    return kKeyStatePressing;
  } else if (Released(key)) {
    return kKeyStateReleased;
  }
  return kKeyStateIdle;
}

MatrixKeypad::Key MatrixKeypad::ReadKey() {
  Key key = kKeyNone;
  if (sizeof(key) != wire_.requestFrom(i2c_address_, sizeof(key))) {
    return key;
  }
  if (sizeof(key) !=
      wire_.readBytes(reinterpret_cast<uint8_t *>(&key), sizeof(key))) {
    return key;
  }
  return key;
}
