#include <Arduino.h>

#include "matrix7219.h"

Matrix7219::Matrix7219(int clkPin, int dataPin, int csPin, int numDevices)
    : LedControl(dataPin, clkPin, csPin, numDevices) {

  bufferSize = 8 * numDevices;
  textBuffer = new byte[bufferSize];

  // 初始化所有设备
  for (int i = 0; i < numDevices; i++) {
    shutdown(i, false);
    setIntensity(i, 8);
    clearDisplay(i);
  }
}

// 滚动文本缓冲区
void Matrix7219::scrollTextBuffer(byte value) {
  for (int i = 0; i < bufferSize - 1; i++) {
    textBuffer[i] = textBuffer[i + 1];
  }
  textBuffer[bufferSize - 1] = value;
}

// 刷新显示
void Matrix7219::refreshText() {
  int maxDevices = getDeviceCount();
  for (int n = 0; n < maxDevices; n++) {
    for (int col = 0; col < 8; col++) {
      setColumn(n, col, textBuffer[n * 8 + col]);
    }
  }
}

// 查找字符位置
int Matrix7219::indexOfChar(const char *chr, const char *fontMap[],
                            int fontCount) {

  if (fontMap == nullptr || chr == nullptr || fontCount <= 0) {
    return -1;
  }
  for (int i = 0; i < fontCount; i++) {
    if (fontMap[i] != nullptr && strcmp(fontMap[i], chr) == 0) {
      return i;
    }
  }
  return -1;
}

// 显示矩阵数据
void Matrix7219::showMatrix(int addr, const byte (&matrix)[8]) {
  if (addr < 0 || addr >= getDeviceCount())
    return;
  for (int row = 0; row < 8; row++) {
    setRow(addr, row, matrix[row]);
  }
}

// 显示文本
void Matrix7219::showText(const char *text[], int textLength, byte *fonts,
                          char *fontMap[], int fontCount, int fontWidthIndex) {
  // 初始化缓存
  for (int i = 0; i < bufferSize; i++) {
    textBuffer[i] = 0x00;
  }

  // 使用 ASCII 作为 fontMap
  bool useASCIIFont = (fontMap == nullptr);

  int fontLength = fontWidthIndex + 1;

  // 计算文本总宽度
  int textWidth = 0;
  for (int i = 0; i < textLength; i++) {
    const char *chr = text[i];
    if (chr == nullptr)
      continue;

    int n;
    if (useASCIIFont) {
      // 默认字体只支持ASCII字符
      n = (chr[0] >= ' ' && chr[0] <= '~') ? chr[0] - ' ' : 0;
    } else {
      n = indexOfChar(chr, fontMap, fontCount);
    }

    if (n < 0 || n >= fontCount)
      n = 0;

    byte *charData = fonts + (n * fontLength);
    textWidth += charData[fontWidthIndex];
    textWidth += 1; // 字符间距
  }

  // 直接显示（如果文本宽度小于等于屏幕宽度）
  if (textWidth <= bufferSize) {
    int col = 0;

    for (int i = 0; i < textLength; i++) {
      const char *chr = text[i];
      if (chr == nullptr)
        continue;

      int n;
      if (useASCIIFont) {
        n = (chr[0] >= ' ' && chr[0] <= '~') ? chr[0] - ' ' : 0;
      } else {
        n = indexOfChar(chr, fontMap, fontCount);
      }

      if (n < 0 || n >= fontCount)
        n = 0;

      byte *charData = fonts + (n * fontLength);
      int charWidth = charData[fontWidthIndex];

      for (int j = 0; j < charWidth; j++) {
        textBuffer[col++] = charData[j];
      }
      textBuffer[col++] = 0x00; // 字符间距
    }

    refreshText();
    return;
  }

  // 滚动显示
  for (int i = 0; i < textLength; i++) {
    const char *chr = text[i];
    if (chr == nullptr)
      continue;

    int n;
    if (useASCIIFont) {
      n = (chr[0] >= ' ' && chr[0] <= '~') ? chr[0] - ' ' : 0;
    } else {
      n = indexOfChar(chr, fontMap, fontCount);
    }

    if (n < 0 || n >= fontCount)
      n = 0;

    byte *charData = fonts + (n * fontLength);
    int charWidth = charData[fontWidthIndex];

    // 显示字符的每一列
    for (int j = 0; j < charWidth; j++) {
      scrollTextBuffer(charData[j]);
      refreshText();
    }

    // 字符间距
    scrollTextBuffer(0x00);
    refreshText();
  }

  // 清屏滚动
  for (int i = 0; i < bufferSize; i++) {
    scrollTextBuffer(0x00);
    refreshText();
  }
}
