import { PythonGenerator } from './generator';

const proto = PythonGenerator.prototype;

proto['argument_reporter_boolean'] = function (block) {
  const code = this.getVariableName(block.getFieldValue('VALUE'));
  return [code, this.ORDER_ATOMIC];
};

proto['argument_reporter_string_number'] = proto['argument_reporter_boolean'];
