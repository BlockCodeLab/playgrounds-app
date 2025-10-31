#pragma once

#include <Wire.h>
#include <stdint.h>

class FiveLineTracker {
public:
  static constexpr uint8_t kDefaultI2cAddress = 0x50;
  static constexpr uint8_t kLineNumber = 5;

  /**
   * @enum ErrorCode
   * @brief 错误码
   */
  enum ErrorCode : uint32_t {
    kOK = 0, /**< 0：成功 */
    kI2cDataTooLongToFitInTransmitBuffer =
        1, /**< 1：I2C数据太长，无法装入传输缓冲区 */
    kI2cReceivedNackOnTransmitOfAddress = 2, /**< 2：在I2C发送地址时收到NACK */
    kI2cReceivedNackOnTransmitOfData = 3,    /**< 3：在I2C发送数据时收到NACK */
    kI2cOtherError = 4,                      /**< 4：其他I2C错误 */
    kI2cTimeout = 5,                         /**< 5：I2C通讯超时 */
    kInvalidParameter = 6,                   /**< 6：参数错误 */
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
