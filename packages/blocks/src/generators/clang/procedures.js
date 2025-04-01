import { ClangGenerator } from './generator';

const proto = ClangGenerator.prototype;

proto['argument_reporter_boolean'] = function (block) {
  const code = this.getVariableName(block.getFieldValue('VALUE'));
  return [code, this.ORDER_ATOMIC];
};

proto['argument_reporter_string_number'] = proto['argument_reporter_boolean'];

proto['argument_reporter_number'] = proto['argument_reporter_boolean'];
