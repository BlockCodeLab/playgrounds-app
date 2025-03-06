import { ScratchBlocks } from '../../lib/scratch-blocks';
import { MicroPythonGenerator } from './generator';

const proto = MicroPythonGenerator.prototype;

proto['procedures_definition'] = function (block) {
  const myBlock = block.childBlocks_[0];
  const procName = this.getProcedureName(myBlock.getProcCode(), ScratchBlocks.Procedures.NAME_TYPE);
  const args = myBlock.childBlocks_.map((argBlock) => this.getVariableName(argBlock.getFieldValue('VALUE')));
  const branchCode = this.eventToCode('procedure', 'runtime.flash_mode', ...args);
  return `@when_procedure("${procName}")\n${branchCode}`;
};

proto['procedures_call'] = function (block) {
  const procName = this.getProcedureName(block.getProcCode(), ScratchBlocks.Procedures.NAME_TYPE);
  const args = block.argumentIds_.map((arg) => this.valueToCode(block, arg, this.ORDER_NONE));
  const argsCode = args.length > 0 ? `, ${args.join(', ')}` : '';
  return `await runtime.procedure_call("${procName}"${argsCode})\n`;
};
