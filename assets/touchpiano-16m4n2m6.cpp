#include "touchpiano.h"

ST_KEY_MAP piano_keymap[16] = {
    {1, "c", PIANO_KEYCODE_1}, {2, "d", PIANO_KEYCODE_2},
    {3, "e", PIANO_KEYCODE_3}, {4, "f", PIANO_KEYCODE_4},
    {5, "g", PIANO_KEYCODE_5}, {6, "a", PIANO_KEYCODE_6},
    {7, "b", PIANO_KEYCODE_7}, {8, "c5", PIANO_KEYCODE_8},
};

TouchPiano::TouchPiano(uint8_t SCLPin, uint8_t SDOPin)
    : SCLPin_(SCLPin), SDOPin_(SDOPin) {
  pinMode(SCLPin_, OUTPUT);
  pinMode(SDOPin_, INPUT);
}

uint16_t TouchPiano::GetKeyCode(void) {
  unsigned int DATA = 0;
  pinMode(SDOPin_, OUTPUT);
  digitalWrite(SDOPin_, HIGH);
  delayMicroseconds(93);
  digitalWrite(SDOPin_, LOW);
  delayMicroseconds(10);
  pinMode(SDOPin_, INPUT);
  for (int i = 0; i < 16; i++) {
    digitalWrite(SCLPin_, HIGH);
    digitalWrite(SCLPin_, LOW);
    DATA |= digitalRead(SDOPin_) << i;
  }
  delay(4);
  return DATA & PIANO_RELEASED;
}

String TouchPiano::GetKeyName(void) {
  byte i;
  uint16_t keycode = GetKeyCode();
  ST_KEY_MAP *keymap = piano_keymap;
  for (i = 0; i < KEY_MAX; i++) {
    if (keymap[i].keycode == keycode)
      return keymap[i].keyname;
  }
  return "r"; // rest
}

uint8_t TouchPiano::GetKey(void) {
  byte i;
  uint16_t keycode = GetKeyCode();
  ST_KEY_MAP *keymap = piano_keymap;
  for (i = 0; i < KEY_MAX; i++) {
    if (keymap[i].keycode == keycode)
      return i + 1;
  }
  return 0;
}
