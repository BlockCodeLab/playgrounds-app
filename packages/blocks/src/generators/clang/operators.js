import { ClangGenerator } from './generator';

const proto = ClangGenerator.prototype;

proto['operator_add'] = function (block) {
  const num1Code = this.valueToCode(block, 'NUM1', this.ORDER_NONE) || '0';
  const num2Code = this.valueToCode(block, 'NUM2', this.ORDER_NONE) || '0';
  const code = `(MathUtils.toNumber(${num1Code}) + MathUtils.toNumber(${num2Code}))`;
  return [code, this.ORDER_SUBTRACTION];
};

proto['operator_subtract'] = function (block) {
  const num1Code = this.valueToCode(block, 'NUM1', this.ORDER_NONE) || '0';
  const num2Code = this.valueToCode(block, 'NUM2', this.ORDER_NONE) || '0';
  const code = `(MathUtils.toNumber(${num1Code}) - MathUtils.toNumber(${num2Code}))`;
  return [code, this.ORDER_ADDITION];
};

proto['operator_multiply'] = function (block) {
  const num1Code = this.valueToCode(block, 'NUM1', this.ORDER_NONE) || '0';
  const num2Code = this.valueToCode(block, 'NUM2', this.ORDER_NONE) || '0';
  const code = `(MathUtils.toNumber(${num1Code}) * MathUtils.toNumber(${num2Code}))`;
  return [code, this.ORDER_MULTIPLICATION];
};

proto['operator_divide'] = function (block) {
  const num1Code = this.valueToCode(block, 'NUM1', this.ORDER_NONE) || '0';
  const num2Code = this.valueToCode(block, 'NUM2', this.ORDER_NONE) || '0';
  const code = `(MathUtils.toNumber(${num1Code}) / MathUtils.toNumber(${num2Code}))`;
  return [code, this.ORDER_DIVISION];
};

proto['operator_random'] = function (block) {
  const minValue = this.valueToCode(block, 'FROM', this.ORDER_NONE) || '0';
  const maxValue = this.valueToCode(block, 'TO', this.ORDER_NONE) || '0';
  const code = `MathUtils.random(${minValue}, ${maxValue})`;
  return [code, this.ORDER_FUNCTION_CALL];
};

// >
proto['operator_gt'] = function (block) {
  const operand1Code = this.valueToCode(block, 'OPERAND1', this.ORDER_NONE) || '0';
  const operand2Code = this.valueToCode(block, 'OPERAND2', this.ORDER_NONE) || '0';
  const code = `(MathUtils.toNumber(${operand1Code}) > MathUtils.toNumber(${operand2Code}))`;
  return [code, this.ORDER_RELATIONAL];
};

// >=
proto['operator_gte'] = function (block) {
  const operand1Code = this.valueToCode(block, 'OPERAND1', this.ORDER_NONE) || '0';
  const operand2Code = this.valueToCode(block, 'OPERAND2', this.ORDER_NONE) || '0';
  const code = `(MathUtils.toNumber(${operand1Code}) >= MathUtils.toNumber(${operand2Code}))`;
  return [code, this.ORDER_RELATIONAL];
};

// <
proto['operator_lt'] = function (block) {
  const operand1Code = this.valueToCode(block, 'OPERAND1', this.ORDER_NONE) || '0';
  const operand2Code = this.valueToCode(block, 'OPERAND2', this.ORDER_NONE) || '0';
  const code = `(MathUtils.toNumber(${operand1Code}) < MathUtils.toNumber(${operand2Code}))`;
  return [code, this.ORDER_RELATIONAL];
};

// <=
proto['operator_lte'] = function (block) {
  const operand1Code = this.valueToCode(block, 'OPERAND1', this.ORDER_NONE) || '0';
  const operand2Code = this.valueToCode(block, 'OPERAND2', this.ORDER_NONE) || '0';
  const code = `(MathUtils.toNumber(${operand1Code}) <= MathUtils.toNumber(${operand2Code}))`;
  return [code, this.ORDER_RELATIONAL];
};

proto['operator_equals'] = function (block) {
  const operand1Code = this.valueToCode(block, 'OPERAND1', this.ORDER_NONE) || '0';
  const operand2Code = this.valueToCode(block, 'OPERAND2', this.ORDER_NONE) || '0';
  const code = `(${operand1Code} == ${operand2Code})`;
  return [code, this.ORDER_RELATIONAL];
};

proto['operator_notequals'] = function (block) {
  const operand1Code = this.valueToCode(block, 'OPERAND1', this.ORDER_NONE) || '0';
  const operand2Code = this.valueToCode(block, 'OPERAND2', this.ORDER_NONE) || '0';
  const code = `(${operand1Code} != ${operand2Code})`;
  return [code, this.ORDER_RELATIONAL];
};

proto['operator_and'] = function (block) {
  const operand1Code = this.valueToCode(block, 'OPERAND1', this.ORDER_NONE) || '0';
  const operand2Code = this.valueToCode(block, 'OPERAND2', this.ORDER_NONE) || '0';
  const code = `(${operand1Code} && ${operand2Code})`;
  return [code, this.ORDER_LOGICAL_AND];
};

proto['operator_or'] = function (block) {
  const operand1Code = this.valueToCode(block, 'OPERAND1', this.ORDER_NONE) || '0';
  const operand2Code = this.valueToCode(block, 'OPERAND2', this.ORDER_NONE) || '0';
  const code = `(${operand1Code} || ${operand2Code})`;
  return [code, this.ORDER_LOGICAL_OR];
};

proto['operator_not'] = function (block) {
  const operandValue = this.valueToCode(block, 'OPERAND', this.ORDER_NONE) || '0';
  const code = `!(${operandValue})`;
  return [code, this.ORDER_LOGICAL_NOT];
};

proto['operator_join'] = function (block) {
  const string1Value = this.valueToCode(block, 'STRING1', this.ORDER_NONE) || '""';
  const string2Value = this.valueToCode(block, 'STRING2', this.ORDER_NONE) || '""';
  const code = `(String(${string1Value}) + String(${string2Value}))`;
  return [code, this.ORDER_ATOMIC];
};

proto['operator_letter_of'] = function (block) {
  const stringValue = this.valueToCode(block, 'STRING', this.ORDER_NONE) || '""';
  const letterValue = this.getAdjusted(block, 'LETTER');
  const code = `String(${stringValue})[${letterValue}]`;
  return [code, this.ORDER_FUNCTION_CALL];
};

proto['operator_length'] = function (block) {
  const stringValue = this.valueToCode(block, 'STRING', this.ORDER_NONE) || '""';
  const code = `String(${stringValue}).length`;
  return [code, this.ORDER_MEMBER];
};

proto['operator_contains'] = function (block) {
  const string1Value = this.valueToCode(block, 'STRING1', this.ORDER_NONE) || '""';
  const string2Value = this.valueToCode(block, 'STRING2', this.ORDER_NONE) || '""';
  const code = `String(${string1Value}).includes(String(${string2Value}))`;
  return [code, this.ORDER_FUNCTION_CALL];
};

proto['operator_mod'] = function (block) {
  const num1Code = this.valueToCode(block, 'NUM1', this.ORDER_NONE) || '0';
  const num2Code = this.valueToCode(block, 'NUM2', this.ORDER_NONE) || '0';
  const code = `(MathUtils.toNumber(${num1Code}) % MathUtils.toNumber(${num2Code}))`;
  return [code, this.ORDER_MODULUS];
};

proto['operator_round'] = function (block) {
  const numCode = this.valueToCode(block, 'NUM', this.ORDER_NONE) || '0';
  const code = `Math.round(MathUtils.toNumber(${numCode}))`;
  return [code, this.ORDER_FUNCTION_CALL];
};

proto['operator_mathop'] = function (block) {
  const numCode = this.valueToCode(block, 'NUM', this.ORDER_NONE) || '0';
  const operatorValue = block.getFieldValue('OPERATOR');
  let code = '';
  if (operatorValue === 'ceiling') {
    code += `Math.ceil(MathUtils.toNumber(${numCode}))`;
  } else if (operatorValue === 'sin' || operatorValue === 'cos' || operatorValue === 'tan') {
    code += `Math.${operatorValue}(Math.PI * MathUtils.toNumber(${numCode}) / 180)`;
  } else if (operatorValue === 'asin' || operatorValue === 'acos' || operatorValue === 'atan') {
    code += `(Math.${operatorValue}(MathUtils.toNumber(${numCode})) * 180 / Math.PI)`;
  } else if (operatorValue === 'ln') {
    code += `Math.log(MathUtils.toNumber(${numCode}))`;
  } else if (operatorValue === 'log') {
    code += `Math.log10(MathUtils.toNumber(${numCode}))`;
  } else if (operatorValue === 'e ^') {
    code += `Math.exp(MathUtils.toNumber(${numCode}))`;
  } else if (operatorValue === '10 ^') {
    code += `Math.pow(10, MathUtils.toNumber(${numCode}))`;
  } else {
    code += `Math.${operatorValue}(MathUtils.toNumber(${numCode}))`;
  }
  return [code, this.ORDER_FUNCTION_CALL];
};
