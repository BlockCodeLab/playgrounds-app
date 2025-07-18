import { MicroPythonGenerator } from './generator';

const proto = MicroPythonGenerator.prototype;

proto['event_whenflagclicked'] = function (block) {
  let branchCode = this.statementToCode(block);
  branchCode = this.addEventTrap(branchCode, block.id);

  let code = '';
  code += '@_tasks__.append\n';
  code += branchCode;
  return code;
};
