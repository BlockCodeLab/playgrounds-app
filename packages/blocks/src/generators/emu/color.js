import { EMUGenerator } from './generator';

const proto = EMUGenerator.prototype;

proto['colour_picker'] = function (block) {
  const code = this.quote_(block.getFieldValue('COLOUR'));
  return [code, this.ORDER_ATOMIC];
};
