import { MicroPythonGenerator } from './generator';

const proto = MicroPythonGenerator.prototype;

proto['event_whenflagclicked'] = function (block) {
  let branchCode = this.statementToCode(block);
  branchCode = this.addEventTrap(branchCode, block.id);

  let code = '';
  code += '@when_start\n';
  code += branchCode;
  return code;
};

proto['event_whengreaterthan'] = function (block) {
  const nameValue = this.quote_(block.getFieldValue('WHENGREATERTHANMENU') || 'TIMER');
  const valueCode = this.valueToCode(block, 'VALUE', this.ORDER_NONE);

  let branchCode = this.statementToCode(block);
  branchCode = this.addEventTrap(branchCode, block.id);

  let code = '';
  code += `@when_greaterthen(${nameValue}, num(${valueCode}))\n`;
  code += branchCode;
  return code;
};
