#pragma once

#include <FastLED.h>

template <uint8_t DATA_PIN, uint16_t NUM_LEDS> class LedPixel {
public:
  enum Effect {
    NO_EFFECT = 0,
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

  // 构造函数和初始化
  LedPixel();
  void begin();

  // 基础控制
  void clear();
  void setBrightness(uint8_t brightness);
  void fill(CRGB color);

  // LED控制
  void setPixel(uint16_t index, uint8_t brightness, CRGB color);
  void setPixel(uint16_t index, CRGB color) { setPixel(index, 10, color); }
  void show() { FastLED.show(); }

  // 效果函数（无参数时使用随机颜色）
  void rainbow(uint8_t hue);
  void rainbowCycle(uint8_t hueOffset = 0);
  void chase(CRGB color = randomColor(), uint8_t spacing = 2);
  void twinkle(CRGB color = randomColor());
  void sparkle(CRGB color = randomColor(), uint8_t sparkleCount = 3);
  void breathing(CRGB color = randomColor());
  void scanner(CRGB color = randomColor());
  void waterfall(CRGB color = randomColor());
  void whirlpool(CRGB color = randomColor());
  void lightSpot(CRGB color = randomColor());
  void lightWheel(CRGB color = randomColor());

  // 工具函数
  Effect getLastEffect() const { return _lastEffect; }
  uint16_t getNumPixels() const { return NUM_LEDS; }
  CRGB getPixelColor(uint16_t index) const;

  // 随机颜色生成
  static CRGB randomColor();
  static CRGB randomColor(uint8_t minBrightness);

private:
  CRGB _leds[NUM_LEDS];
  uint8_t _brightnessLevels[NUM_LEDS];

  uint8_t _globalBrightness = 100;
  Effect _lastEffect = NO_EFFECT;
  CRGB _currentColor = CRGB::Red; // 当前效果使用的颜色

  // 效果状态
  uint8_t _rainbowHue = 0;
  uint8_t _chaseOffset = 0;
  uint8_t _wheelPosition = 0;
  uint16_t _spotPosition = 0;
  uint8_t _waterpoolPosition = 0;
  uint8_t _breathBrightness = 1;
  bool _breathIncreasing = true;
  int _scannerPosition = 0;
  bool _scannerForward = true;
  int8_t _waterfallPosition = 0;
  bool _twinkleState = false;

  // 火花效果
  uint8_t _sparkleIndices[5] = {0};
  uint8_t _sparkleCount = 0;

  // 辅助函数
  CRGB applyBrightness(CRGB color, uint8_t brightness) const;
  bool isValidIndex(uint16_t index) const { return index < NUM_LEDS; }

  // 更新当前颜色
  void updateColor(CRGB color) { _currentColor = color; }
};

// 包含模板实现
#include "ledpixel.tpp"
