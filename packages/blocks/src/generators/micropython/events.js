import { MicroPythonGenerator } from './generator';

const proto = MicroPythonGenerator.prototype;

proto['event_whenflagclicked'] = function () {
  const branchCode = this.eventToCode('start', 'runtime.flash_mode');
  return `@when_start\n${branchCode}`;
};

proto['event_whengreaterthan'] = function (block) {
  const nameValue = block.getFieldValue('WHENGREATERTHANMENU');
  const valueCode = this.valueToCode(block, 'VALUE', this.ORDER_NONE) || 0;
  const branchCode = this.eventToCode('greaterthen', 'runtime.flash_mode');
  return `@when_greaterthen("${nameValue}", num(${valueCode}))\n${branchCode}`;
};
