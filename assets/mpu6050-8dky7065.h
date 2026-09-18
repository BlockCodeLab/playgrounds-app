#include <stdint.h>

#include "I2cDevice.h"

/**
 * @class Mpu6050
 * @example get_acceleration.ino
 * @example get_euler.ino
 */

class Mpu6050 {
public:
  /**
   * @brief Default I2C device address for the MPU6050.
   */
  enum : uint8_t { kDefaultDeviceI2cAddress = 0x68 };

  /**
   * @brief Euler angles (yaw, pitch, and roll).
   */
  struct Euler {
    float yaw;   /**< Yaw angle. */
    float pitch; /**< Pitch angle. */
    float roll;  /**< Roll angle. */
  };

  /**
   * @brief Acceleration in x, y, and z directions.
   */
  struct Acceleration {
    int16_t x; /**< Acceleration in the x direction. */
    int16_t y; /**< Acceleration in the y direction. */
    int16_t z; /**< Acceleration in the z direction. */
  };

  /**
   * @brief Gravitational force values.
   */
  struct Gravity {
    float x = 0.0; /**< Gravitational force in the x direction. */
    float y = 0.0; /**< Gravitational force in the y direction. */
    float z = 0.0; /**< Gravitational force in the z direction. */
  };

  /**
   * @brief Constructor.
   * @param device_i2c_address The I2C device address for the MPU6050.
   */
  explicit Mpu6050(uint8_t device_i2c_address = kDefaultDeviceI2cAddress);

  /**
   * @brief Sets up the MPU6050.
   * @return true if setup is successful, false otherwise.
   */
  bool Setup();

  /**
   * @brief Updates motion information.
   * @return true if the update is successful, false otherwise.
   */
  bool UpdateMotionInfo();

  /**
   * @brief Gets the Euler angles.
   * @return Euler angles (yaw, pitch, and roll).
   */
  Euler GetEuler() const;

  /**
   * @brief Gets the acceleration values.
   * @return Acceleration in x, y, and z directions.
   */
  Acceleration GetAcceleration() const;

  /**
   * @brief Gets the gravitational force values.
   * @return Gravitational force in x, y, and z directions.
   */
  Gravity GetGravity() const;

private:
  /**
   * @brief Quaternion representation.
   */
  struct Quaternion {
    float w = 0.0; /**< Quaternion w value. */
    float x = 0.0; /**< Quaternion x value. */
    float y = 0.0; /**< Quaternion y value. */
    float z = 0.0; /**< Quaternion z value. */
  };

  /**
   * @brief Retrieves the number of available FIFO (First In, First Out) bytes.
   * @return The number of available FIFO bytes.
   */
  uint16_t GetFifoCount();

  /**
   * @brief Retrieves FIFO (First In, First Out) bytes.
   * @param data A pointer to the buffer to store the FIFO bytes.
   * @param length The length of the buffer.
   */
  void GetFifoBytes(uint8_t *data, uint8_t length);

  /**
   * @brief Retrieves the current FIFO packet.
   * @param data A pointer to the buffer to store the FIFO packet.
   * @param length The length of the buffer.
   * @return true if the retrieval is successful, false otherwise.
   */
  bool GetCurrentFifoPacket(uint8_t *data, const uint8_t length);

  I2cDevice i2c_device_;  /**< I2C device for communication. */
  Quaternion quaternion_; /**< Current quaternion values. */
  Gravity gravity_;       /**< Current gravitational force values. */
};
