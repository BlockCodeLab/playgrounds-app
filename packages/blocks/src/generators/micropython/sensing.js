import { MicroPythonGenerator } from './generator';

const proto = MicroPythonGenerator.prototype;

proto['sensing_timer'] = function () {
  return ['_times__', this.ORDER_MEMBER];
};

proto['sensing_resettimer'] = function () {
  this.definitions_['import_time'] = 'import time';
  return '_times__ = time.ticks_ms()\n';
};
