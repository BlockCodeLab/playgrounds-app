#pragma once
#include <Arduino.h>

class StepperMotor {
public:
  // 步进模式
  static const int MODE_NONE = 0;
  static const int MODE_RUN_FORWARD = 1;
  static const int MODE_RUN_BACKWARD = 2;
  static const int MODE_RUN_WITH_POSITION = 3;

  // 励磁模式
  static const int SINGLE_PHASE_FULL_STEP_EXCITATION = 0;
  static const int TWO_PHASE_FULL_STEP_EXCITATION = 1;
  static const int HALF_PHASE_EXCITATION = 2;

  // 构造函数
  StepperMotor(int pin_a, int pin_b, int pin_c, int pin_d);
  ~StepperMotor();

  // 配置方法
  int getExcitation();
  void setExcitation(int excitation);
  int getRpm();
  void setRpm(int rpm);

  // 位置控制
  long getCurrentStep();
  void setCurrentStep(long current_step);
  float getCurrentAngle();
  void setCurrentAngle(float current_angle);

  long getTargetStep();
  void setTargetStep(long target_step);
  float getTargetAngle();
  void setTargetAngle(float target_angle);

  // 移动控制
  void move(long steps);
  void rotate(float angle);
  void forward();
  void backward();
  void stop();

  // 状态检查
  bool reachedTargetAngle();

  // 运行控制
  void tick();
  void runBlocking();
  void run();

private:
  // 私有方法
  void updateStepDelay();
  long angleToStep(float angle);
  float stepToAngle(long step);
  void setPins(int a, int b, int c, int d);

  // 步进序列
  static const int STEP_SEQUENCE[3][8][4];

  // 私有变量
  int pinA, pinB, pinC, pinD;

  int _excitation;
  long _current_step;
  long _target_step;
  int _mode;
  int _rpm;
  unsigned long _last_step_time;
  unsigned long _step_delay_ms;
  float _target_angle;

  // 步进电机参数
  static const int FULL_ROTATION_STEPS =
      4096; // 28BYJ-48电机完整一周的步数（半步模式）
  int _current_sequence_step;
};
