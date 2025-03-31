import { ScratchBlocks } from '../../lib/scratch-blocks';
import { MicroPythonGenerator } from './generator';

const proto = MicroPythonGenerator.prototype;

proto['procedures_definition'] = function (block) {
  const myBlock = block.childBlocks_[0];
  const funcName = this.getFunctionName(myBlock.getProcCode());
  const args = myBlock.childBlocks_.map((argBlock) => this.getVariableName(argBlock.getFieldValue('VALUE')));

  let branchCode = this.statementToCode(block);
  branchCode = this.addEventTrap(branchCode, block.id);

  let code = '';
  code += `@when_procedure("procedure:${funcName}")\n`;
  code += `def ${funcName}(${args.join(', ')}):\n`;
  code += branchCode;
};

proto['procedures_call'] = function (block) {
  const funcName = this.getFunctionName(myBlock.getProcCode());
  const args = block.argumentIds_.map((arg) => this.valueToCode(block, arg, this.ORDER_NONE));
  const argsCode = args.length > 0 ? `, ${args.join(', ')}` : '';
  const code = `await runtime.procedure_call("procedure:${funcName}"${argsCode})\n`;
  return code;
};
