#include "md40.h"

namespace em {

namespace {
constexpr uint8_t kMotorStateOffset = 0x20;
constexpr uint8_t kI2cEndTransmissionSuccess = 0;

enum Command : uint8_t {
  kSetup = 1,
  kReset = 2,
  kSetSpeedPidP = 3,
  kSetSpeedPidI = 4,
  kSetSpeedPidD = 5,
  kSetPositionPidP = 6,
  kSetPositionPidI = 7,
  kSetPositionPidD = 8,
  kSetPosition = 9,
  kSetPulseCount = 10,
  kStop = 11,
  kRunPwmDuty = 12,
  kRunSpeed = 13,
  kMoveTo = 14,
  kMove = 15,
};

enum MemoryAddress : uint8_t {
  kDeviceId = 0x00,
  kMajorVersion = 0x01,
  kMinorVersion = 0x02,
  kPatchVersion = 0x03,
  kName = 0x04,
  kCommandType = 0x11,
  kCommandIndex = 0x12,
  kCommandParam = 0x13,
  kCommandExecute = 0x23,
  kState = 0x24,
  kSpeedP = 0x26,
  kSpeedI = 0x28,
  kSpeedD = 0x2A,
  kPositionP = 0x2C,
  kPositionI = 0x2E,
  kPositionD = 0x30,
  kSpeed = 0x34,
  kPosition = 0x38,
  kPulseCount = 0x3C,
  kPwmDuty = 0x40,
};
} // namespace

Md40::Md40(const uint8_t i2c_address, TwoWire &wire)
    : i2c_address_(i2c_address), wire_(wire) {
  for (uint8_t i = 0; i < kMotorNum; i++) {
    motors_[i] = new Motor(i, i2c_address, wire);
  }
}

Md40::Motor &Md40::operator[](const uint8_t index) {
  EM_CHECK_LT(index, kMotorNum);
  return *motors_[index];
}

void Md40::Init() {
  for (auto motor : motors_) {
    motor->Reset();
  }
}

String Md40::firmware_version() {
  wire_.beginTransmission(i2c_address_);
  wire_.write(kMajorVersion);
  EM_CHECK_EQ(wire_.endTransmission(), kI2cEndTransmissionSuccess);

  uint8_t version[3] = {0};
  EM_CHECK_EQ(
      wire_.requestFrom(i2c_address_, static_cast<uint8_t>(sizeof(version))),
      sizeof(version));

  uint8_t offset = 0;
  while (offset < sizeof(version)) {
    if (wire_.available() > 0) {
      version[offset++] = wire_.read();
    }
  }

  return String(version[0]) + "." + String(version[1]) + "." +
         String(version[2]);
}

uint8_t Md40::device_id() {
  wire_.beginTransmission(i2c_address_);
  wire_.write(kDeviceId);
  EM_CHECK_EQ(wire_.endTransmission(), kI2cEndTransmissionSuccess);

  EM_CHECK_EQ(wire_.requestFrom(i2c_address_, static_cast<uint8_t>(1)), 1);

  while (wire_.available() == 0)
    ;

  return wire_.read();
}

String Md40::name() {
  wire_.beginTransmission(i2c_address_);
  wire_.write(kName);
  EM_CHECK_EQ(wire_.endTransmission(), kI2cEndTransmissionSuccess);

  constexpr uint8_t kLength = 8;
  EM_CHECK_EQ(wire_.requestFrom(i2c_address_, kLength), kLength);

  String result;
  while (result.length() < kLength) {
    if (wire_.available() > 0) {
      result += static_cast<char>(wire_.read());
    }
  }

  return result;
}

Md40::Motor::Motor(const uint8_t index, const uint8_t i2c_address,
                   TwoWire &wire)
    : index_(index), i2c_address_(i2c_address), wire_(wire) {}

void Md40::Motor::ExecuteCommand() {
  wire_.beginTransmission(i2c_address_);
  wire_.write(kCommandExecute);
  wire_.write(0x01);

  EM_CHECK_EQ(wire_.endTransmission(), kI2cEndTransmissionSuccess);

  WaitCommandEmptied();
}

void Md40::Motor::WaitCommandEmptied() {
  uint8_t result = 0xFF;
  do {
    wire_.beginTransmission(i2c_address_);
    wire_.write(kCommandExecute);

    EM_CHECK_EQ(wire_.endTransmission(), kI2cEndTransmissionSuccess);

    EM_CHECK_EQ(
        wire_.requestFrom(i2c_address_, static_cast<uint8_t>(sizeof(result))),
        sizeof(result));

    while (wire_.available() == 0)
      ;

    result = wire_.read();
  } while (result != 0);
}

void Md40::Motor::WriteCommand(const uint8_t command, const uint8_t *data,
                               const uint16_t length) {
  wire_.beginTransmission(i2c_address_);
  wire_.write(kCommandType);
  wire_.write(command);
  wire_.write(index_);
  if (data != nullptr && length > 0) {
    wire_.write(data, length);
  }
  EM_CHECK_EQ(wire_.endTransmission(), kI2cEndTransmissionSuccess);
}

void Md40::Motor::Reset() {
  WaitCommandEmptied();

  WriteCommand(kReset, nullptr, 0);

  ExecuteCommand();
}

void Md40::Motor::SetEncoderMode(const uint16_t ppr,
                                 const uint16_t reduction_ratio,
                                 const PhaseRelation phase_relation) {
  WaitCommandEmptied();

  wire_.beginTransmission(i2c_address_);
  wire_.write(kCommandType);
  wire_.write(kSetup);
  wire_.write(index_);
  wire_.write(reinterpret_cast<const uint8_t *>(&ppr), sizeof(ppr));
  wire_.write(reinterpret_cast<const uint8_t *>(&reduction_ratio),
              sizeof(reduction_ratio));
  wire_.write(static_cast<uint8_t>(phase_relation));

  EM_CHECK_EQ(wire_.endTransmission(), kI2cEndTransmissionSuccess);

  ExecuteCommand();
}

void Md40::Motor::SetDcMode() {
  WaitCommandEmptied();

  wire_.beginTransmission(i2c_address_);
  wire_.write(kCommandType);
  wire_.write(kSetup);
  wire_.write(index_);
  wire_.write(0);
  wire_.write(0);
  wire_.write(0);

  EM_CHECK_EQ(wire_.endTransmission(), kI2cEndTransmissionSuccess);

  ExecuteCommand();
}

float Md40::Motor::speed_pid_p() {
  wire_.beginTransmission(i2c_address_);
  wire_.write(static_cast<uint8_t>(kSpeedP + index_ * kMotorStateOffset));
  EM_CHECK_EQ(wire_.endTransmission(), kI2cEndTransmissionSuccess);

  uint16_t data = 0;
  EM_CHECK_EQ(
      wire_.requestFrom(i2c_address_, static_cast<uint8_t>(sizeof(data))),
      sizeof(data));

  uint8_t offset = 0;
  while (offset < sizeof(data)) {
    if (wire_.available()) {
      reinterpret_cast<uint8_t *>(&data)[offset++] = wire_.read();
    }
  }

  return data / 100.0f;
}

void Md40::Motor::set_speed_pid_p(const float value) {
  WaitCommandEmptied();

  const uint16_t int_value = static_cast<uint16_t>(value * 100);
  WriteCommand(kSetSpeedPidP, reinterpret_cast<const uint8_t *>(&int_value),
               sizeof(int_value));

  ExecuteCommand();
}

float Md40::Motor::speed_pid_i() {
  wire_.beginTransmission(i2c_address_);
  wire_.write(static_cast<uint8_t>(kSpeedI + index_ * kMotorStateOffset));
  EM_CHECK_EQ(wire_.endTransmission(), kI2cEndTransmissionSuccess);

  uint16_t data = 0;
  EM_CHECK_EQ(
      wire_.requestFrom(i2c_address_, static_cast<uint8_t>(sizeof(data))),
      sizeof(data));

  uint8_t offset = 0;
  while (offset < sizeof(data)) {
    if (wire_.available()) {
      reinterpret_cast<uint8_t *>(&data)[offset++] = wire_.read();
    }
  }

  return data / 100.0f;
}

void Md40::Motor::set_speed_pid_i(const float value) {
  WaitCommandEmptied();

  const uint16_t int_value = static_cast<uint16_t>(value * 100);
  WriteCommand(kSetSpeedPidI, reinterpret_cast<const uint8_t *>(&int_value),
               sizeof(int_value));

  ExecuteCommand();
}

float Md40::Motor::speed_pid_d() {
  wire_.beginTransmission(i2c_address_);
  wire_.write(static_cast<uint8_t>(kSpeedD + index_ * kMotorStateOffset));
  EM_CHECK_EQ(wire_.endTransmission(), kI2cEndTransmissionSuccess);

  uint16_t data = 0;
  EM_CHECK_EQ(
      wire_.requestFrom(i2c_address_, static_cast<uint8_t>(sizeof(data))),
      sizeof(data));

  uint8_t offset = 0;
  while (offset < sizeof(data)) {
    if (wire_.available()) {
      reinterpret_cast<uint8_t *>(&data)[offset++] = wire_.read();
    }
  }

  return data / 100.0f;
}

void Md40::Motor::set_speed_pid_d(const float value) {
  WaitCommandEmptied();

  const uint16_t int_value = static_cast<uint16_t>(value * 100);
  WriteCommand(kSetSpeedPidD, reinterpret_cast<const uint8_t *>(&int_value),
               sizeof(int_value));

  ExecuteCommand();
}

float Md40::Motor::position_pid_p() {
  wire_.beginTransmission(i2c_address_);
  wire_.write(static_cast<uint8_t>(kPositionP + index_ * kMotorStateOffset));
  EM_CHECK_EQ(wire_.endTransmission(), kI2cEndTransmissionSuccess);

  uint16_t data = 0;
  EM_CHECK_EQ(
      wire_.requestFrom(i2c_address_, static_cast<uint8_t>(sizeof(data))),
      sizeof(data));

  uint8_t offset = 0;
  while (offset < sizeof(data)) {
    if (wire_.available()) {
      reinterpret_cast<uint8_t *>(&data)[offset++] = wire_.read();
    }
  }

  return data / 100.0f;
}

void Md40::Motor::set_position_pid_p(const float value) {
  WaitCommandEmptied();

  const uint16_t int_value = static_cast<uint16_t>(value * 100);
  WriteCommand(kSetPositionPidP, reinterpret_cast<const uint8_t *>(&int_value),
               sizeof(int_value));

  ExecuteCommand();
}

float Md40::Motor::position_pid_i() {
  wire_.beginTransmission(i2c_address_);
  wire_.write(static_cast<uint8_t>(kPositionI + index_ * kMotorStateOffset));
  EM_CHECK_EQ(wire_.endTransmission(), kI2cEndTransmissionSuccess);

  uint16_t data = 0;
  EM_CHECK_EQ(
      wire_.requestFrom(i2c_address_, static_cast<uint8_t>(sizeof(data))),
      sizeof(data));

  uint8_t offset = 0;
  while (offset < sizeof(data)) {
    if (wire_.available()) {
      reinterpret_cast<uint8_t *>(&data)[offset++] = wire_.read();
    }
  }

  return data / 100.0f;
}

void Md40::Motor::set_position_pid_i(const float value) {
  WaitCommandEmptied();

  const uint16_t int_value = static_cast<uint16_t>(value * 100);
  WriteCommand(kSetPositionPidI, reinterpret_cast<const uint8_t *>(&int_value),
               sizeof(int_value));

  ExecuteCommand();
}

float Md40::Motor::position_pid_d() {
  wire_.beginTransmission(i2c_address_);
  wire_.write(static_cast<uint8_t>(kPositionD + index_ * kMotorStateOffset));
  EM_CHECK_EQ(wire_.endTransmission(), kI2cEndTransmissionSuccess);

  uint16_t data = 0;
  EM_CHECK_EQ(
      wire_.requestFrom(i2c_address_, static_cast<uint8_t>(sizeof(data))),
      sizeof(data));

  uint8_t offset = 0;
  while (offset < sizeof(data)) {
    if (wire_.available()) {
      reinterpret_cast<uint8_t *>(&data)[offset++] = wire_.read();
    }
  }

  return data / 100.0f;
}

void Md40::Motor::set_position_pid_d(const float value) {
  WaitCommandEmptied();

  const uint16_t int_value = static_cast<uint16_t>(value * 100);
  WriteCommand(kSetPositionPidD, reinterpret_cast<const uint8_t *>(&int_value),
               sizeof(int_value));

  ExecuteCommand();
}

void Md40::Motor::set_position(const int32_t position) {
  WaitCommandEmptied();

  WriteCommand(kSetPosition, reinterpret_cast<const uint8_t *>(&position),
               sizeof(position));

  ExecuteCommand();
}

void Md40::Motor::set_pulse_count(const int32_t pulse_count) {
  WaitCommandEmptied();

  WriteCommand(kSetPulseCount, reinterpret_cast<const uint8_t *>(&pulse_count),
               sizeof(pulse_count));

  ExecuteCommand();
}

void Md40::Motor::Stop() {
  WaitCommandEmptied();

  WriteCommand(kStop, nullptr, 0);

  ExecuteCommand();
}

void Md40::Motor::RunSpeed(const int32_t rpm) {
  WaitCommandEmptied();

  WriteCommand(kRunSpeed, reinterpret_cast<const uint8_t *>(&rpm), sizeof(rpm));

  ExecuteCommand();
}

void Md40::Motor::RunPwmDuty(const int16_t pwm_duty) {
  WaitCommandEmptied();

  WriteCommand(kRunPwmDuty, reinterpret_cast<const uint8_t *>(&pwm_duty),
               sizeof(pwm_duty));

  ExecuteCommand();
}

void Md40::Motor::MoveTo(const int32_t position, const int32_t speed) {
  WaitCommandEmptied();

  const int32_t data[] = {position, speed};
  WriteCommand(kMoveTo, reinterpret_cast<const uint8_t *>(data), sizeof(data));

  ExecuteCommand();
}

void Md40::Motor::Move(const int32_t offset, const int32_t speed) {
  WaitCommandEmptied();

  const int32_t data[] = {offset, speed};
  WriteCommand(kMove, reinterpret_cast<const uint8_t *>(data), sizeof(data));

  ExecuteCommand();
}

Md40::Motor::State Md40::Motor::state() {
  const uint8_t address = kState + index_ * kMotorStateOffset;

  wire_.beginTransmission(i2c_address_);
  wire_.write(address);
  wire_.write(0);
  EM_CHECK_EQ(wire_.endTransmission(), kI2cEndTransmissionSuccess);

  wire_.beginTransmission(i2c_address_);
  wire_.write(address);
  EM_CHECK_EQ(wire_.endTransmission(), kI2cEndTransmissionSuccess);

  EM_CHECK_EQ(wire_.requestFrom(i2c_address_, static_cast<uint8_t>(1)), 1);

  while (wire_.available() == 0)
    ;

  return static_cast<Md40::Motor::State>(wire_.read());
}

int32_t Md40::Motor::speed() {
  const uint8_t address = kSpeed + index_ * kMotorStateOffset;

  wire_.beginTransmission(i2c_address_);
  wire_.write(address);
  wire_.write(0);
  EM_CHECK_EQ(wire_.endTransmission(), kI2cEndTransmissionSuccess);

  wire_.beginTransmission(i2c_address_);
  wire_.write(address);
  EM_CHECK_EQ(wire_.endTransmission(), kI2cEndTransmissionSuccess);

  int32_t data = 0;
  EM_CHECK_EQ(
      wire_.requestFrom(i2c_address_, static_cast<uint8_t>(sizeof(data))),
      sizeof(data));

  uint8_t offset = 0;
  while (offset < sizeof(data)) {
    if (wire_.available()) {
      reinterpret_cast<uint8_t *>(&data)[offset++] = wire_.read();
    }
  }
  return data;
}

int32_t Md40::Motor::position() {
  const uint8_t address = kPosition + index_ * kMotorStateOffset;

  wire_.beginTransmission(i2c_address_);
  wire_.write(address);
  wire_.write(0);
  EM_CHECK_EQ(wire_.endTransmission(), kI2cEndTransmissionSuccess);

  wire_.beginTransmission(i2c_address_);
  wire_.write(address);
  EM_CHECK_EQ(wire_.endTransmission(), kI2cEndTransmissionSuccess);

  int32_t data = 0;
  EM_CHECK_EQ(
      wire_.requestFrom(i2c_address_, static_cast<uint8_t>(sizeof(data))),
      sizeof(data));

  uint8_t offset = 0;
  while (offset < sizeof(data)) {
    if (wire_.available() > 0) {
      reinterpret_cast<uint8_t *>(&data)[offset++] = wire_.read();
    }
  }

  return data;
}

int32_t Md40::Motor::pulse_count() {
  const uint8_t address = kPulseCount + index_ * kMotorStateOffset;

  wire_.beginTransmission(i2c_address_);
  wire_.write(address);
  wire_.write(0);
  EM_CHECK_EQ(wire_.endTransmission(), kI2cEndTransmissionSuccess);

  wire_.beginTransmission(i2c_address_);
  wire_.write(address);
  EM_CHECK_EQ(wire_.endTransmission(), kI2cEndTransmissionSuccess);

  int32_t data = 0;
  EM_CHECK_EQ(
      wire_.requestFrom(i2c_address_, static_cast<uint8_t>(sizeof(data))),
      sizeof(data));

  uint8_t offset = 0;
  while (offset < sizeof(data)) {
    if (wire_.available()) {
      reinterpret_cast<uint8_t *>(&data)[offset++] = wire_.read();
    }
  }

  return data;
}

int16_t Md40::Motor::pwm_duty() {
  const uint8_t address = kPwmDuty + index_ * kMotorStateOffset;

  wire_.beginTransmission(i2c_address_);
  wire_.write(address);
  wire_.write(0);
  EM_CHECK_EQ(wire_.endTransmission(), kI2cEndTransmissionSuccess);

  wire_.beginTransmission(i2c_address_);
  wire_.write(address);
  EM_CHECK_EQ(wire_.endTransmission(), kI2cEndTransmissionSuccess);

  int16_t data = 0;
  EM_CHECK_EQ(
      wire_.requestFrom(i2c_address_, static_cast<uint8_t>(sizeof(data))),
      sizeof(data));

  uint8_t offset = 0;
  while (offset < sizeof(data)) {
    if (wire_.available()) {
      reinterpret_cast<uint8_t *>(&data)[offset++] = wire_.read();
    }
  }

  return data;
}

} // namespace em
