import { EmulatorGenerator } from './generator';

const proto = EmulatorGenerator.prototype;

proto['sensing_timer'] = function (block) {
  return ['runtime.times', this.ORDER_FUNCTION_CALL];
};

proto['sensing_resettimer'] = function (block) {
  return 'runtime.resetTimes()\n';
};
