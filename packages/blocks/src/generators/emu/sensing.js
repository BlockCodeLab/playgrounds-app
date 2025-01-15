import { EMUGenerator } from './generator';

const proto = EMUGenerator.prototype;

proto['sensing_timer'] = function (block) {
  return ['runtime.times', this.ORDER_FUNCTION_CALL];
};

proto['sensing_resettimer'] = function (block) {
  return 'runtime.resetTimes()\n';
};
