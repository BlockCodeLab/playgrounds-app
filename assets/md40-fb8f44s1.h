#pragma once
#include <Arduino.h>
#include <Wire.h>

#include "em_check.h"

namespace em {

class Md40 {
public:
  static constexpr uint8_t kDefaultI2cAddress = 0x16;
  static constexpr uint8_t kMotorNum = 4;

  class Motor {
  public:
    enum class PhaseRelation : uint8_t {
      kAPhaseLeads = 0,
      kBPhaseLeads = 1,
    };

    enum class State : uint8_t {
      kIdle = 0,
      kRuningWithPwmDuty = 1,
      kRuningWithSpeed = 2,
      kRuningToPosition = 3,
      kReachedPosition = 4,
    };

    Motor(const uint8_t index, const uint8_t i2c_address, TwoWire &wire);

    void Reset();

    void SetEncoderMode(const uint16_t ppr, const uint16_t reduction_ratio,
                        const PhaseRelation phase_relation);

    void SetDcMode();

    float speed_pid_p();

    void set_speed_pid_p(const float value);

    float speed_pid_i();

    void set_speed_pid_i(const float value);

    float speed_pid_d();

    void set_speed_pid_d(const float value);

    float position_pid_p();

    void set_position_pid_p(const float value);

    float position_pid_i();

    void set_position_pid_i(const float value);

    float position_pid_d();

    void set_position_pid_d(const float value);

    void set_position(const int32_t position);

    void set_pulse_count(const int32_t pulse_count);

    void Stop();

    void RunSpeed(const int32_t rpm);

    void RunPwmDuty(const int16_t pwm_duty);

    void MoveTo(const int32_t position, const int32_t speed);

    void Move(const int32_t offset, const int32_t speed);

    State state();

    int32_t speed();

    int32_t position();

    int32_t pulse_count();

    int16_t pwm_duty();

  private:
    Motor(const Motor &) = delete;
    Motor &operator=(const Motor &) = delete;

    void ExecuteCommand();

    void WaitCommandEmptied();

    void WriteCommand(const uint8_t command, const uint8_t *data,
                      const uint16_t length);

    const uint8_t index_ = 0;
    TwoWire &wire_ = Wire;
    const uint8_t i2c_address_ = kDefaultI2cAddress;
  };

  Md40(const uint8_t i2c_address, TwoWire &wire = Wire);

  Motor &operator[](uint8_t index);

  void Init();

  String firmware_version();

  uint8_t device_id();

  String name();

private:
  Md40(const Md40 &) = delete;
  Md40 &operator=(const Md40 &) = delete;

  const uint8_t i2c_address_ = kDefaultI2cAddress;
  TwoWire &wire_ = Wire;
  Motor *motors_[kMotorNum] = {nullptr};
};

} // namespace em
