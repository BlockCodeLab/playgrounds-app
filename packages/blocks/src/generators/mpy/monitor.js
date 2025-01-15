import { MPYGenerator } from './generator';

const proto = MPYGenerator.prototype;

proto['monitor_debug'] = function (block) {
  const valueCode = this.quote_(this.valueToCode(block, 'VALUE', this.ORDER_NONE) || 'debug');
  return `print(${valueCode})\n`;
};

proto['monitor_showvalue'] = () => '';

proto['monitor_shownamedvalue'] = proto['monitor_showvalue'];
