#pragma once
#include <Arduino.h>
#include <LedControl.h>

#define SHOW_TEXT(matrix, ...)                                                 \
  {                                                                            \
    const char *_chars[] = {__VA_ARGS__};                                      \
    matrix.showText(_chars, sizeof(_chars) / sizeof(_chars[0]), (byte *)FONTS, \
                    FONT_MAP, FONT_COUNT, FONT_WIDTH_INDEX);                   \
  }

class Matrix7219 : public LedControl {
private:
  byte *textBuffer;
  int bufferSize;

  int indexOfChar(const char *chr, const char *fontMap[], int fontCount);
  void scrollTextBuffer(byte value = 0x00);
  void refreshText();

public:
  Matrix7219(int clkPin, int dataPin, int csPin, int numDevices = 1);
  ~Matrix7219() { delete[] textBuffer; };

  void showMatrix(int addr, const byte (&matrix)[8]);
  void showText(const char *text[], int textLength, byte *fonts,
                char *fontMap[], int fontCount, int fontWidthIndex);
};
