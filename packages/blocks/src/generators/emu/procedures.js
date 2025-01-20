import { ScratchBlocks } from '../../lib/scratch-blocks';
import { EMUGenerator } from './generator';

const proto = EMUGenerator.prototype;

proto['procedures_definition'] = function (block) {
  const myBlock = block.childBlocks_[0];
  const funcName = this.getVariableName(myBlock.getProcCode(), ScratchBlocks.Procedures.NAME_TYPE);
  const args = myBlock.childBlocks_.map((argBlock) => this.getVariableNameargBlock.getFieldValue('VALUE'));
  args.push('done');

  let code = '';
  code += `async function (${args.join(', ')}) {\n`;
  code += `let warpMode = ${myBlock.warp_};\n`; // 是否跳过请求屏幕刷新
  code += 'let forceTimes = Date.now()\n'; // 强制屏幕刷新（避免死循环）
  code += 'abort = false;\n'; // 重新激活，全局中断标识
  code += 'do {\n';
  // 利用循环的 break，随时取消代码执行
  // 真正积木脚本
  code += '/* hatcode */';
  // 单次循环
  code += '} while (false)\n';
  code += 'done();\n';
  code += '}';
  return `runtime.define('procedure:${funcName}', ${code});\n`;
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
