import { JavaScriptGenerator } from './generator';

const proto = JavaScriptGenerator.prototype;

proto['text'] = function (block) {
  let value = block.getFieldValue('TEXT');
  // 根据输入的内容判断是否为字符串
  if (value.indexOf(' ') !== -1 || isNaN(value) || Math.abs(+value) > Number.MAX_SAFE_INTEGER) {
    value = this.quote_(value.replace(/^['"]|['"]$/g, ''));
  }
  return [value, this.ORDER_ATOMIC];
};
