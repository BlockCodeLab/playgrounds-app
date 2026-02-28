#pragma once

#include <Arduino.h>
#include <stdint.h>
#include <stdlib.h>
#include <string.h>

#ifndef DEFAULT_MAX_LED_NUMBER
#define DEFAULT_MAX_LED_NUMBER 32
#endif

// 颜色类型：使用 long 表示 RGB 颜色，格式 0x00RRGGBB
typedef long cRGB;

// 效果模式枚举
enum EffectMode {
  EFFECT_NONE,
  RAINBOW_CYCLE,
  CHASE,
  TWINKLE,
  SPARKLE,
  BREATHING,
  SCANNER,
  WATERFALL,
  WHIRLPOOL,
  LIGHT_SPOT,
  LIGHT_WHEEL
};

class LedPixel {
public:
  // 构造函数
  LedPixel(uint8_t port, uint8_t led_num);

  // 析构函数
  ~LedPixel(void);

  // 重新设置引脚（不清除数据）
  void setpin(uint8_t port);

  // 设置LED数量（会重新分配内存）
  void setNumber(uint8_t num_leds);

  // 获取当前LED数量
  uint8_t getNumber(void);

  // 获取某个LED的原始颜色（未应用亮度），index从1开始
  cRGB getColorAt(uint8_t index);

  // 设置颜色（1-based index，0表示全部）
  bool setColor(uint8_t index, uint8_t red, uint8_t green, uint8_t blue);
  bool setColor(uint8_t red, uint8_t green, uint8_t blue); // 全部
  bool setColor(uint8_t index, long value); // 24位颜色值 0xRRGGBB

  // 设置全局亮度（0~255，影响所有LED）
  void setBrightness(uint8_t b);

  // 设置单个LED的亮度（0~255，1-based index，0表示全部）
  void setBrightnessAt(uint8_t index, uint8_t b);

  // 获取单个LED的亮度（0~255，1-based index）
  uint8_t getBrightnessAt(uint8_t index);

  // 将数据发送到LED灯带
  void show(void);

  // 便捷函数：使用枚举设置颜色并立即显示
  void SetRgbColor(uint8_t index, long Color);

  // HSV颜色设置（hue:0~360, sat:0~255, val:0~255）
  void setHSV(uint8_t index, uint16_t hue, uint8_t sat,
              uint8_t val); // index 1-based，0表示全部
  void setHSV(uint16_t hue, uint8_t sat, uint8_t val); // 全部

  // 随机颜色生成
  static cRGB randomColor(); // 随机色相，最大饱和度亮度
  static cRGB
  randomColor(uint8_t minBrightness); // 随机色相，亮度在minBrightness~255之间

  // 初始化（兼容LedPixel的begin，实际已由构造函数完成）
  void begin();

  // 清空所有LED
  void clear();

  // 填充所有LED为指定颜色，亮度等级设为10（最大）
  void fill(cRGB color);

  // 设置单个LED（brightness为1~10等级，内部映射到25~255）
  void setPixel(uint16_t index, uint8_t brightness, cRGB color);

  // 获取LED的当前颜色（原始颜色，未应用亮度）
  cRGB getPixelColor(uint16_t index) const;

  // 彩虹效果（每个LED色相递增）
  void rainbow(uint8_t hue);

  // 环形彩虹效果（色相环绕）
  void rainbowCycle(uint8_t hueOffset = 0);

  // 追逐效果
  void chase(cRGB color = randomColor(), uint8_t spacing = 2);

  // 闪烁效果
  void twinkle(cRGB color = randomColor());

  // 火花效果
  void sparkle(cRGB color = randomColor(), uint8_t sparkleCount = 3);

  // 呼吸效果
  void breathing(cRGB color = randomColor());

  // 扫描效果（来回移动）
  void scanner(cRGB color = randomColor());

  // 瀑布效果（单向移动）
  void waterfall(cRGB color = randomColor());

  // 旋涡效果（环形单向移动）
  void whirlpool(cRGB color = randomColor());

  // 光点移动（单个亮点）
  void lightSpot(cRGB color = randomColor());

  // 光轮效果（全亮，一个暗点移动）
  void lightWheel(cRGB color = randomColor());
  // ==================== 结束 ====================

private:
  uint8_t *pixels;         // 当前实际显示数据（已应用全局和局部亮度），顺序 GRB
  uint8_t *orig_pixels;    // 原始颜色数据（未应用亮度），顺序 GRB
  uint8_t *led_brightness; // 每个LED的独立亮度 (0~255)
  uint8_t *pixels_bak;     // 上一次发送的数据备份，用于避免重复发送
  uint8_t count_led;       // LED 数量
  uint16_t
      brightness;  // 全局亮度因子，范围 1~256（用户输入 0~255 映射为 1~256）
  uint8_t pinMask; // 引脚位掩码
  volatile uint8_t *ws2812_port; // 端口寄存器指针

  // 内部函数：设置指定索引（0-based）的颜色，同时更新原始和当前缓冲区
  bool setColorAt(uint8_t index, uint8_t red, uint8_t green, uint8_t blue);

  // 重新计算某个LED的显示像素（基于orig_pixels和当前亮度）
  void updatePixel(uint8_t led_index);

  // 填充备份缓冲区为指定颜色（用于初始化）
  void fillPixelsBak(uint8_t red, uint8_t green, uint8_t blue);

  // 核心发送函数（AVR汇编实现）
  void rgbled_sendarray_mask(uint8_t *data, uint16_t datlen, uint8_t maskhi,
                             uint8_t *port);

  // HSV 转 RGB 辅助函数（返回long颜色值）
  static cRGB hsvToRgb(uint16_t hue, uint8_t sat, uint8_t val);

  // ==================== 新增私有辅助函数与状态 ====================
  // 亮度等级（1~10）映射到实际亮度（0~255）
  uint8_t levelToActual(uint8_t level) const;

  // 将所有LED的亮度衰减指定量（实际亮度值减少amount，不低于0）
  void fadeAll(uint8_t amount);

  // 效果状态变量
  EffectMode _lastEffect;
  uint8_t _chaseOffset;
  bool _twinkleState;
  uint8_t _sparkleCount;
  uint8_t _sparkleIndices[5]; // 最多5个火花位置
  uint8_t _breathBrightness;  // 呼吸亮度等级（1~10）
  bool _breathIncreasing;
  int16_t _scannerPosition; // 扫描位置，可为负
  bool _scannerForward;
  uint8_t _waterfallPosition;
  uint8_t _waterpoolPosition;
  uint8_t _spotPosition;
  uint8_t _wheelPosition;
  uint8_t _rainbowHue; // 用于彩虹循环的内部偏移
};
