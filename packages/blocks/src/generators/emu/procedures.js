import { ScratchBlocks } from '../../lib/scratch-blocks';
import { EMUGenerator } from './generator';

const proto = EMUGenerator.prototype;

proto['procedures_definition'] = function (block) {
  const myBlock = block.childBlocks_[0];
  const funcName = this.getVariableName(myBlock.getProcCode(), ScratchBlocks.Procedures.NAME_TYPE);
  const args = myBlock.childBlocks_.map((argBlock) => this.getVariableName(argBlock.getFieldValue('VALUE')));
  args.push('done');

  let funcCode = this.HAT_CALLBACK;
  funcCode = funcCode.replace('(done) => {\n', `(${args.join(', ')}) => {\n`);
  funcCode = funcCode.replace('= runtime.warpMode;\n', `= ${myBlock.warp_};\n`);
  return `runtime.define('procedure:${funcName}', ${funcCode});\n`;
};

proto['procedures_call'] = function (block) {
  const funcName = this.getVariableName(block.getProcCode(), ScratchBlocks.Procedures.NAME_TYPE);
  const args = block.argumentIds_.map((arg) => this.valueToCode(block, arg, this.ORDER_NONE));
  const argsCode = args.length > 0 ? `, ${args.join(', ')}` : '';

  let code = '';
  code += `await runtime.call('procedure:${funcName}'${argsCode});\n`;
  return code;
};

proto['argument_reporter_boolean'] = function (block) {
  const code = this.getVariableName(block.getFieldValue('VALUE'));
  return [code, this.ORDER_ATOMIC];
};

proto['argument_reporter_string_number'] = function (block) {
  const code = this.getVariableName(block.getFieldValue('VALUE'));
  return [code, this.ORDER_ATOMIC];
};
