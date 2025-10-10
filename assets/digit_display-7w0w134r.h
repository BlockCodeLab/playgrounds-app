#pragma once

#include <stdint.h>

/**
 * @cond English
 * @brief Four-digit display
 * @endcond
 * @cond Chinese
 * @brief 四位数码管显示器
 * @endcond
 */
class DigitDisplay {
 public:
  /**
   * @cond English
   * @brief Device I2C address constant
   * @endcond
   * @cond Chinese
   * @brief 设备I2C地址常量
   * @endcond
   */
  enum {
    /**
     * @cond English
     * Default I2C address is 0x70
     * @endcond
     * @cond Chinese
     * 默认I2C地址为0x70
     * @endcond
     */
    kDeviceI2cAddress = 0x70
  };

  /**
   * @cond English
   * @brief Blink rate enumeration
   * @endcond
   * @cond Chinese
   * @brief 闪烁频率枚举
   * @endcond
   */
  enum BlinkRate : uint8_t {
    /**
     * @cond English
     * Turn off blinking
     * @endcond
     * @cond Chinese
     * 关闭闪烁
     * @endcond
     */
    kBlinkOff = 0,
    /**
     * @cond English
     * Blink rate 2Hz
     * @endcond
     * @cond Chinese
     * 闪烁频率2Hz
     * @endcond
     */
    kBlinkRate2Hz = 1,
    /**
     * @cond English
     * Blink rate 1Hz
     * @endcond
     * @cond Chinese
     * 闪烁频率1Hz
     * @endcond
     */
    kBlinkRate1Hz = 2,
    /**
     * @cond English
     * Blink rate 0.5Hz
     * @endcond
     * @cond Chinese
     * 闪烁频率0.5Hz
     * @endcond
     */
    kBlinkRateHalfHz = 3,
  };

  /**
   * @cond English
   * @brief Base enumeration
   * @endcond
   * @cond Chinese
   * @brief 数制枚举
   * @endcond
   */
  enum Base : uint8_t {
    /**
     * @cond English
     * Binary
     * @endcond
     * @cond Chinese
     * 二进制
     * @endcond
     */
    kBin = 2,
    /**
     * @cond English
     * Octal
     * @endcond
     * @cond Chinese
     * 八进制
     * @endcond
     */
    kOct = 8,
    /**
     * @cond English
     * Decimal
     * @endcond
     * @cond Chinese
     * 十进制
     * @endcond
     */
    kDec = 10,
    /**
     * @cond English
     * Hexadecimal
     * @endcond
     * @cond Chinese
     * 十六进制
     * @endcond
     */
    kHex = 16,
  };

  /**
   * @cond English
   * @brief Maximum brightness constant
   * @endcond
   * @cond Chinese
   * @brief 最大亮度常量
   * @endcond
   */
  enum {
    /**
     * @cond English
     * The maximum brightness is 15
     * @endcond
     * @cond Chinese
     * 亮度最大值为15
     * @endcond
     */
    kBrightnessMax = 15
  };

  /**
   * @cond English
   * @brief Constructor
   * @param device_i2c_address Device I2C address, default is 0x70 (kDeviceI2cAddress)
   * @endcond
   * @cond Chinese
   * @brief 构造函数
   * @param device_i2c_address 设备I2C地址，默认为0x70（kDeviceI2cAddress）
   * @endcond
   */
  DigitDisplay(const uint8_t device_i2c_address = kDeviceI2cAddress);

  /**
   * @cond English
   * @brief Initialization settings
   * @endcond
   * @cond Chinese
   * @brief 初始化设置
   * @endcond
   */
  void Setup();

  /**
   * @cond English
   * @brief Clear the content on the display
   * @endcond
   * @cond Chinese
   * @brief 清空显示内容
   * @endcond
   */
  void Clear();

  /**
   * @cond English
   * @brief Set the blink rate
   * @param[in] blink_rate Blink rate enumeration
   * @endcond
   * @cond Chinese
   * @brief 设置闪烁频率
   * @param[in] blink_rate 闪烁频率枚举
   * @endcond
   */
  void SetBlinkRate(const BlinkRate blink_rate);

  /**
   * @cond English
   * @brief Set the brightness
   * @param[in] brightness Brightness value, range is 0-15
   * @endcond
   * @cond Chinese
   * @brief 设置亮度
   * @param[in] brightness 亮度值，范围为0-15
   * @endcond
   */
  void SetBrightness(uint8_t brightness);

  /**
   * @cond English
   * @brief Show/hide the colon
   * @param[in] state Show/hide
   * @endcond
   * @cond Chinese
   * @brief 显示/隐藏冒号
   * @param[in] state 显示/隐藏
   * @endcond
   */
  void ShowColon(const bool state);

  /**
   * @cond English
   * @brief Show a numeric character on a specified digit
   * @param[in] index Digit index, range is 0-3
   * @param[in] num Numeric value
   * @param[in] dot Whether to display the decimal point
   * @endcond
   * @cond Chinese
   * @brief 在指定的数码管上显示数字
   * @param[in] index 数码管索引，范围为0-3
   * @param[in] num 数字值
   * @param[in] dot 是否显示小数点
   * @endcond
   */
  void ShowDigitNumber(uint8_t index, const uint8_t num, const bool dot);

  /**
   * @cond English
   * @brief Show a numeric value
   * @param[in] num Numeric value, integer type, range is -999 ~ 9999, out of range will not be
   * displayed correctly and will display as "----"
   * @param[in] base Number system enumeration, default is 10 (DigitDisplay::kDec)
   * @endcond
   * @cond Chinese
   * @brief 显示数值
   * @param[in] num 数字值，整型，范围为 -999 ~ 9999，超出范围将无法正常显示，会显示为 "----"
   * @param[in] base 数制枚举，默认为10(DigitDisplay::kDec)
   * @endcond
   */
  template <typename T>
  void ShowNumber(T num, const Base base = kDec) {
    ShowNumber(static_cast<double>(num), base, 0);
  }

  /**
   * @cond English
   * @brief Display a numeric value
   * @param[in] num Numeric value, is float type, range is -999 ~ 9999, out of range will not be
   * displayed correctly and will display as "----"
   * @param[in] fractional_part_digits Number of decimal places, default is 2
   * @endcond
   *
   * @cond Chinese
   * @brief 显示数值
   * @param[in] num 数字值，float类型，范围为 -999 ~ 9999，超出范围将无法正常显示，会显示为 "----"
   * @param[in] fractional_part_digits 小数点后位数，默认为2
   * @endcond
   */

  void ShowNumber(float number, uint8_t fractional_part_digits) {
    ShowNumber(static_cast<double>(number), fractional_part_digits);
  }

  /**
   * @cond English
   * @brief Display a numeric value
   * @param[in] num Numeric value, is double type, range is -999 ~ 9999, out of range will not be
   * displayed correctly and will display as "----"
   * @param[in] fractional_part_digits Number of decimal places, default is 2
   * @endcond
   *
   * @cond Chinese
   * @brief 显示数值
   * @param[in] num 数字值，double类型，范围为 -999 ~ 9999，超出范围将无法正常显示，会显示为 "----"
   * @param[in] fractional_part_digits 小数点后位数，默认为2
   * @endcond
   */
  void ShowNumber(double number, uint8_t fractional_part_digits) {
    ShowNumber(number, kDec, fractional_part_digits);
  }

  /**
   * @cond English
   * @brief Display a numeric value
   * @param[in] number Numeric value, is float type, range is -999 ~ 9999, out of range will not
   * be displayed correctly and will display as "----"
   * @param[in] base Number system enumeration, default is 10 (DigitDisplay::kDec)
   * @param[in] fractional_part_digits Number of decimal places, default is 2
   * @endcond
   *
   * @cond Chinese
   * @brief 显示数值
   * @param[in] number 数字值，float类型，范围为 -999 ~ 9999，超出范围将无法正常显示，会显示为 "----"
   * @param[in] base 数制枚举，默认为10(DigitDisplay::kDec)
   * @param[in] fractional_part_digits 小数点后位数，默认为2
   * @endcond
   */
  void ShowNumber(float number, const Base base = kDec, uint8_t fractional_part_digits = 2) {
    ShowNumber(static_cast<double>(number), base, fractional_part_digits);
  }

  /**
   * @cond English
   * @brief Display a numeric value
   * @param[in] number Numeric value, is double type, range is -999 ~ 9999, out of range will not
   * be displayed correctly and will display as "----"
   * @param[in] base Number system enumeration, default is 10 (DigitDisplay::kDec)
   * @param[in] fractional_part_digits Number of decimal places, default is 2
   * @endcond
   *
   * @cond Chinese
   * @brief 显示数值
   * @param[in] number 数字值，double类型，范围为 -999 ~ 9999，超出范围将无法正常显示，会显示为 "----"
   * @param[in] base 数制枚举，默认为10(DigitDisplay::kDec)
   * @param[in] fractional_part_digits 小数点后位数，默认为2
   * @endcond
   */
  void ShowNumber(double number, const Base base = kDec, uint8_t fractional_part_digits = 2);

 private:
  /**
   * @cond English
   * @brief Display an error, the digit display will show "----"
   * @endcond
   * @cond Chinese
   * @brief 显示错误，数码管将会显示 "----"
   * @endcond
   */
  void ShowError();

  /**
   * @cond English
   * @brief Update the display
   * @endcond
   * @cond Chinese
   * @brief 更新显示内容
   * @endcond
   */
  void Display();

  uint8_t device_i2c_address_;
  uint16_t display_buffer_[5] = {0};
};