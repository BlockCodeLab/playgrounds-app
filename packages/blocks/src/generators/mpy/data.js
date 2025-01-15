import { MPYGenerator } from './generator';

const proto = MPYGenerator.prototype;

proto['data_variable'] = function (block) {
  const varName = this.getVariableName(block.getFieldValue('VARIABLE'));
  return [varName, this.ORDER_ATOMIC];
};

proto['data_setvariableto'] = function (block) {
  let code = '';
  if (this.STATEMENT_PREFIX) {
    code += this.injectId(this.STATEMENT_PREFIX, block);
  }
  const varName = this.getVariableName(block.getFieldValue('VARIABLE'));
  const valueCode = this.valueToCode(block, 'VALUE', this.ORDER_NONE) || '""';
  code += `${varName} = ${valueCode}\n`;
  return code;
};

proto['data_changevariableby'] = function (block) {
  let code = '';
  if (this.STATEMENT_PREFIX) {
    code += this.injectId(this.STATEMENT_PREFIX, block);
  }
  const varName = this.getVariableName(block.getFieldValue('VARIABLE'));
  const valueCode = this.valueToCode(block, 'VALUE', this.ORDER_NONE) || 0;
  code += `${varName} = num(${varName}) + num(${valueCode})\n`;
  return code;
};

proto['data_listcontents'] = function (block) {
  const varName = `${this.getVariableName(block.getFieldValue('LIST'))}_ls`;
  return [varName, this.ORDER_ATOMIC];
};

proto['data_addtolist'] = function (block) {
  let code = '';
  if (this.STATEMENT_PREFIX) {
    code += this.injectId(this.STATEMENT_PREFIX, block);
  }
  const varName = `${this.getVariableName(block.getFieldValue('LIST'))}_ls`;
  const itemValue = this.valueToCode(block, 'ITEM', this.ORDER_NONE) || '""';
  code += `${varName}.append(${itemValue})\n`;
  return code;
};

proto['data_deleteoflist'] = function (block) {
  let code = '';
  if (this.STATEMENT_PREFIX) {
    code += this.injectId(this.STATEMENT_PREFIX, block);
  }
  const varName = `${this.getVariableName(block.getFieldValue('LIST'))}_ls`;
  const indexCode = this.valueToCode(block, 'INDEX', this.ORDER_NONE) || 1;
  code += `runtime.list(${varName}, 'remove', num(${indexCode}))\n`;
  return code;
};

proto['data_deletealloflist'] = function (block) {
  let code = '';
  if (this.STATEMENT_PREFIX) {
    code += this.injectId(this.STATEMENT_PREFIX, block);
  }
  const varName = `${this.getVariableName(block.getFieldValue('LIST'))}_ls`;
  code += `${varName} = []\n`;
  return code;
};

proto['data_insertatlist'] = function (block) {
  let code = '';
  if (this.STATEMENT_PREFIX) {
    code += this.injectId(this.STATEMENT_PREFIX, block);
  }
  const varName = `${this.getVariableName(block.getFieldValue('LIST'))}_ls`;
  const indexCode = this.valueToCode(block, 'INDEX', this.ORDER_NONE) || 1;
  const itemValue = this.valueToCode(block, 'ITEM', this.ORDER_NONE) || '""';
  code += `runtime.list(${varName}, 'insert', num(${indexCode}), ${itemValue})\n`;
  return code;
};

proto['data_replaceitemoflist'] = function (block) {
  let code = '';
  if (this.STATEMENT_PREFIX) {
    code += this.injectId(this.STATEMENT_PREFIX, block);
  }
  const varName = `${this.getVariableName(block.getFieldValue('LIST'))}_ls`;
  const indexCode = this.valueToCode(block, 'INDEX', this.ORDER_NONE) || 1;
  const itemValue = this.valueToCode(block, 'ITEM', this.ORDER_NONE) || '""';
  code += `runtime.list(${varName}, 'replace', num(${indexCode}), ${itemValue})\n`;
  return code;
};

proto['data_itemoflist'] = function (block) {
  const varName = `${this.getVariableName(block.getFieldValue('LIST'))}_ls`;
  const indexCode = this.valueToCode(block, 'INDEX', this.ORDER_NONE) || 1;
  const code = `runtime.list(${varName}, 'get', num(${indexCode}))`;
  return [code, this.ORDER_FUNCTION_CALL];
};

proto['data_itemnumoflist'] = function (block) {
  const varName = `${this.getVariableName(block.getFieldValue('LIST'))}_ls`;
  const itemValue = this.valueToCode(block, 'ITEM', this.ORDER_NONE) || 0;
  return [`(${varName}.index(${itemValue}) + 1)`, this.ORDER_NONE];
};

proto['data_lengthoflist'] = function (block) {
  const varName = `${this.getVariableName(block.getFieldValue('LIST'))}_ls`;
  return [`len(${varName})`, this.ORDER_FUNCTION_CALL];
};

proto['data_listcontainsitem'] = function (block) {
  const varName = `${this.getVariableName(block.getFieldValue('LIST'))}_ls`;
  const itemValue = this.valueToCode(block, 'ITEM', this.ORDER_NONE) || 0;
  return [`bool(${varName}.count(${itemValue}))`, this.ORDER_FUNCTION_CALL];
};
