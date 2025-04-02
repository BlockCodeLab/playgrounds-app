import { MicroPythonGenerator } from './generator';

const proto = MicroPythonGenerator.prototype;

proto['control_wait'] = function (block) {
  const durationCode = this.valueToCode(block, 'DURATION', this.ORDER_NONE);
  const code = `await asyncio.sleep(num(${durationCode}))\n`;
  return code;
};

proto['control_repeat'] = function (block) {
  const timesCode = this.valueToCode(block, 'TIMES', this.ORDER_NONE);

  let branchCode = this.statementToCode(block, 'SUBSTACK');
  branchCode = this.addLoopTrap(branchCode, block.id);

  let code = '';
  code += `for _ in range(num(${timesCode})):\n`;
  code += branchCode;
  return code;
};

proto['control_forever'] = function (block) {
  let branchCode = this.statementToCode(block, 'SUBSTACK');
  branchCode = this.addLoopTrap(branchCode, block.id);

  let code = '';
  code += 'while True:\n';
  code += branchCode;
  return code;
};

proto['control_if'] = function (block) {
  const conditionCode = this.valueToCode(block, 'CONDITION', this.ORDER_NONE) || 'False';

  let code = '';
  let branchCode = this.statementToCode(block, 'SUBSTACK') || this.PASS;
  code += `if ${conditionCode}:\n`;
  code += branchCode;

  // else branch.
  if (block.getInput('SUBSTACK2')) {
    branchCode = this.statementToCode(block, 'SUBSTACK2') || this.PASS;
    code += 'else:\n';
    code += branchCode;
  }
  return code;
};

proto['control_if_else'] = proto['control_if'];

proto['control_repeat_until'] = function (block) {
  const conditionCode = this.valueToCode(block, 'CONDITION', this.ORDER_NONE) || 'False';

  let branchCode = this.statementToCode(block, 'SUBSTACK');
  branchCode = this.addLoopTrap(branchCode, block.id);

  let code = '';
  code += `while not ${conditionCode}:\n`;
  code += branchCode;
  return code;
};

proto['control_wait_until'] = proto['control_repeat_until'];

proto['control_while'] = function (block) {
  const conditionCode = this.valueToCode(block, 'CONDITION', this.ORDER_NONE) || 'False';

  let branchCode = this.statementToCode(block, 'SUBSTACK');
  branchCode = this.addLoopTrap(branchCode, block.id);

  let code = '';
  code += `while ${conditionCode}:\n`;
  code += branchCode;
  return code;
};

proto['control_stop'] = function (block) {
  let code = '';
  const stopValue = block.getFieldValue('STOP_OPTION');
  switch (stopValue) {
    case 'all':
      this.definitions_['import_sys'] = 'import sys';
      code += 'sys.exit()\n';
      break;
    case 'this script':
      code += 'return\n';
      break;
    case 'other scripts in sprite':
      code += '# other scripts\n';
      break;
  }
  return code;
};

proto['control_start_as_clone'] = () => '';

proto['control_create_clone_of'] = () => '';

proto['control_delete_this_clone'] = () => '';
