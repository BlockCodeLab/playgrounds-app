import { MPYGenerator } from './generator';

const proto = MPYGenerator.prototype;

proto['text'] = function (block) {
  const code = this.quote_(block.getFieldValue('TEXT'));
  return [code, this.ORDER_ATOMIC];
};
