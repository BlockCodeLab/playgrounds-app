#include "I2cDevice.h"

#include <Arduino.h>
#include <Wire.h>

I2cDevice::I2cDevice(const uint8_t device_i2c_address) : device_i2c_address_(device_i2c_address) {
}

bool I2cDevice::Setup() {
  Wire.begin();
  Wire.setClock(400000);
  return true;
}

bool I2cDevice::Write(const uint8_t register_address, const uint8_t* data, const uint8_t length) {
  uint8_t written_length = 0;
  while (written_length < length) {
    uint8_t segment_length = min(length - written_length, BUFFER_LENGTH - 1);
    Wire.beginTransmission(device_i2c_address_);
    Wire.write(register_address + written_length);
    Wire.write(data + written_length, segment_length);
    auto transmission_result = Wire.endTransmission();
    if (transmission_result != 0) {
      return false;
    }
    written_length += segment_length;
  }

  return true;
}

bool I2cDevice::Write(const uint8_t register_address, const uint8_t data) {
  return Write(register_address, &data, 1);
}

bool I2cDevice::WriteBit(const uint8_t register_address, const uint8_t bit_number, const uint8_t data) {
  uint8_t value = 0;
  if (!Read(register_address, &value)) {
    return false;
  }

  if (data == 0) {
    return Write(register_address, value & ~(static_cast<uint8_t>(1) << bit_number));
  } else {
    return Write(register_address, value | (static_cast<uint8_t>(1) << bit_number));
  }
}

bool I2cDevice::WriteBits(const uint8_t register_address, const uint8_t bit_start, const uint8_t length, const uint8_t data) {
  uint8_t value = 0;
  if (!Read(register_address, &value)) {
    return false;
  }

  uint8_t mask = ((1 << length) - 1) << (bit_start - length + 1);
  value &= ~(mask);
  value |= (data << (bit_start - length + 1)) & mask;

  return Write(register_address, value);
}

bool I2cDevice::Read(const uint8_t register_address, uint8_t* const buffer, const uint8_t length) {
  if (buffer == nullptr || length == 0) {
    return false;
  }
  Wire.beginTransmission(device_i2c_address_);
  Wire.write(register_address);
  auto transmission_result = Wire.endTransmission();
  if (transmission_result != 0) {
    return false;
  }

  if (length != Wire.requestFrom(device_i2c_address_, length)) {
    return false;
  }

  if (length != Wire.readBytes(buffer, length)) {
    return false;
  }

  return true;
}

uint8_t I2cDevice::Read(const uint8_t register_address, const uint8_t default_vale = 0) {
  uint8_t data = 0;
  return Read(register_address, &data) ? data : default_vale;
}
