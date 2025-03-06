import { JavaScriptGenerator } from './generator';

const proto = JavaScriptGenerator.prototype;

proto['math_number'] = function (block) {
  let code = parseFloat(block.getFieldValue('NUM'));
  let order;
  if (code === Infinity) {
    code = 'Infinity';
    order = this.ORDER_FUNCTION_CALL;
  } else if (code === -Infinity) {
    code = '-Infinity';
    order = this.ORDER_UNARY_SIGN;
  } else if (Number.isNaN(code)) {
    code = 'NaN';
    order = this.ORDER_UNARY_SIGN;
  } else {
    order = code < 0 ? this.ORDER_UNARY_SIGN : this.ORDER_ATOMIC;
  }
  return [code, order];
};

proto['math_integer'] = function (block) {
  const code = parseInt(block.getFieldValue('NUM'));
  const order = code < 0 ? this.ORDER_UNARY_SIGN : this.ORDER_ATOMIC;
  return [code, order];
};

proto['math_whole_number'] = function (block) {
  const code = Math.abs(parseInt(block.getFieldValue('NUM')));
  return [code, this.ORDER_ATOMIC];
};

proto['math_positive_number'] = function (block) {
  let code = parseFloat(block.getFieldValue('NUM'));
  let order;
  if (code === Infinity) {
    code = 'Infinity';
    order = this.ORDER_FUNCTION_CALL;
  } else if (code === -Infinity) {
    code = '-Infinity';
    order = this.ORDER_FUNCTION_CALL;
  } else if (Number.isNaN(code)) {
    code = 'NaN';
    order = this.ORDER_FUNCTION_CALL;
  } else {
    code = code < 0 ? 0 : code;
    order = this.ORDER_ATOMIC;
  }
  return [code, order];
};

proto['math_angle'] = function (block) {
  let code = parseFloat(block.getFieldValue('NUM'));
  let order;
  if (code == Infinity) {
    code = 'Infinity';
    order = this.ORDER_FUNCTION_CALL;
  } else if (code == -Infinity) {
    code = '-Infinity';
    order = this.ORDER_UNARY_SIGN;
  } else {
    code = code % 360;
    code = code < 0 ? code + 360 : code;
    order = this.ORDER_ATOMIC;
  }
  return [code, order];
};
