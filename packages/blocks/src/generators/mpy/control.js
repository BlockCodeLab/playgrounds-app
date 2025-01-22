import { MPYGenerator } from './generator';

const proto = MPYGenerator.prototype;

proto['control_wait'] = function (block) {
  let code = '';
  if (this.STATEMENT_PREFIX) {
    code += this.injectId(this.STATEMENT_PREFIX, block);
  }
  const durationCode = this.valueToCode(block, 'DURATION', this.ORDER_NONE) || 0;
  code += `await runtime.wait_for(num(${durationCode}))\n`;
  return code;
};

proto['control_repeat'] = function (block) {
  let code = '';
  if (this.STATEMENT_PREFIX) {
    code += this.injectId(this.STATEMENT_PREFIX, block);
  }
  const loopVarName = this.getLoopVarName();
  const branchCode = this.loopToCode(block, 'SUBSTACK', loopVarName);
  const timesCode = this.valueToCode(block, 'TIMES', this.ORDER_NONE) || 10;
  code += `for ${loopVarName} in range(num(${timesCode})):\n${branchCode}`;
  return code;
};

proto['control_forever'] = function (block) {
  let code = '';
  if (this.STATEMENT_PREFIX) {
    code += this.injectId(this.STATEMENT_PREFIX, block);
  }
  const loopVarName = this.getLoopVarName();
  const branchCode = this.loopToCode(block, 'SUBSTACK', loopVarName);
  code += `${loopVarName} = -1\nwhile True:\n${this.INDENT}${loopVarName} += 1\n${branchCode}`;
  return code;
};

proto['control_if'] = function (block) {
  let code = '';
  if (this.STATEMENT_PREFIX) {
    code += this.injectId(this.STATEMENT_PREFIX, block);
  }
  let branchCode = this.statementToCode(block, 'SUBSTACK') || this.PASS;
  if (this.STATEMENT_SUFFIX) {
    branchCode = this.prefixLines(this.injectId(this.STATEMENT_SUFFIX, block), this.INDENT) + branchCode;
  }
  const conditionCode = this.valueToCode(block, 'CONDITION', this.ORDER_NONE) || 'False';
  code += `if ${conditionCode}:\n${branchCode}`;

  // else branch.
  if (block.getInput('SUBSTACK2')) {
    branchCode = this.statementToCode(block, 'SUBSTACK2') || this.PASS;
    if (this.STATEMENT_SUFFIX) {
      branchCode = this.prefixLines(this.injectId(this.STATEMENT_SUFFIX, block), this.INDENT) + branchCode;
    }
    code += `else:\n${branchCode}`;
  }
  return code;
};

proto['control_if_else'] = proto['control_if'];

proto['control_repeat_until'] = function (block) {
  let code = '';
  if (this.STATEMENT_PREFIX) {
    code += this.injectId(this.STATEMENT_PREFIX, block);
  }
  const loopVarName = this.getLoopVarName();
  const branchCode = this.loopToCode(block, 'SUBSTACK', loopVarName);
  const conditionCode = this.valueToCode(block, 'CONDITION', this.ORDER_NONE) || 'False';
  code += `${loopVarName} = -1\nwhile not ${conditionCode}:\n${this.INDENT}${loopVarName} += 1\n${branchCode}`;
  return code;
};

proto['control_wait_until'] = proto['control_repeat_until'];

proto['control_while'] = function (block) {
  let code = '';
  if (this.STATEMENT_PREFIX) {
    code += this.injectId(this.STATEMENT_PREFIX, block);
  }
  const loopVarName = this.getLoopVarName();
  const branchCode = this.loopToCode(block, 'SUBSTACK', loopVarName);
  const conditionCode = this.valueToCode(block, 'CONDITION', this.ORDER_NONE) || 'False';
  code += `${loopVarName} = -1\nwhile ${conditionCode}:\n${this.INDENT}${loopVarName} += 1\n${branchCode}`;
  return code;
};

proto['control_stop'] = function (block) {
  let code = '';
  if (this.STATEMENT_PREFIX) {
    code += this.injectId(this.STATEMENT_PREFIX, block);
  }

  const stopValue = block.getFieldValue('STOP_OPTION');
  switch (stopValue) {
    case 'all':
      code += 'runtime.stop()\n';
      break;
    case 'this script':
      code += 'return\n';
      break;
    case 'other scripts in sprite':
      code += 'runtime.abort(except=func_id)\n';
      break;
  }
  return code;
};
