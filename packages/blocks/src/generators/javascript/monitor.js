import { JavaScriptGenerator } from './generator';

const proto = JavaScriptGenerator.prototype;

proto['monitor_debug'] = function (block) {
  let code = '';
  if (this.STATEMENT_PREFIX) {
    code += this.injectId(this.STATEMENT_PREFIX, block);
  }
  if (DEBUG) {
    const valueCode = this.valueToCode(block, 'VALUE', this.ORDER_NONE) || '';
    code += `console.log(${valueCode.replace(/^[\"\']/, '').replace(/[\"\']$/, '')});\n`;
  }
  return code;
};
