#pragma once
#include <Arduino.h>

// 生成随机颜色
template <uint8_t DATA_PIN, uint16_t NUM_LEDS>
CRGB LedPixel<DATA_PIN, NUM_LEDS>::randomColor() {
  return CHSV(random8(), 255, 255); // 随机色相，饱和度和亮度最大
}

// 生成指定最小亮度的随机颜色
template <uint8_t DATA_PIN, uint16_t NUM_LEDS>
CRGB LedPixel<DATA_PIN, NUM_LEDS>::randomColor(uint8_t minBrightness) {
  uint8_t hue = random8();
  uint8_t brightness = random8(minBrightness, 255);
  return CHSV(hue, 255, brightness);
}

// 构造函数
template <uint8_t DATA_PIN, uint16_t NUM_LEDS>
LedPixel<DATA_PIN, NUM_LEDS>::LedPixel() {
  // 初始化亮度数组为最大值
  for (uint16_t i = 0; i < NUM_LEDS; i++) {
    _brightnessLevels[i] = 10;
  }
}

// 初始化函数
template <uint8_t DATA_PIN, uint16_t NUM_LEDS>
void LedPixel<DATA_PIN, NUM_LEDS>::begin() {
  FastLED.addLeds<WS2812B, DATA_PIN, GRB>(_leds, NUM_LEDS);
  FastLED.setBrightness(_globalBrightness);
  clear();
}

// 应用亮度
template <uint8_t DATA_PIN, uint16_t NUM_LEDS>
CRGB LedPixel<DATA_PIN, NUM_LEDS>::applyBrightness(CRGB color,
                                                   uint8_t brightness) const {
  if (brightness == 0)
    return CRGB::Black;
  if (brightness == 10)
    return color;

  // 1-10映射到25-255
  uint8_t scale = map(constrain(brightness, 1, 10), 1, 10, 25, 255);
  return color.nscale8(scale);
}

// 清空所有LED
template <uint8_t DATA_PIN, uint16_t NUM_LEDS>
void LedPixel<DATA_PIN, NUM_LEDS>::clear() {
  fill_solid(_leds, NUM_LEDS, CRGB::Black);
  for (uint16_t i = 0; i < NUM_LEDS; i++) {
    _brightnessLevels[i] = 0;
  }
  FastLED.show();
}

// 设置全局亮度
template <uint8_t DATA_PIN, uint16_t NUM_LEDS>
void LedPixel<DATA_PIN, NUM_LEDS>::setBrightness(uint8_t brightness) {
  _globalBrightness = brightness;
  FastLED.setBrightness(_globalBrightness);
}

// 填充颜色
template <uint8_t DATA_PIN, uint16_t NUM_LEDS>
void LedPixel<DATA_PIN, NUM_LEDS>::fill(CRGB color) {
  for (uint16_t i = 0; i < NUM_LEDS; i++) {
    _brightnessLevels[i] = 10;
    _leds[i] = applyBrightness(color, 10);
  }
  FastLED.show();
}

// 设置单个LED
template <uint8_t DATA_PIN, uint16_t NUM_LEDS>
void LedPixel<DATA_PIN, NUM_LEDS>::setPixel(uint16_t index, uint8_t brightness,
                                            CRGB color) {
  if (isValidIndex(index)) {
    _brightnessLevels[index] = brightness;
    _leds[index] = applyBrightness(color, brightness);
  }
}

// 获取LED颜色
template <uint8_t DATA_PIN, uint16_t NUM_LEDS>
CRGB LedPixel<DATA_PIN, NUM_LEDS>::getPixelColor(uint16_t index) const {
  return isValidIndex(index) ? _leds[index] : CRGB::Black;
}

// 彩虹效果 - 使用标准fill_rainbow
template <uint8_t DATA_PIN, uint16_t NUM_LEDS>
void LedPixel<DATA_PIN, NUM_LEDS>::rainbow(uint8_t hue) {
  fill_rainbow(_leds, NUM_LEDS, hue);
  FastLED.show();
}

// 彩虹滚动效果 - 使用fill_rainbow_circular实现环形彩虹
template <uint8_t DATA_PIN, uint16_t NUM_LEDS>
void LedPixel<DATA_PIN, NUM_LEDS>::rainbowCycle(uint8_t hueOffset) {
  _lastEffect = RAINBOW_CYCLE;
  _rainbowHue += 256 / NUM_LEDS;

  fill_rainbow_circular(_leds, NUM_LEDS, _rainbowHue + hueOffset);
  FastLED.show();
}

// 追逐效果
template <uint8_t DATA_PIN, uint16_t NUM_LEDS>
void LedPixel<DATA_PIN, NUM_LEDS>::chase(CRGB color, uint8_t spacing) {
  _lastEffect = CHASE;
  updateColor(color);

  fill_solid(_leds, NUM_LEDS, CRGB::Black);
  for (uint8_t i = _chaseOffset; i < NUM_LEDS; i += spacing) {
    setPixel(i, 10, color);
  }

  _chaseOffset = (_chaseOffset + 1) % spacing;
  FastLED.show();
}

// 闪烁效果
template <uint8_t DATA_PIN, uint16_t NUM_LEDS>
void LedPixel<DATA_PIN, NUM_LEDS>::twinkle(CRGB color) {
  _lastEffect = TWINKLE;
  updateColor(color);

  if (_twinkleState) {
    fill(color);
  } else {
    clear();
  }

  _twinkleState = !_twinkleState;
}

// 火花效果
template <uint8_t DATA_PIN, uint16_t NUM_LEDS>
void LedPixel<DATA_PIN, NUM_LEDS>::sparkle(CRGB color, uint8_t sparkleCount) {
  _lastEffect = SPARKLE;
  updateColor(color);

  // 渐弱效果
  fadeToBlackBy(_leds, NUM_LEDS, 255);

  // 生成新火花
  if (_sparkleCount == 0) {
    _sparkleCount = min(sparkleCount, (uint8_t)5);
    for (uint8_t i = 0; i < _sparkleCount; i++) {
      _sparkleIndices[i] = random16(NUM_LEDS);
    }
  }

  // 设置火花（使用随机亮度）
  for (uint8_t i = 0; i < _sparkleCount; i++) {
    setPixel(_sparkleIndices[i], random(5, 11), color);
  }

  FastLED.show();
  _sparkleCount = 0;
}

// 呼吸效果
template <uint8_t DATA_PIN, uint16_t NUM_LEDS>
void LedPixel<DATA_PIN, NUM_LEDS>::breathing(CRGB color) {
  _lastEffect = BREATHING;
  updateColor(color);

  // 更新呼吸亮度
  _breathBrightness += _breathIncreasing ? 1 : -1;

  if (_breathBrightness >= 10)
    _breathIncreasing = false;
  if (_breathBrightness <= 1)
    _breathIncreasing = true;

  // 应用亮度
  for (uint16_t i = 0; i < NUM_LEDS; i++) {
    setPixel(i, _breathBrightness, color);
  }
  FastLED.show();
}

// 扫描效果
template <uint8_t DATA_PIN, uint16_t NUM_LEDS>
void LedPixel<DATA_PIN, NUM_LEDS>::scanner(CRGB color) {
  _lastEffect = SCANNER;
  updateColor(color);

  // 渐弱
  for (uint16_t i = 0; i < NUM_LEDS; i++) {
    if (_brightnessLevels[i] >= 2) {
      setPixel(i, _brightnessLevels[i] - 2, color);
    } else {
      setPixel(i, 0, color);
    }
  }

  // 新扫描点
  if (_scannerPosition >= 0 && _scannerPosition <= NUM_LEDS - 1) {
    setPixel(_scannerPosition, 10, color);
  }

  // 更新位置
  if (_scannerForward) {
    _scannerPosition++;

    if (_scannerPosition > NUM_LEDS + 5) {
      _scannerForward = false;
      _scannerPosition = NUM_LEDS - 1;
    }
  } else {
    _scannerPosition--;

    if (_scannerPosition < -6) {
      _scannerForward = true;
      _scannerPosition = 0;
    }
  }

  FastLED.show();
}

// 瀑布效果
template <uint8_t DATA_PIN, uint16_t NUM_LEDS>
void LedPixel<DATA_PIN, NUM_LEDS>::waterfall(CRGB color) {
  _lastEffect = SCANNER;
  updateColor(color);

  // 渐弱
  for (uint16_t i = 0; i < NUM_LEDS; i++) {
    if (_brightnessLevels[i] >= 2) {
      setPixel(i, _brightnessLevels[i] - 2, color);
    } else {
      setPixel(i, 0, color);
    }
  }

  // 新扫描点
  if (_waterfallPosition >= 0 && _waterfallPosition <= NUM_LEDS - 1) {
    setPixel(_waterfallPosition, 10, color);
  }

  // 更新位置
  _waterfallPosition += 1;

  if (_waterfallPosition >= NUM_LEDS + 5)
    _waterfallPosition = 0;

  FastLED.show();
}

// 旋涡效果
template <uint8_t DATA_PIN, uint16_t NUM_LEDS>
void LedPixel<DATA_PIN, NUM_LEDS>::whirlpool(CRGB color) {
  _lastEffect = WHIRLPOOL;
  updateColor(color);

  // 渐弱
  for (uint16_t i = 0; i < NUM_LEDS; i++) {
    if (_brightnessLevels[i] >= 2) {
      setPixel(i, _brightnessLevels[i] - 2, color);
    } else {
      setPixel(i, 0, color);
    }
  }

  // 新扫描点
  if (_waterpoolPosition >= 0 && _waterpoolPosition <= NUM_LEDS - 1) {
    setPixel(_waterpoolPosition, 10, color);
  }

  // 更新位置
  _waterpoolPosition += 1;

  if (_waterpoolPosition >= NUM_LEDS)
    _waterpoolPosition = 0;

  FastLED.show();
}

// 光点移动
template <uint8_t DATA_PIN, uint16_t NUM_LEDS>
void LedPixel<DATA_PIN, NUM_LEDS>::lightSpot(CRGB color) {
  _lastEffect = LIGHT_SPOT;
  updateColor(color);

  clear();
  setPixel(_spotPosition, 10, color);

  _spotPosition = (_spotPosition + 1) % NUM_LEDS;
  FastLED.show();
}

// 光轮效果
template <uint8_t DATA_PIN, uint16_t NUM_LEDS>
void LedPixel<DATA_PIN, NUM_LEDS>::lightWheel(CRGB color) {
  _lastEffect = LIGHT_WHEEL;
  updateColor(color);

  fill(color);
  setPixel(_wheelPosition, 0, CRGB::Black);

  _wheelPosition = (_wheelPosition + 1) % NUM_LEDS;
  FastLED.show();
}
