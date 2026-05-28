#include "JoystickHandle.h"

JoystickHandle::JoystickHandle() {
  Wire.begin();
  BOARD_ADDR = 0x5a;
}

JoystickHandle::JoystickHandle(uint8_t reg) {
  Wire.begin();
  BOARD_ADDR = reg;
}

boolean JoystickHandle::WireWriteByte(uint8_t val) {
  Wire.beginTransmission(BOARD_ADDR);
  Wire.write(val);
  if (Wire.endTransmission() != 0) {
    return false;
  }
  return true;
}

boolean JoystickHandle::WireWriteDataArray(uint8_t reg, uint8_t *val,
                                           unsigned int len) {
  unsigned int i;
  Wire.beginTransmission(BOARD_ADDR);
  Wire.write(reg);
  for (i = 0; i < len; i++) {
    Wire.write(val[i]);
  }
  if (Wire.endTransmission() != 0) {
    return false;
  }
  return true;
}

int JoystickHandle::WireReadDataArray(uint8_t reg, uint8_t *val,
                                      unsigned int len) {
  unsigned char i = 0;
  /* Indicate which register we want to read from */
  if (!WireWriteByte(reg)) {
    return -1;
  }
  Wire.requestFrom(BOARD_ADDR, len);
  while (Wire.available()) {
    if (i >= len) {
      return -1;
    }
    val[i] = Wire.read();
    i++;
  }
  /* Read block data */
  return i;
}

uint8_t JoystickHandle::ReadByte(uint8_t reg) {
  byte d[1];
  WireReadDataArray(reg, d, 1);
  return d[0];
}

uint8_t JoystickHandle::AnalogRead_X(void) {
  Left_x = ReadByte(JOYSTICK_LEFT_X_REG);
  return Left_x;
}

uint8_t JoystickHandle::AnalogRead_Y(void) {
  Left_y = ReadByte(JOYSTICK_LEFT_Y_REG);
  return Left_y;
}

uint8_t JoystickHandle::Get_Button_Status(uint8_t button) {
  switch (button) {
  case 0:
    lastButtonStatus[0] = ReadByte(BUTTON_A_REG);
    return lastButtonStatus[0];
  case 1:
    lastButtonStatus[1] = ReadByte(BUTTON_B_REG);
    return lastButtonStatus[1];
  case 2:
    lastButtonStatus[2] = ReadByte(BUTTON_C_REG);
    return lastButtonStatus[2];
  case 3:
    lastButtonStatus[3] = ReadByte(BUTTON_D_REG);
    return lastButtonStatus[3];
  case 4:
    lastButtonStatus[4] = ReadByte(BUTTON_OK_REG);
    return lastButtonStatus[4];
  default:
    return 0xff;
  }
}

boolean JoystickHandle::ButtonPressed(uint8_t button) {
  bool last = lastButtonStatus[button] == NONE_PRESS;
  bool current = Get_Button_Status(button) == PRESS_DOWN;
  return last && current;
}

boolean JoystickHandle::ButtonReleased(uint8_t button) {
  return Get_Button_Status(button) == NONE_PRESS;
}

JoystickHandle::~JoystickHandle() {}
