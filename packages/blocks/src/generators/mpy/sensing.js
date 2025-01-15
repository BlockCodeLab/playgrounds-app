import { MPYGenerator } from './generator';

const proto = MPYGenerator.prototype;

proto['sensing_timer'] = function () {
  return ['runtime.time', this.ORDER_MEMBER];
};

proto['sensing_resettimer'] = function () {
  return 'runtime.reset_timer()\n';
};
