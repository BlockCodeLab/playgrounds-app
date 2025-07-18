import { MicroPythonGenerator } from './generator';

const proto = MicroPythonGenerator.prototype;

proto['operator_add'] = function (block) {
  const num1Code = this.valueToCode(block, 'NUM1', this.ORDER_NONE) || 0;
  const num2Code = this.valueToCode(block, 'NUM2', this.ORDER_NONE) || 0;
  const code = `(num(${num1Code}) + num(${num2Code}))`;
  return [code, this.ORDER_SUBTRACTION];
};

proto['operator_subtract'] = function (block) {
  const num1Code = this.valueToCode(block, 'NUM1', this.ORDER_NONE) || 0;
  const num2Code = this.valueToCode(block, 'NUM2', this.ORDER_NONE) || 0;
  const code = `(num(${num1Code}) - num(${num2Code}))`;
  return [code, this.ORDER_SUBTRACTION];
};

proto['operator_multiply'] = function (block) {
  const num1Code = this.valueToCode(block, 'NUM1', this.ORDER_NONE) || 0;
  const num2Code = this.valueToCode(block, 'NUM2', this.ORDER_NONE) || 0;
  const code = `(num(${num1Code}) * num(${num2Code}))`;
  return [code, this.ORDER_SUBTRACTION];
};

proto['operator_divide'] = function (block) {
  const num1Code = this.valueToCode(block, 'NUM1', this.ORDER_NONE) || 0;
  const num2Code = this.valueToCode(block, 'NUM2', this.ORDER_NONE) || 0;
  const code = `(num(${num1Code}) / num(${num2Code}))`;
  return [code, this.ORDER_SUBTRACTION];
};

proto['operator_random'] = function (block) {
  const minCode = this.valueToCode(block, 'FROM', this.ORDER_NONE) || 0;
  const maxCode = this.valueToCode(block, 'TO', this.ORDER_NONE) || 0;
  const code = `runtime.random(${minCode}, ${maxCode})`;
  return [code, this.ORDER_FUNCTION_CALL];
};

// >
proto['operator_gt'] = function (block) {
  const operand1Code = this.valueToCode(block, 'OPERAND1', this.ORDER_NONE) || 0;
  const operand2Code = this.valueToCode(block, 'OPERAND2', this.ORDER_NONE) || 0;
  const code = `(num(${operand1Code}) > num(${operand2Code}))`;
  return [code, this.ORDER_RELATIONAL];
};

// >=
proto['operator_gte'] = function (block) {
  const operand1Code = this.valueToCode(block, 'OPERAND1', this.ORDER_NONE) || 0;
  const operand2Code = this.valueToCode(block, 'OPERAND2', this.ORDER_NONE) || 0;
  const code = `(num(${operand1Code}) >= num(${operand2Code}))`;
  return [code, this.ORDER_RELATIONAL];
};

// <
proto['operator_lt'] = function (block) {
  const operand1Code = this.valueToCode(block, 'OPERAND1', this.ORDER_NONE) || 0;
  const operand2Code = this.valueToCode(block, 'OPERAND2', this.ORDER_NONE) || 0;
  const code = `(num(${operand1Code}) < num(${operand2Code}))`;
  return [code, this.ORDER_RELATIONAL];
};

// <=
proto['operator_lte'] = function (block) {
  const operand1Code = this.valueToCode(block, 'OPERAND1', this.ORDER_NONE) || 0;
  const operand2Code = this.valueToCode(block, 'OPERAND2', this.ORDER_NONE) || 0;
  const code = `(num(${operand1Code}) <= num(${operand2Code}))`;
  return [code, this.ORDER_RELATIONAL];
};

proto['operator_equals'] = function (block) {
  const operand1Code = this.valueToCode(block, 'OPERAND1', this.ORDER_NONE) || 0;
  const operand2Code = this.valueToCode(block, 'OPERAND2', this.ORDER_NONE) || 0;
  const code = `runtime.equals(${operand1Code}, ${operand2Code})`;
  return [code, this.ORDER_FUNCTION_CALL];
};

proto['operator_notequals'] = function (block) {
  const operand1Code = this.valueToCode(block, 'OPERAND1', this.ORDER_NONE) || 0;
  const operand2Code = this.valueToCode(block, 'OPERAND2', this.ORDER_NONE) || 0;
  const code = `(not runtime.equals(${operand1Code}, ${operand2Code}))`;
  return [code, this.ORDER_FUNCTION_CALL];
};

proto['operator_and'] = function (block) {
  const operand1Code = this.valueToCode(block, 'OPERAND1', this.ORDER_NONE) || 'False';
  const operand2Code = this.valueToCode(block, 'OPERAND2', this.ORDER_NONE) || 'False';
  const code = `(${operand1Code} and ${operand2Code})`;
  return [code, this.ORDER_LOGICAL_AND];
};

proto['operator_or'] = function (block) {
  const operand1Code = this.valueToCode(block, 'OPERAND1', this.ORDER_NONE) || 'False';
  const operand2Code = this.valueToCode(block, 'OPERAND2', this.ORDER_NONE) || 'False';
  const code = `(${operand1Code} or ${operand2Code})`;
  return [code, this.ORDER_LOGICAL_OR];
};

proto['operator_not'] = function (block) {
  const operandValue = this.valueToCode(block, 'OPERAND', this.ORDER_NONE) || 'False';
  const code = `(not ${operandValue})`;
  return [code, this.ORDER_LOGICAL_NOT];
};

proto['operator_join'] = function (block) {
  const string1Code = this.valueToCode(block, 'STRING1', this.ORDER_NONE) || '""';
  const string2Code = this.valueToCode(block, 'STRING2', this.ORDER_NONE) || '""';
  const code = `(str(${string1Code}) + str(${string2Code}))`;
  return [code, this.ORDER_ATOMIC];
};

proto['operator_letter_of'] = function (block) {
  const letterValue = this.valueToCode(block, 'LETTER', this.ORDER_NONE) || 1;
  const stringValue = this.valueToCode(block, 'STRING', this.ORDER_NONE) || '""';
  const code = `runtime.list(str(${stringValue}), 'get', num(${letterValue}))`;
  return [code, this.ORDER_FUNCTION_CALL];
};

proto['operator_length'] = function (block) {
  const stringValue = this.valueToCode(block, 'STRING', this.ORDER_NONE) || '""';
  const code = `len(str(${stringValue}))`;
  return [code, this.ORDER_FUNCTION_CALL];
};

proto['operator_contains'] = function (block) {
  const string1Code = this.valueToCode(block, 'STRING1', this.ORDER_NONE) || '""';
  const string2Code = this.valueToCode(block, 'STRING2', this.ORDER_NONE) || '""';
  const code = `(str(${string1Code}).count(str(${string2Code})) > 0)`;
  return [code, this.ORDER_FUNCTION_CALL];
};

proto['operator_mod'] = function (block) {
  const num1Code = this.valueToCode(block, 'NUM1', this.ORDER_NONE) || 0;
  const num2Code = this.valueToCode(block, 'NUM2', this.ORDER_NONE) || 0;
  const code = `(num(${num1Code}) % num(${num2Code}))`;
  return [code, this.ORDER_MODULUS];
};

proto['operator_round'] = function (block) {
  this.definitions_['import_math'] = 'import math';
  const numCode = this.valueToCode(block, 'NUM', this.ORDER_NONE) || 0;
  const code = `math.round(num(${numCode}))`;
  return [code, this.ORDER_FUNCTION_CALL];
};

proto['operator_mathop'] = function (block) {
  this.definitions_['import_math'] = 'import math';
  const numCode = this.valueToCode(block, 'NUM', this.ORDER_NONE) || 0;
  const operatorValue = block.getFieldValue('OPERATOR');
  let code = '';
  if (operatorValue === 'ceiling') {
    code += `math.ceil(num(${numCode}))`;
  } else if (operatorValue === 'sin' || operatorValue === 'cos' || operatorValue === 'tan') {
    code += `math.${operatorValue}(math.radians(num(${numCode})))`;
  } else if (operatorValue === 'asin' || operatorValue === 'acos' || operatorValue === 'atan') {
    code += `math.degrees(math.${operatorValue}(num(${numCode})))`;
  } else if (operatorValue === 'ln') {
    code += `(math.log(num(${numCode}))`;
  } else if (operatorValue === 'log') {
    code += `(math.log10(num(${numCode}))`;
  } else if (operatorValue === 'e ^') {
    code += `math.exp(num(${numCode}))`;
  } else if (operatorValue === '10 ^') {
    code += `math.pow(10, num(${numCode}))`;
  } else if (operatorValue === 'abs') {
    code += `abs(num(${numCode}))`;
  } else {
    code += `math.${operatorValue}(num(${numCode}))`;
  }
  return [code, this.ORDER_FUNCTION_CALL];
};
