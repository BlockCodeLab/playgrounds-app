import { EMUGenerator } from './generator';

const proto = EMUGenerator.prototype;

proto['data_variable'] = function (block) {
  const varName = this.getVariableName(block.getFieldValue('VARIABLE'));
  return [varName, this.ORDER_CONDITIONAL];
};

proto['data_setvariableto'] = function (block) {
  let code = '';
  if (this.STATEMENT_PREFIX) {
    code += this.injectId(this.STATEMENT_PREFIX, block);
  }

  const varName = this.getVariableName(block.getFieldValue('VARIABLE'));
  const valueCode = this.valueToCode(block, 'VALUE', this.ORDER_NONE) || '""';

  code += `${varName} = ${valueCode};\n`;
  return code;
};

proto['data_changevariableby'] = function (block) {
  let code = '';
  if (this.STATEMENT_PREFIX) {
    code += this.injectId(this.STATEMENT_PREFIX, block);
  }

  const varName = this.getVariableName(block.getFieldValue('VARIABLE'));
  const valueCode = this.valueToCode(block, 'VALUE', this.ORDER_NONE) || '0';

  code += `${varName} = runtime.number(${varName}) + runtime.number(${valueCode});\n`;
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
  const itemCode = this.valueToCode(block, 'ITEM', this.ORDER_NONE) || '""';

  code += `${varName}.push(${itemCode});\n`;
  return code;
};

proto['data_deleteoflist'] = function (block) {
  let code = '';
  if (this.STATEMENT_PREFIX) {
    code += this.injectId(this.STATEMENT_PREFIX, block);
  }

  const varName = `${this.getVariableName(block.getFieldValue('LIST'))}_ls`;
  const indexCode = this.getAdjusted(block, 'INDEX');

  code += `${varName}.splice(${indexCode}, 1);\n`;
  return code;
};

proto['data_deletealloflist'] = function (block) {
  let code = '';
  if (this.STATEMENT_PREFIX) {
    code += this.injectId(this.STATEMENT_PREFIX, block);
  }
  const varName = `${this.getVariableName(block.getFieldValue('LIST'))}_ls`;

  code += `${varName}.length = 0;\n`;
  return code;
};

proto['data_insertatlist'] = function (block) {
  let code = '';
  if (this.STATEMENT_PREFIX) {
    code += this.injectId(this.STATEMENT_PREFIX, block);
  }

  const varName = `${this.getVariableName(block.getFieldValue('LIST'))}_ls`;
  const indexCode = this.getAdjusted(block, 'INDEX');
  const itemCode = this.valueToCode(block, 'ITEM', this.ORDER_NONE) || '""';

  code += `${varName}.splice(${indexCode}, 0, ${itemCode});\n`;
  return code;
};

proto['data_replaceitemoflist'] = function (block) {
  let code = '';
  if (this.STATEMENT_PREFIX) {
    code += this.injectId(this.STATEMENT_PREFIX, block);
  }

  const varName = `${this.getVariableName(block.getFieldValue('LIST'))}_ls`;
  const indexCode = this.getAdjusted(block, 'INDEX');
  const itemCode = this.valueToCode(block, 'ITEM', this.ORDER_NONE) || '""';

  code += `${varName}.splice(${indexCode}, 1, ${itemCode});\n`;
  return code;
};

proto['data_itemoflist'] = function (block) {
  const varName = `${this.getVariableName(block.getFieldValue('LIST'))}_ls`;
  const indexCode = this.getAdjusted(block, 'INDEX');
  const code = `${varName}[${indexCode}]`;
  return [code, this.ORDER_CONDITIONAL];
};

proto['data_itemnumoflist'] = function (block) {
  const varName = `${this.getVariableName(block.getFieldValue('LIST'))}_ls`;
  const itemCode = this.valueToCode(block, 'ITEM', this.ORDER_NONE) || '""';
  const code = `++${varName}.indexOf(${itemCode})`;
  return [code, this.ORDER_NONE];
};

proto['data_lengthoflist'] = function (block) {
  const varName = `${this.getVariableName(block.getFieldValue('LIST'))}_ls`;
  return [`${varName}.length`, this.ORDER_MEMBER];
};

proto['data_listcontainsitem'] = function (block) {
  const varName = `${this.getVariableName(block.getFieldValue('LIST'))}_ls`;
  const itemCode = this.valueToCode(block, 'ITEM', this.ORDER_NONE) || '""';
  const code = `${varName}.includes(${itemCode})`;
  return [code, this.ORDER_FUNCTION_CALL];
};
