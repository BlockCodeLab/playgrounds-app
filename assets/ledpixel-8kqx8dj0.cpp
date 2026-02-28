#include "ledpixel.h"

//==============================================================================
// 构造函数 & 析构函数
//==============================================================================
LedPixel::LedPixel(uint8_t port, uint8_t led_num) {
  pinMask = digitalPinToBitMask(port);
  ws2812_port = portOutputRegister(digitalPinToPort(port));
  pinMode(port, OUTPUT);
  brightness = 256;
  pixels = NULL;
  orig_pixels = NULL;
  led_brightness = NULL;
  pixels_bak = NULL;
  count_led = 0;
  setNumber(led_num);

  // 初始化效果状态
  _lastEffect = EFFECT_NONE;
  _chaseOffset = 0;
  _twinkleState = false;
  _sparkleCount = 0;
  for (uint8_t i = 0; i < 5; i++)
    _sparkleIndices[i] = 0;
  _breathBrightness = 5;
  _breathIncreasing = true;
  _scannerPosition = 0;
  _scannerForward = true;
  _waterfallPosition = 0;
  _waterpoolPosition = 0;
  _spotPosition = 0;
  _wheelPosition = 0;
  _rainbowHue = 0;
}

LedPixel::~LedPixel(void) {
  if (pixels)
    free(pixels);
  if (orig_pixels)
    free(orig_pixels);
  if (led_brightness)
    free(led_brightness);
  if (pixels_bak)
    free(pixels_bak);
  pixels = orig_pixels = led_brightness = pixels_bak = NULL;
}

//==============================================================================
// 引脚重置
//==============================================================================
void LedPixel::setpin(uint8_t port) {
  pinMask = digitalPinToBitMask(port);
  ws2812_port = portOutputRegister(digitalPinToPort(port));
  pinMode(port, OUTPUT);
}

//==============================================================================
// LED数量管理（动态内存分配）
//==============================================================================
void LedPixel::setNumber(uint8_t num_leds) {
  // 释放原有内存
  if (pixels)
    free(pixels);
  if (orig_pixels)
    free(orig_pixels);
  if (led_brightness)
    free(led_brightness);
  if (pixels_bak)
    free(pixels_bak);
  pixels = orig_pixels = led_brightness = pixels_bak = NULL;

  count_led = num_leds;
  if (count_led == 0)
    return;

  // 分配新内存
  pixels = (uint8_t *)malloc(count_led * 3);
  orig_pixels = (uint8_t *)malloc(count_led * 3);
  led_brightness = (uint8_t *)malloc(count_led);
  pixels_bak = (uint8_t *)malloc(count_led * 3);

  // 检查分配是否成功
  if (!pixels || !orig_pixels || !led_brightness || !pixels_bak) {
    if (pixels)
      free(pixels);
    if (orig_pixels)
      free(orig_pixels);
    if (led_brightness)
      free(led_brightness);
    if (pixels_bak)
      free(pixels_bak);
    pixels = orig_pixels = led_brightness = pixels_bak = NULL;
    count_led = 0;
    return;
  }

  // 全部初始化为0
  memset(pixels, 0, count_led * 3);
  memset(orig_pixels, 0, count_led * 3);
  memset(pixels_bak, 0, count_led * 3);
  // 每个LED的亮度默认设为最大值255
  for (uint8_t i = 0; i < count_led; i++) {
    led_brightness[i] = 255;
  }
}

uint8_t LedPixel::getNumber(void) { return count_led; }

//==============================================================================
// 颜色读取
//==============================================================================
cRGB LedPixel::getColorAt(uint8_t index) {
  if (index == 0 || index > count_led)
    return 0;
  uint8_t i = index - 1;
  uint8_t tmp = i * 3;
  // orig_pixels 存储 GRB
  return ((uint32_t)orig_pixels[tmp + 1] << 16) |
         ((uint32_t)orig_pixels[tmp] << 8) | orig_pixels[tmp + 2];
}

//==============================================================================
// 备份缓冲区填充（内部使用）
//==============================================================================
void LedPixel::fillPixelsBak(uint8_t red, uint8_t green, uint8_t blue) {
  for (uint16_t i = 0; i < count_led; i++) {
    uint8_t tmp = i * 3;
    pixels_bak[tmp] = green;
    pixels_bak[tmp + 1] = red;
    pixels_bak[tmp + 2] = blue;
  }
}

//==============================================================================
// 内部函数：重新计算某个LED的显示像素（基于orig_pixels和当前亮度）
//==============================================================================
void LedPixel::updatePixel(uint8_t led_index) {
  if (led_index >= count_led)
    return;
  uint8_t tmp = led_index * 3;
  uint8_t g = orig_pixels[tmp];
  uint8_t r = orig_pixels[tmp + 1];
  uint8_t b = orig_pixels[tmp + 2];
  uint8_t local = led_brightness[led_index]; // 0~255
  // 最终像素值 = 原始颜色 * 全局亮度 * 局部亮度 >> 16
  // 全局亮度 brightness 范围 1~256，局部亮度 local 范围 0~255
  uint32_t temp;
  temp = (uint32_t)g * brightness * local;
  pixels[tmp] = temp >> 16;
  temp = (uint32_t)r * brightness * local;
  pixels[tmp + 1] = temp >> 16;
  temp = (uint32_t)b * brightness * local;
  pixels[tmp + 2] = temp >> 16;
}

//==============================================================================
// 核心颜色设置（0-based索引，同时更新原始和当前缓冲区）
//==============================================================================
bool LedPixel::setColorAt(uint8_t index, uint8_t red, uint8_t green,
                          uint8_t blue) {
  if (index >= count_led)
    return false;
  uint8_t tmp = index * 3;

  // 保存原始颜色（GRB顺序）
  orig_pixels[tmp] = green;
  orig_pixels[tmp + 1] = red;
  orig_pixels[tmp + 2] = blue;

  // 根据当前亮度重新计算显示像素
  updatePixel(index);

  return true;
}

//==============================================================================
// 公共颜色设置（1-based索引，0表示全部）
//==============================================================================
bool LedPixel::setColor(uint8_t index, uint8_t red, uint8_t green,
                        uint8_t blue) {
  if (count_led == 0)
    return false;
  if (index == 0) {
    for (uint8_t i = 0; i < count_led; i++) {
      setColorAt(i, red, green, blue);
    }
    return true;
  } else if (index <= count_led) {
    return setColorAt(index - 1, red, green, blue);
  }
  return false;
}

bool LedPixel::setColor(uint8_t red, uint8_t green, uint8_t blue) {
  return setColor(0, red, green, blue);
}

bool LedPixel::setColor(uint8_t index, long value) {
  uint8_t red = (value >> 16) & 0xFF;
  uint8_t green = (value >> 8) & 0xFF;
  uint8_t blue = value & 0xFF;
  return setColor(index, red, green, blue);
}

//==============================================================================
// 全局亮度设置
//==============================================================================
void LedPixel::setBrightness(uint8_t b) {
  uint16_t new_brightness = b + 1; // 将用户 0~255 映射到内部 1~256
  if (new_brightness == brightness)
    return;
  brightness = new_brightness;

  // 根据原始颜色和每个LED的独立亮度重新计算所有显示像素
  if (count_led == 0)
    return;
  for (uint8_t i = 0; i < count_led; i++) {
    updatePixel(i);
  }
}

//==============================================================================
// 单个LED亮度设置
//==============================================================================
void LedPixel::setBrightnessAt(uint8_t index, uint8_t b) {
  if (count_led == 0)
    return;
  if (index == 0) {
    // 设置所有LED的亮度
    for (uint8_t i = 0; i < count_led; i++) {
      led_brightness[i] = b;
      updatePixel(i);
    }
  } else if (index <= count_led) {
    uint8_t i = index - 1;
    led_brightness[i] = b;
    updatePixel(i);
  }
}

uint8_t LedPixel::getBrightnessAt(uint8_t index) {
  if (index == 0 || index > count_led)
    return 0;
  return led_brightness[index - 1];
}

//==============================================================================
// 数据发送（AVR汇编实现，时序精确）
//==============================================================================
// 时序宏定义（基于 F_CPU）
#define w_zeropulse (350)
#define w_onepulse (900)
#define w_totalperiod (1250)

#define w_fixedlow (3)
#define w_fixedhigh (6)
#define w_fixedtotal (10)

#define w_zerocycles (((F_CPU / 1000) * w_zeropulse) / 1000000)
#define w_onecycles (((F_CPU / 1000) * w_onepulse + 500000) / 1000000)
#define w_totalcycles (((F_CPU / 1000) * w_totalperiod + 500000) / 1000000)

#define w1 (w_zerocycles - w_fixedlow)
#define w2 (w_onecycles - w_fixedhigh - w1)
#define w3 (w_totalcycles - w_fixedtotal - w1 - w2)

#if w1 > 0
#define w1_nops w1
#else
#define w1_nops 0
#endif

#if w2 > 0
#define w2_nops w2
#else
#define w2_nops 0
#endif

#if w3 > 0
#define w3_nops w3
#else
#define w3_nops 0
#endif

#define w_nop1 "nop      \n\t"
#define w_nop2 "rjmp .+0 \n\t"
#define w_nop4 w_nop2 w_nop2
#define w_nop8 w_nop4 w_nop4
#define w_nop16 w_nop8 w_nop8

// 时序检查（编译时）
#define w_lowtime ((w1_nops + w_fixedlow) * 1000000) / (F_CPU / 1000)
#if w_lowtime > 550
#error "Light_ws2812: 时钟频率过低，无法满足时序要求。请检查 F_CPU 设置。"
#elif w_lowtime > 450
#warning                                                                       \
    "Light_ws2812: 时序临界，可能仅适用于 WS2812B，不适用于 WS2812(S)。如可能请提高时钟频率。"
#endif

void LedPixel::rgbled_sendarray_mask(uint8_t *data, uint16_t datlen,
                                     uint8_t maskhi, uint8_t *port) {
  uint8_t curbyte, ctr, masklo;
  uint8_t oldSREG = SREG;
  cli(); // 关闭中断，保证时序精确

  masklo = *port & ~maskhi; // 引脚低电平时的端口值
  maskhi = *port | maskhi;  // 引脚高电平时的端口值

  while (datlen--) {
    curbyte = *data++;

    asm volatile(
        "       ldi   %0,8  \n\t" // 循环计数器 = 8
        "loop%=:            \n\t"
        "       st    X,%3 \n\t" // 置高电平 (maskhi)
#if (w1_nops & 1)
        w_nop1
#endif
#if (w1_nops & 2)
            w_nop2
#endif
#if (w1_nops & 4)
                w_nop4
#endif
#if (w1_nops & 8)
                    w_nop8
#endif
#if (w1_nops & 16)
        w_nop16
#endif
        "       sbrs  %1,7  \n\t" // 如果当前位为1，跳过清零
        "       st    X,%4 \n\t"  // 位为0，拉低电平
        "       lsl   %1    \n\t" // 左移，准备下一位
#if (w2_nops & 1)
        w_nop1
#endif
#if (w2_nops & 2)
            w_nop2
#endif
#if (w2_nops & 4)
                w_nop4
#endif
#if (w2_nops & 8)
                    w_nop8
#endif
#if (w2_nops & 16)
        w_nop16
#endif
        "       brcc skipone%= \n\t" // 如果进位为0（即刚才的位为0），跳过置高
        "       st   X,%4      \n\t" // 位为1，拉低电平（完成完整脉冲）
        "skipone%=:               "
#if (w3_nops & 1)
        w_nop1
#endif
#if (w3_nops & 2)
            w_nop2
#endif
#if (w3_nops & 4)
                w_nop4
#endif
#if (w3_nops & 8)
                    w_nop8
#endif
#if (w3_nops & 16)
        w_nop16
#endif
        "       dec   %0    \n\t"
        "       brne  loop%=\n\t" // 循环8次
        : "=&d"(ctr)
        : "r"(curbyte), "x"(port), "r"(maskhi), "r"(masklo));
  }

  SREG = oldSREG; // 恢复中断状态
}

//==============================================================================
// 显示（发送数据，避免重复发送相同内容）
//==============================================================================
void LedPixel::show(void) {
  if (count_led == 0)
    return;
  if (memcmp(pixels_bak, pixels, count_led * 3) != 0) {
    rgbled_sendarray_mask(pixels, count_led * 3, pinMask,
                          (uint8_t *)ws2812_port);
    memcpy(pixels_bak, pixels, count_led * 3);
    delayMicroseconds(500); // 复位延时
  }
}

//==============================================================================
// 便捷函数：设置并立即显示
//==============================================================================
void LedPixel::SetRgbColor(uint8_t index, long Color) {
  setColor(index, Color);
  show();
}

//==============================================================================
// HSV 转换与设置（返回long颜色值）
//==============================================================================
cRGB LedPixel::hsvToRgb(uint16_t hue, uint8_t sat, uint8_t val) {
  uint8_t r, g, b;
  uint8_t region, remainder, p, q, t;

  if (sat == 0) {
    r = g = b = val;
  } else {
    region = hue / 60;
    remainder = (hue % 60) * 255 / 60;

    p = (val * (255 - sat)) >> 8;
    q = (val * (255 - ((sat * remainder) >> 8))) >> 8;
    t = (val * (255 - ((sat * (255 - remainder)) >> 8))) >> 8;

    switch (region) {
    case 0:
      r = val;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = val;
      b = p;
      break;
    case 2:
      r = p;
      g = val;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = val;
      break;
    case 4:
      r = t;
      g = p;
      b = val;
      break;
    default:
      r = val;
      g = p;
      b = q;
      break;
    }
  }
  return ((uint32_t)r << 16) | ((uint32_t)g << 8) | b;
}

void LedPixel::setHSV(uint8_t index, uint16_t hue, uint8_t sat, uint8_t val) {
  setColor(index, hsvToRgb(hue, sat, val));
}

void LedPixel::setHSV(uint16_t hue, uint8_t sat, uint8_t val) {
  setHSV(0, hue, sat, val);
}

// 亮度等级（1~10）映射到实际亮度（0~255）
uint8_t LedPixel::levelToActual(uint8_t level) const {
  if (level == 0)
    return 0;
  // 原LedPixel中映射：1->25, 2->51, 3->76, 4->102, 5->127, 6->153, 7->178,
  // 8->204, 9->229, 10->255 使用线性映射公式：map(level, 1, 10, 25, 255)
  return (uint16_t(level - 1) * (255 - 25) / (10 - 1) + 25);
}

// 将所有LED的亮度衰减指定量（实际亮度值减少amount，不低于0）
void LedPixel::fadeAll(uint8_t amount) {
  if (count_led == 0)
    return;
  for (uint8_t i = 0; i < count_led; i++) {
    if (led_brightness[i] >= amount) {
      led_brightness[i] -= amount;
    } else {
      led_brightness[i] = 0;
    }
    updatePixel(i);
  }
}

// 随机颜色生成
cRGB LedPixel::randomColor() {
  uint16_t hue = random(360);
  return hsvToRgb(hue, 255, 255);
}

cRGB LedPixel::randomColor(uint8_t minBrightness) {
  uint16_t hue = random(360);
  uint8_t brightness = random(minBrightness, 256);
  return hsvToRgb(hue, 255, brightness);
}

// 初始化
void LedPixel::begin() {
  // 已在构造函数中完成，无需额外操作
  clear();
}

// 清空所有LED
void LedPixel::clear() { fill(0x000000); }

// 填充所有LED为指定颜色，亮度等级设为10
void LedPixel::fill(cRGB color) {
  uint8_t actual = levelToActual(10);
  uint8_t r = (color >> 16) & 0xFF;
  uint8_t g = (color >> 8) & 0xFF;
  uint8_t b = color & 0xFF;
  for (uint8_t i = 0; i < count_led; i++) {
    setColorAt(i, r, g, b);
    led_brightness[i] = actual;
    updatePixel(i);
  }
  show();
}

// 设置单个LED（brightness为1~10等级）
void LedPixel::setPixel(uint16_t index, uint8_t brightness, cRGB color) {
  if (index >= count_led)
    return;
  uint8_t actual = levelToActual(brightness);
  setBrightnessAt(index + 1, actual); // setBrightnessAt使用1-based索引
  uint8_t r = (color >> 16) & 0xFF;
  uint8_t g = (color >> 8) & 0xFF;
  uint8_t b = color & 0xFF;
  setColorAt(index, r, g, b); // setColorAt自动调用updatePixel
}

// 获取LED的当前颜色（原始颜色，未应用亮度）
cRGB LedPixel::getPixelColor(uint16_t index) const {
  if (index >= count_led)
    return 0;
  uint8_t tmp = index * 3;
  return ((uint32_t)orig_pixels[tmp + 1] << 16) |
         ((uint32_t)orig_pixels[tmp] << 8) | orig_pixels[tmp + 2];
}

// 彩虹效果（每个LED色相递增）
void LedPixel::rainbow(uint8_t hue) {
  if (count_led == 0)
    return;
  uint16_t step = 256 / count_led; // 8位色相，每步增量
  for (uint8_t i = 0; i < count_led; i++) {
    uint8_t h = hue + i * step;
    cRGB color = hsvToRgb(h, 255, 255);
    setColorAt(i, (color >> 16) & 0xFF, (color >> 8) & 0xFF, color & 0xFF);
  }
  show();
}

// 环形彩虹效果（色相环绕）
void LedPixel::rainbowCycle(uint8_t hueOffset) {
  _lastEffect = RAINBOW_CYCLE;
  _rainbowHue += 256 / count_led;
  if (count_led == 0)
    return;
  uint16_t step = 256 / count_led;
  for (uint8_t i = 0; i < count_led; i++) {
    uint8_t h = _rainbowHue + i * step + hueOffset;
    cRGB color = hsvToRgb(h, 255, 255);
    setColorAt(i, (color >> 16) & 0xFF, (color >> 8) & 0xFF, color & 0xFF);
  }
  show();
}

// 追逐效果
void LedPixel::chase(cRGB color, uint8_t spacing) {
  _lastEffect = CHASE;
  if (count_led == 0)
    return;
  // 先全部清除
  for (uint8_t i = 0; i < count_led; i++) {
    setColorAt(i, 0, 0, 0);
    led_brightness[i] = 0;
    updatePixel(i);
  }
  // 设置追逐点
  for (uint8_t i = _chaseOffset; i < count_led; i += spacing) {
    setPixel(i, 10, color);
  }
  _chaseOffset = (_chaseOffset + 1) % spacing;
  show();
}

// 闪烁效果
void LedPixel::twinkle(cRGB color) {
  _lastEffect = TWINKLE;
  if (_twinkleState) {
    fill(color);
  } else {
    clear();
  }
  _twinkleState = !_twinkleState;
}

// 火花效果
void LedPixel::sparkle(cRGB color, uint8_t sparkleCount) {
  _lastEffect = SPARKLE;
  if (count_led == 0)
    return;

  // 渐弱（所有LED亮度减半或减固定值，这里使用减半模拟fadeToBlackBy
  // 255？原代码fadeToBlackBy(_leds, NUM_LEDS, 255)相当于全黑
  // 为了模拟，我们直接清除所有LED，然后生成新火花
  for (uint8_t i = 0; i < count_led; i++) {
    setColorAt(i, 0, 0, 0);
    led_brightness[i] = 0;
    updatePixel(i);
  }

  // 生成新火花
  _sparkleCount = min(sparkleCount, (uint8_t)5);
  for (uint8_t i = 0; i < _sparkleCount; i++) {
    _sparkleIndices[i] = random(count_led);
  }

  // 设置火花（随机亮度5~10）
  for (uint8_t i = 0; i < _sparkleCount; i++) {
    uint8_t level = random(5, 11); // 5~10
    setPixel(_sparkleIndices[i], level, color);
  }
  show();
}

// 呼吸效果
void LedPixel::breathing(cRGB color) {
  _lastEffect = BREATHING;
  if (count_led == 0)
    return;

  // 更新呼吸亮度等级（1~10）
  _breathBrightness += _breathIncreasing ? 1 : -1;
  if (_breathBrightness >= 10) {
    _breathBrightness = 10;
    _breathIncreasing = false;
  }
  if (_breathBrightness <= 0) {
    _breathBrightness = 0;
    _breathIncreasing = true;
  }

  // 应用亮度到所有LED
  uint8_t actual = levelToActual(_breathBrightness);
  uint8_t r = (color >> 16) & 0xFF;
  uint8_t g = (color >> 8) & 0xFF;
  uint8_t b = color & 0xFF;
  for (uint8_t i = 0; i < count_led; i++) {
    setColorAt(i, r, g, b);
    led_brightness[i] = actual;
    updatePixel(i);
  }
  show();
}

// 扫描效果（来回移动）
void LedPixel::scanner(cRGB color) {
  _lastEffect = SCANNER;
  if (count_led == 0)
    return;

  // 渐弱（所有LED亮度减2等级？原代码中_brightnessLevels减2，我们映射：实际亮度减对应值
  // 为了简化，我们每次将每个LED的实际亮度减少50（约0.2倍），并限制最小值
  fadeAll(50); // 减少实际亮度50

  // 设置新扫描点
  if (_scannerPosition >= 0 && _scannerPosition < count_led) {
    setPixel(_scannerPosition, 10, color);
  }

  // 更新扫描位置
  if (_scannerForward) {
    _scannerPosition++;
    if (_scannerPosition > (int16_t)count_led + 5) {
      _scannerForward = false;
      _scannerPosition = count_led - 1;
    }
  } else {
    _scannerPosition--;
    if (_scannerPosition < -6) {
      _scannerForward = true;
      _scannerPosition = 0;
    }
  }
  show();
}

// 瀑布效果（单向移动）
void LedPixel::waterfall(cRGB color) {
  _lastEffect = WATERFALL;
  if (count_led == 0)
    return;

  // 渐弱
  fadeAll(50);

  // 设置新点
  if (_waterfallPosition < count_led) {
    setPixel(_waterfallPosition, 10, color);
  }

  // 更新位置
  _waterfallPosition++;
  if (_waterfallPosition >= count_led + 5) {
    _waterfallPosition = 0;
  }
  show();
}

// 旋涡效果（环形单向移动）
void LedPixel::whirlpool(cRGB color) {
  _lastEffect = WHIRLPOOL;
  if (count_led == 0)
    return;

  // 渐弱
  fadeAll(50);

  // 设置新点
  if (_waterpoolPosition < count_led) {
    setPixel(_waterpoolPosition, 10, color);
  }

  // 更新位置
  _waterpoolPosition++;
  if (_waterpoolPosition >= count_led) {
    _waterpoolPosition = 0;
  }
  show();
}

// 光点移动（单个亮点）
void LedPixel::lightSpot(cRGB color) {
  _lastEffect = LIGHT_SPOT;
  if (count_led == 0)
    return;

  clear();
  setPixel(_spotPosition, 10, color);

  _spotPosition = (_spotPosition + 1) % count_led;
  show();
}

// 光轮效果（全亮，一个暗点移动）
void LedPixel::lightWheel(cRGB color) {
  _lastEffect = LIGHT_WHEEL;
  if (count_led == 0)
    return;

  fill(color);
  setPixel(_wheelPosition, 0, 0); // 亮度0，黑色

  _wheelPosition = (_wheelPosition + 1) % count_led;
  show();
}
