import { PythonGenerator } from './generator';

const proto = PythonGenerator.prototype;

proto['monitor_debug'] = function (block) {
  let code = '';
  if (DEBUG) {
    const valueCode = this.valueToCode(block, 'VALUE', this.ORDER_NONE) || '';
    code += `print(${valueCode.replace(/^[\"\']/, '').replace(/[\"\']$/, '')})\n`;
  }
  return code;
};
