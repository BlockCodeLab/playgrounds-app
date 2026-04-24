#ifndef EMAKEFUN_SPEECH_RECOGNIZER_H_
#define EMAKEFUN_SPEECH_RECOGNIZER_H_

#include <WString.h>
#include <Wire.h>
#include <stdint.h>

namespace emakefun {

class SpeechRecognizer {
public:
  static constexpr uint8_t kDefaultI2cAddress = 0x30;

  static constexpr uint8_t kMaxKeywordDataBytes = 50;

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

  enum RecognitionMode : uint8_t {
    kRecognitionAuto,
    kButtonTrigger,
    kKeywordTrigger,
    kKeywordOrButtonTrigger,
  };

  enum Event : uint8_t {
    kEventNone = 0,                  ///< 无事件
    kEventStartWaitingForTrigger,    ///< 开始等待触发
    kEventButtonTriggered,           ///< 被按键触发
    kEventKeywordTriggered,          ///< 被关键词触发
    kEventStartRecognizing,          ///< 开始识别
    kEventSpeechRecognized,          ///< 识别成功
    kEventSpeechRecognitionTimedOut, ///< 识别超时
  };

  explicit SpeechRecognizer(TwoWire &wire = Wire,
                            const uint8_t i2c_address = kDefaultI2cAddress);

  ErrorCode Initialize();

  void SetRecognitionMode(const RecognitionMode recognition_mode);

  void SetTimeout(const uint32_t timeout_ms);

  void AddKeyword(const uint8_t index, const String &keyword);

  int16_t Recognize();

  Event GetEvent();

private:
  SpeechRecognizer(const SpeechRecognizer &) = delete;
  SpeechRecognizer &operator=(const SpeechRecognizer &) = delete;
  ErrorCode WaitUntilIdle();

  TwoWire &wire_ = Wire;
  const uint8_t i2c_address_ = kDefaultI2cAddress;
};
} // namespace emakefun

#endif
