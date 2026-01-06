#pragma once
#include <Arduino.h>

#define KEY_MAX 8
#define PIANO_KEYCODE_1 0xfefe
#define PIANO_KEYCODE_2 0xfdfd
#define PIANO_KEYCODE_3 0xfbfb
#define PIANO_KEYCODE_4 0xf7f7
#define PIANO_KEYCODE_5 0xefef
#define PIANO_KEYCODE_6 0xdfdf
#define PIANO_KEYCODE_7 0xbfbf
#define PIANO_KEYCODE_8 0x7f7f
#define PIANO_RELEASED 0xffff

typedef struct {
  uint8_t key;
  String keyname;
  uint16_t keycode;
} ST_KEY_MAP;

class TouchPiano {
private:
  uint8_t SCLPin, SDOPin;

public:
  TouchPiano(uint8_t SclPin = A5, uint8_t SdoPin = A4);

  uint16_t GetKeyCode(void);
  String GetKeyName(void);
  uint8_t GetKey(void);
  bool PressedKey(uint8_t key);
};
