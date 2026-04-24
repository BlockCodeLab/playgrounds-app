#include "speech_recognizer.h"

#include <Arduino.h>
#include <Wire.h>

namespace emakefun {
namespace {

constexpr uint8_t kVersion = 1;

enum MemoryAddress : uint8_t {
  kMemoryAddressVersion = 0x00,
  kMemoryAddressBusy = 0x01,
  kMemoryAddressReset = 0x02,
  kMemoryAddressRecognitionMode = 0x03,
  kMemoryAddressResult = 0x04,
  kMemoryAddressEvent = 0x06,
  kMemoryAddressTimeout = 0x08,
  kMemoryAddressKeywordIndex = 0x0C,
  kMemoryAddressKeywordData = 0x0D,
  kMemoryAddressKeywordLength = 0x3F,
  kMemoryAddressAddKeyword = 0x40,
  kMemoryAddressRecognize = 0x41,
};

enum Command : uint8_t {
  kCommandNone = 0,
  kReset,
  kAddIdentification,
  kSetTrigger,
  kSetTimeout,
};

template <typename T>
inline T Min(const T x, const T y) {
  return x < y ? x : y;
}

}  // namespace

SpeechRecognizer::SpeechRecognizer(TwoWire& wire, const uint8_t i2c_address) : wire_(wire), i2c_address_(i2c_address) {
}

SpeechRecognizer::ErrorCode SpeechRecognizer::Initialize() {
  wire_.beginTransmission(i2c_address_);
  wire_.write(kMemoryAddressReset);
  wire_.write(1);
  const ErrorCode ret = static_cast<ErrorCode>(wire_.endTransmission());
  if (ret != 0) {
    return ret;
  }
  return WaitUntilIdle();
}

void SpeechRecognizer::SetRecognitionMode(const RecognitionMode recognition_mode) {
  WaitUntilIdle();
  wire_.beginTransmission(i2c_address_);
  wire_.write(kMemoryAddressRecognitionMode);
  wire_.write(recognition_mode);
  wire_.endTransmission();
}

void SpeechRecognizer::SetTimeout(const uint32_t timeout_ms) {
  WaitUntilIdle();
  wire_.beginTransmission(i2c_address_);
  wire_.write(kMemoryAddressTimeout);
  wire_.write(reinterpret_cast<const uint8_t*>(&timeout_ms), sizeof(timeout_ms));
  wire_.endTransmission();
}

void SpeechRecognizer::AddKeyword(const uint8_t index, const String& keyword) {
  WaitUntilIdle();
  wire_.beginTransmission(i2c_address_);
  wire_.write(kMemoryAddressKeywordIndex);
  wire_.write(index);
  wire_.endTransmission();

  wire_.beginTransmission(i2c_address_);
  wire_.write(kMemoryAddressKeywordData);
  wire_.write(reinterpret_cast<const uint8_t*>(keyword.c_str()), Min<size_t>(kMaxKeywordDataBytes, keyword.length()));
  wire_.endTransmission();

  wire_.beginTransmission(i2c_address_);
  wire_.write(kMemoryAddressKeywordLength);
  wire_.write(Min<uint8_t>(kMaxKeywordDataBytes, keyword.length()));
  wire_.endTransmission();

  wire_.beginTransmission(i2c_address_);
  wire_.write(kMemoryAddressAddKeyword);
  wire_.write(1);
  wire_.endTransmission();
}

int16_t SpeechRecognizer::Recognize() {
  WaitUntilIdle();
  wire_.beginTransmission(i2c_address_);
  wire_.write(kMemoryAddressRecognize);
  wire_.write(1);
  wire_.endTransmission();

  wire_.beginTransmission(i2c_address_);
  wire_.write(kMemoryAddressResult);
  wire_.endTransmission();
  wire_.requestFrom(i2c_address_, static_cast<uint8_t>(sizeof(int16_t)));

  int16_t result = -1;
  wire_.readBytes(reinterpret_cast<uint8_t*>(&result), sizeof(int16_t));
  return result;
}

SpeechRecognizer::Event SpeechRecognizer::GetEvent() {
  wire_.beginTransmission(i2c_address_);
  wire_.write(kMemoryAddressEvent);
  wire_.endTransmission();
  wire_.requestFrom(i2c_address_, static_cast<uint8_t>(1));
  return static_cast<SpeechRecognizer::Event>(wire_.read());
}

SpeechRecognizer::ErrorCode SpeechRecognizer::WaitUntilIdle() {
  while (true) {
    wire_.beginTransmission(i2c_address_);
    wire_.write(kMemoryAddressBusy);
    const ErrorCode ret = static_cast<ErrorCode>(wire_.endTransmission());
    if (0 != ret) {
      return ret;
    }
    if (1 != wire_.requestFrom(i2c_address_, static_cast<uint8_t>(1))) {
      return kUnknownError;
    }

    if (!wire_.available()) {
      return kUnknownError;
    }

    if (0 == wire_.read()) {
      break;
    }
    yield();
  }
  return kOK;
}
}  // namespace emakefun