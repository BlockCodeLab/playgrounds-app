import { PythonGenerator } from './generator';

const proto = PythonGenerator.prototype;

proto['event_broadcast_menu'] = function (block) {
  const code = this.quote_(this.getVariableName(block.getFieldValue('BROADCAST_OPTION')));
  return [code, this.ORDER_ATOMIC];
};
