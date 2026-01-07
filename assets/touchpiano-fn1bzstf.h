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
  uint8_t SCLPin_, SDOPin_;
  uint16_t last_keycode_ = PIANO_RELEASED;
  uint16_t GetKeyCode(void);

public:
  TouchPiano(uint8_t SCLPin = A5, uint8_t SDOPin = A4);

  String GetKeyName(void);
  uint8_t GetKey(void);
  bool PressedKey(uint8_t key) { return GetKey() == key; };
};
