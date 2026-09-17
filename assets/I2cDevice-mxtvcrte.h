#pragma once

#include <stdint.h>
#include <stddef.h>

class I2cDevice {
 public:
  I2cDevice(const uint8_t device_i2c_address);

  virtual ~I2cDevice() = default;

  bool Setup();

  uint8_t Address() const {
    return device_i2c_address_;
  }

  bool Write(const uint8_t register_address, const uint8_t* data, const uint8_t length);

  bool Write(const uint8_t register_address, const uint8_t data);

  template <size_t size>
  bool Write(const uint8_t register_address, const uint8_t (&array)[size]) {
    return Write(register_address, array, size);
  }

  bool WriteBit(const uint8_t register_address, const uint8_t bit_number, const uint8_t data);

  bool WriteBits(const uint8_t register_address, const uint8_t bit_start, const uint8_t length, const uint8_t data);

  bool Read(const uint8_t register_address, uint8_t* const buffer, const uint8_t length = 1);

  uint8_t Read(const uint8_t register_address, const uint8_t default_vale = 0);

 private:
  const uint8_t device_i2c_address_;
};