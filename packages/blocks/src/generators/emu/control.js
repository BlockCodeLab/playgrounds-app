import { EMUGenerator } from './generator';

const proto = EMUGenerator.prototype;

proto['control_wait'] = function (block) {
  let code = '';
  if (this.STATEMENT_PREFIX) {
    code += this.injectId(this.STATEMENT_PREFIX, block);
  }
  const durationCode = this.valueToCode(block, 'DURATION', this.ORDER_NONE) || '0';
  code += `await runtime.sleep(signal, ${durationCode});\n`;
  return code;
};

proto['control_repeat'] = function (block) {
  let code = '';
  if (this.STATEMENT_PREFIX) {
    code += this.injectId(this.STATEMENT_PREFIX, block);
  }

  let branchCode = this.loopToCode(block, 'SUBSTACK') || '';
  if (this.STATEMENT_SUFFIX) {
    branchCode = this.prefixLines(this.injectId(this.STATEMENT_SUFFIX, block), this.INDENT) + branchCode;
  }
  const timesCode = this.valueToCode(block, 'TIMES', this.ORDER_NONE) || '0';

  code += `for (let _ = 0; _ < MathUtils.toNumber(${timesCode}); _++) {\n${branchCode}}\n`;
  return code;
};

proto['control_forever'] = function (block) {
  let code = '';
  if (this.STATEMENT_PREFIX) {
    code += this.injectId(this.STATEMENT_PREFIX, block);
  }

  let branchCode = this.loopToCode(block, 'SUBSTACK') || '';
  if (this.STATEMENT_SUFFIX) {
    branchCode = this.prefixLines(this.injectId(this.STATEMENT_SUFFIX, block), this.INDENT) + branchCode;
  }

  code += `while (true) {\n${branchCode}}\n`;
  return code;
};

proto['control_if'] = function (block) {
  let code = '';
  if (this.STATEMENT_PREFIX) {
    code += this.injectId(this.STATEMENT_PREFIX, block);
  }

  let branchCode = this.statementToCode(block, 'SUBSTACK') || '';
  if (this.STATEMENT_SUFFIX) {
    branchCode = this.prefixLines(this.injectId(this.STATEMENT_SUFFIX, block), this.INDENT) + branchCode;
  }

  const conditionCode = this.valueToCode(block, 'CONDITION', this.ORDER_NONE) || 'false';
  code += `if (${conditionCode}) {\n${branchCode}}\n`;

  // else branch.
  if (block.getInput('SUBSTACK2')) {
    branchCode = this.statementToCode(block, 'SUBSTACK2') || '';
    if (this.STATEMENT_SUFFIX) {
      branchCode = this.prefixLines(this.injectId(this.STATEMENT_SUFFIX, block), this.INDENT) + branchCode;
    }
    code += `else {\n${branchCode}}\n`;
  }
  return code;
};

proto['control_if_else'] = proto['control_if'];

proto['control_repeat_until'] = function (block) {
  let code = '';
  if (this.STATEMENT_PREFIX) {
    code += this.injectId(this.STATEMENT_PREFIX, block);
  }

  let branchCode = this.loopToCode(block, 'SUBSTACK') || '';
  if (this.STATEMENT_SUFFIX) {
    branchCode = this.prefixLines(this.injectId(this.STATEMENT_SUFFIX, block), this.INDENT) + branchCode;
  }
  const conditionCode = this.valueToCode(block, 'CONDITION', this.ORDER_NONE) || 'true';

  code += `while (!(${conditionCode})) {\n${branchCode}}\n`;
  return code;
};

proto['control_wait_until'] = proto['control_repeat_until'];

proto['control_while'] = function (block) {
  let code = '';
  if (this.STATEMENT_PREFIX) {
    code += this.injectId(this.STATEMENT_PREFIX, block);
  }

  let branchCode = this.loopToCode(block, 'SUBSTACK') || '';
  if (this.STATEMENT_SUFFIX) {
    branchCode = this.prefixLines(this.injectId(this.STATEMENT_SUFFIX, block), this.INDENT) + branchCode;
  }
  const conditionCode = this.valueToCode(block, 'CONDITION', this.ORDER_NONE) || 'false';

  code += `while (${conditionCode}) {\n${branchCode}}\n`;
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
      code += 'runtime.stop();\n';
      break;
    case 'this script':
      code += `signal.off('abort', handleAbort);\n`;
      code += 'return resolve();\n';
      break;
    case 'other scripts in sprite':
      code += 'controller.abort(funcId);\n';
      code += 'await runtime.nextFrame();\n';
      break;
  }
  return code;
};
