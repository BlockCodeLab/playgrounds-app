#pragma once
#include <Arduino.h>
#include <Wire.h>
#include <stdint.h>

#include "debouncer.h"

class MatrixKeypad {
public:
  static constexpr uint8_t kDefaultI2cAddress = 0x65; /**< 0x65: 默认I2C地址 */

  enum ErrorCode : uint32_t {
    kOK = 0,                                  /**< 0：成功 */
    kI2cDataTooLongToFitInTransmitBuffer = 1, /**< 1：I2C数据太长 */
    kI2cReceivedNackOnTransmitOfAddress = 2,  /**< 2：在I2C发送地址时收到NACK */
    kI2cReceivedNackOnTransmitOfData = 3,     /**< 3：在I2C发送数据时收到NACK */
    kI2cOtherError = 4,                       /**< 4：其他I2C错误 */
    kI2cTimeout = 5,                          /**< 5：I2C通讯超时 */
    kInvalidParameter = 6,                    /**< 6：参数错误 */
    kUnknownError = 7,                        /**< 7：未知错误 */
  };

  enum Key : uint16_t {
    kKeyNone = static_cast<Key>(0),             /**< 无按键 */
    kKey0 = static_cast<Key>(1) << 7,           /**< 按键0 */
    kKey1 = static_cast<Key>(1) << 0,           /**< 按键1 */
    kKey2 = static_cast<Key>(1) << 4,           /**< 按键2 */
    kKey3 = static_cast<Key>(1) << 8,           /**< 按键3 */
    kKey4 = static_cast<Key>(1) << 1,           /**< 按键4 */
    kKey5 = static_cast<Key>(1) << 5,           /**< 按键5 */
    kKey6 = static_cast<Key>(1) << 9,           /**< 按键6 */
    kKey7 = static_cast<Key>(1) << 2,           /**< 按键7 */
    kKey8 = static_cast<Key>(1) << 6,           /**< 按键8 */
    kKey9 = static_cast<Key>(1) << 10,          /**< 按键9 */
    kKeyA = static_cast<Key>(1) << 12,          /**< 按键A */
    kKeyB = static_cast<Key>(1) << 13,          /**< 按键B */
    kKeyC = static_cast<Key>(1) << 14,          /**< 按键C */
    kKeyD = static_cast<Key>(1) << 15,          /**< 按键D */
    kKeyAsterisk = static_cast<Key>(1) << 3,    /**< 按键星号 */
    kKeyNumberSign = static_cast<Key>(1) << 11, /**< 按键井号 */
  };

  enum KeyState : uint8_t {
    kKeyStateIdle,     /**< 按键空闲 */
    kKeyStatePressed,  /**< 按键被按下*/
    kKeyStatePressing, /**< 按键被按住*/
    kKeyStateReleased, /**< 按键被弹起*/
  };

  explicit MatrixKeypad(TwoWire &wire = Wire,
                        const uint8_t i2c_address = kDefaultI2cAddress);

  ErrorCode Init();

  void Tick();

  bool Pressed(const Key key);

  bool Pressing(const Key key);

  bool Released(const Key key);

  bool Idle(const Key key);

  KeyState GetKeyState(const Key key);

private:
  MatrixKeypad(const MatrixKeypad &) = delete;
  MatrixKeypad &operator=(const MatrixKeypad &) = delete;
  Key ReadKey();

  TwoWire &wire_ = Wire;
  const uint8_t i2c_address_ = kDefaultI2cAddress;
  Debouncer<Key> key_;
  Key last_key_ = kKeyNone;
  uint64_t tick_time_ = UINT64_MAX;
};
