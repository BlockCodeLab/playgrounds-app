#include "stepper_motor.h"

// 步进序列定义
const int StepperMotor::STEP_SEQUENCE[3][8][4] = {
    {// 单相全步励磁
     {1, 0, 0, 0},
     {0, 1, 0, 0},
     {0, 0, 1, 0},
     {0, 0, 0, 1},
     {0, 0, 0, 0}, // 填充，使所有序列都有8个元素
     {0, 0, 0, 0},
     {0, 0, 0, 0},
     {0, 0, 0, 0}},
    {// 双相全步励磁
     {1, 1, 0, 0},
     {0, 1, 1, 0},
     {0, 0, 1, 1},
     {1, 0, 0, 1},
     {0, 0, 0, 0}, // 填充
     {0, 0, 0, 0},
     {0, 0, 0, 0},
     {0, 0, 0, 0}},
    {// 半步励磁
     {1, 0, 0, 0},
     {1, 1, 0, 0},
     {0, 1, 0, 0},
     {0, 1, 1, 0},
     {0, 0, 1, 0},
     {0, 0, 1, 1},
     {0, 0, 0, 1},
     {1, 0, 0, 1}}};

// 构造函数
StepperMotor::StepperMotor(int pin_a, int pin_b, int pin_c, int pin_d) {
  pinA = pin_a;
  pinB = pin_b;
  pinC = pin_c;
  pinD = pin_d;

  // 初始化引脚
  pinMode(pinA, OUTPUT);
  pinMode(pinB, OUTPUT);
  pinMode(pinC, OUTPUT);
  pinMode(pinD, OUTPUT);

  // 初始状态：所有引脚为低
  digitalWrite(pinA, LOW);
  digitalWrite(pinB, LOW);
  digitalWrite(pinC, LOW);
  digitalWrite(pinD, LOW);

  _excitation = HALF_PHASE_EXCITATION;
  _current_step = 0;
  _target_step = 0;
  _mode = MODE_NONE;
  _rpm = 10;
  _last_step_time = 0;
  _target_angle = 0.0;
  _current_sequence_step = 0;

  updateStepDelay();
}

// 析构函数
StepperMotor::~StepperMotor() {
  // 停止电机
  stop();
}

// 设置引脚状态
void StepperMotor::setPins(int a, int b, int c, int d) {
  digitalWrite(pinA, a);
  digitalWrite(pinB, b);
  digitalWrite(pinC, c);
  digitalWrite(pinD, d);
}

// 获取励磁模式
int StepperMotor::getExcitation() { return _excitation; }

// 设置励磁模式
void StepperMotor::setExcitation(int excitation) {
  if (excitation >= 0 && excitation <= 2) {
    _excitation = excitation;
    _current_sequence_step = 0;
    updateStepDelay();
  }
}

// 获取转速
int StepperMotor::getRpm() { return _rpm; }

// 设置转速
void StepperMotor::setRpm(int rpm) {
  if (rpm > 0) {
    _rpm = rpm;
    updateStepDelay();
  }
}

// 更新步进延迟时间
void StepperMotor::updateStepDelay() {
  if (_rpm > 0) {
    // 计算每步的延迟时间（毫秒）
    // 对于28BYJ-48电机，使用半步模式（8步序列）
    // 完整一周需要4096步（64 * 64）
    // 计算：每分钟转数 * 每转步数 = 每分钟总步数
    // 转换为毫秒/步：60000 / (rpm * steps_per_rev)

    // 根据励磁模式确定每转步数
    int steps_per_sequence;
    switch (_excitation) {
    case SINGLE_PHASE_FULL_STEP_EXCITATION:
      steps_per_sequence = 4;
      break;
    case TWO_PHASE_FULL_STEP_EXCITATION:
      steps_per_sequence = 4;
      break;
    case HALF_PHASE_EXCITATION:
    default:
      steps_per_sequence = 8;
      break;
    }

    // 实际每转步数 = 4096 / (8 / steps_per_sequence)
    // 这是因为4096是假设使用8步序列时的步数
    float actual_steps_per_rev =
        FULL_ROTATION_STEPS * (steps_per_sequence / 8.0);

    float steps_per_minute = _rpm * actual_steps_per_rev;
    _step_delay_ms = round(60000.0 / steps_per_minute);

    // 确保最小延迟
    if (_step_delay_ms < 1) {
      _step_delay_ms = 1;
    }
  } else {
    _step_delay_ms = 1000; // 默认值
  }
}

// 角度转换为步数
long StepperMotor::angleToStep(float angle) {
  // 角度转步数：angle / 360 * 步数每转
  // 对于28BYJ-48，使用半步模式时，每转4096步

  int steps_per_sequence;
  switch (_excitation) {
  case SINGLE_PHASE_FULL_STEP_EXCITATION:
    steps_per_sequence = 4;
    break;
  case TWO_PHASE_FULL_STEP_EXCITATION:
    steps_per_sequence = 4;
    break;
  case HALF_PHASE_EXCITATION:
  default:
    steps_per_sequence = 8;
    break;
  }

  float actual_steps_per_rev = FULL_ROTATION_STEPS * (steps_per_sequence / 8.0);
  return round(angle * actual_steps_per_rev / 360.0);
}

// 步数转换为角度
float StepperMotor::stepToAngle(long step) {
  int steps_per_sequence;
  switch (_excitation) {
  case SINGLE_PHASE_FULL_STEP_EXCITATION:
    steps_per_sequence = 4;
    break;
  case TWO_PHASE_FULL_STEP_EXCITATION:
    steps_per_sequence = 4;
    break;
  case HALF_PHASE_EXCITATION:
  default:
    steps_per_sequence = 8;
    break;
  }

  float actual_steps_per_rev = FULL_ROTATION_STEPS * (steps_per_sequence / 8.0);
  return step * 360.0 / actual_steps_per_rev;
}

// 检查是否到达目标角度
bool StepperMotor::reachedTargetAngle() {
  return (_mode == MODE_NONE) ||
         (_current_step == _target_step && _mode == MODE_RUN_WITH_POSITION);
}

// 获取当前步数
long StepperMotor::getCurrentStep() { return _current_step; }

// 设置当前步数
void StepperMotor::setCurrentStep(long current_step) {
  _current_step = current_step;
}

// 获取当前角度
float StepperMotor::getCurrentAngle() { return stepToAngle(_current_step); }

// 设置当前角度
void StepperMotor::setCurrentAngle(float current_angle) {
  _current_step = angleToStep(current_angle);
}

// 获取目标步数
long StepperMotor::getTargetStep() { return _target_step; }

// 设置目标步数
void StepperMotor::setTargetStep(long target_step) {
  _mode = MODE_RUN_WITH_POSITION;
  _target_step = target_step;
}

// 获取目标角度
float StepperMotor::getTargetAngle() { return _target_angle; }

// 设置目标角度
void StepperMotor::setTargetAngle(float target_angle) {
  _target_angle = target_angle;
  _mode = MODE_RUN_WITH_POSITION;
  _target_step = angleToStep(_target_angle);
}

// 移动指定步数
void StepperMotor::move(long steps) { setTargetStep(_current_step - steps); }

// 旋转指定角度
void StepperMotor::rotate(float angle) {
  setTargetAngle(getCurrentAngle() - angle);
}

// 正向旋转
void StepperMotor::forward() { _mode = MODE_RUN_FORWARD; }

// 反向旋转
void StepperMotor::backward() { _mode = MODE_RUN_BACKWARD; }

// 停止
void StepperMotor::stop() {
  _mode = MODE_NONE;
  // 将所有引脚设置为低电平以停止电机
  setPins(0, 0, 0, 0);
}

// 更新函数（需要在loop中调用）
void StepperMotor::tick() {
  if (_mode == MODE_NONE) {
    return;
  }

  unsigned long current_time = millis();

  // 检查是否到了下一步的时间
  if (current_time - _last_step_time < _step_delay_ms) {
    return;
  }

  _last_step_time = current_time;

  // 根据模式执行动作
  if (_mode == MODE_RUN_WITH_POSITION) {
    if (_target_step > _current_step) {
      // 正向旋转
      _current_step++;
      // 更新序列步数
      _current_sequence_step = (_current_sequence_step + 1) % 8;
    } else if (_target_step < _current_step) {
      // 反向旋转
      _current_step--;
      // 更新序列步数（反向）
      _current_sequence_step = (_current_sequence_step + 7) % 8;
    } else {
      _mode = MODE_NONE;
      return;
    }
  } else if (_mode == MODE_RUN_FORWARD) {
    _current_step--;
    _current_sequence_step = (_current_sequence_step + 7) % 8;
  } else if (_mode == MODE_RUN_BACKWARD) {
    _current_step++;
    _current_sequence_step = (_current_sequence_step + 1) % 8;
  }

  // 设置引脚状态
  const int *step_values = STEP_SEQUENCE[_excitation][_current_sequence_step];
  setPins(step_values[0], step_values[1], step_values[2], step_values[3]);
}

// 阻塞式运行直到完成
void StepperMotor::runBlocking() {
  if (_mode == MODE_RUN_WITH_POSITION) {
    long steps_to_move = _target_step - _current_step;
    int direction = (steps_to_move > 0) ? 1 : -1;
    steps_to_move = abs(steps_to_move);

    for (long i = 0; i < steps_to_move; i++) {
      // 执行一步
      if (direction > 0) {
        _current_sequence_step = (_current_sequence_step + 1) % 8;
        _current_step++;
      } else {
        _current_sequence_step = (_current_sequence_step + 7) % 8;
        _current_step--;
      }

      // 设置引脚状态
      const int *step_values =
          STEP_SEQUENCE[_excitation][_current_sequence_step];
      setPins(step_values[0], step_values[1], step_values[2], step_values[3]);

      // 延迟
      delay(_step_delay_ms);
    }

    _mode = MODE_NONE;
  } else if (_mode == MODE_RUN_FORWARD || _mode == MODE_RUN_BACKWARD) {
    // 对于连续旋转模式，阻塞运行没有意义
    Serial.println("警告: 连续旋转模式不能使用阻塞运行!");
  }
}

// 运行函数
void StepperMotor::run() {
  // 已经在tick中实现了非阻塞运行
  // 这个函数主要是为了API兼容性
}
