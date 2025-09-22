import { EmulatorGenerator } from './generator';

const proto = EmulatorGenerator.prototype;

proto['data_variable'] = function (block) {
  const varName = this.quote_(block.getFieldValue('VARIABLE'));
  return [`runtime.getVariable(${varName})`, this.ORDER_FUNCTION_CALL];
};

proto['data_setvariableto'] = function (block) {
  const varName = this.quote_(block.getFieldValue('VARIABLE'));
  const valueCode = this.valueToCode(block, 'VALUE', this.ORDER_NONE) || '""';
  const code = `runtime.setVariable(${varName}, ${valueCode});\n`;
  return code;
};

proto['data_changevariableby'] = function (block) {
  const varName = this.quote_(block.getFieldValue('VARIABLE'));
  const valueCode = this.valueToCode(block, 'VALUE', this.ORDER_NONE) || '0';
  const code = `runtime.incVariable(${varName}, ${valueCode});\n`;
  return code;
};

proto['showvariable'] = function (block) {
  const varId = this.quote_(block.getFieldValue('VARIABLE'));
  const code = `runtime.setMonitorVisibleById(${varId}, true);\n`;
  return code;
};

proto['hidevariable'] = function (block) {
  const varId = this.quote_(block.getFieldValue('VARIABLE'));
  const code = `runtime.setMonitorVisibleById(${varId}, false);\n`;
  return code;
};

proto['data_listcontents'] = function (block) {
  const listName = this.quote_(block.getFieldValue('LIST'));
  return [`runtime.getVariable(${listName})`, this.ORDER_FUNCTION_CALL];
};

proto['data_addtolist'] = function (block) {
  const listName = this.quote_(block.getFieldValue('LIST'));
  const itemValue = this.valueToCode(block, 'ITEM', this.ORDER_NONE) || '""';
  const code = `runtime.pushValueToList(${listName}, ${itemValue});\n`;
  return code;
};

proto['data_deleteoflist'] = function (block) {
  const listName = this.quote_(block.getFieldValue('LIST'));
  const indexCode = this.getAdjusted(block, 'INDEX');
  const code = `runtime.delValueFromList(${listName}, ${indexCode});\n`;
  return code;
};

proto['data_deletealloflist'] = function (block) {
  const listName = this.quote_(block.getFieldValue('LIST'));
  const code = `runtime.delAllFromList(${listName});\n`;
  return code;
};

proto['data_insertatlist'] = function (block) {
  const listName = this.quote_(block.getFieldValue('LIST'));
  const indexCode = this.getAdjusted(block, 'INDEX');
  const itemValue = this.valueToCode(block, 'ITEM', this.ORDER_NONE) || '""';
  const code = `runtime.insertValueToList(${listName}, ${indexCode}, ${itemValue});\n`;
  return code;
};

proto['data_replaceitemoflist'] = function (block) {
  const listName = this.quote_(block.getFieldValue('LIST'));
  const indexCode = this.getAdjusted(block, 'INDEX');
  const itemValue = this.valueToCode(block, 'ITEM', this.ORDER_NONE) || '""';
  const code = `runtime.setValueToList(${listName}, ${indexCode}, ${itemValue});\n`;
  return code;
};

proto['data_itemoflist'] = function (block) {
  const listName = this.quote_(block.getFieldValue('LIST'));
  const indexCode = this.getAdjusted(block, 'INDEX');
  const code = `runtime.getValueFromList(${listName}, ${indexCode})`;
  return [code, this.ORDER_FUNCTION_CALL];
};

proto['data_itemnumoflist'] = function (block) {
  const listName = this.quote_(block.getFieldValue('LIST'));
  const itemValue = this.valueToCode(block, 'ITEM', this.ORDER_NONE) || 0;
  const code = `runtime.findValueFromList(${listName}, ${itemValue})`;
  return [code, this.ORDER_FUNCTION_CALL];
};

proto['data_lengthoflist'] = function (block) {
  const listName = this.quote_(block.getFieldValue('LIST'));
  const code = `runtime.getLengthOfList(${listName})`;
  return [code, this.ORDER_FUNCTION_CALL];
};

proto['data_listcontainsitem'] = function (block) {
  const listName = this.quote_(block.getFieldValue('LIST'));
  const itemValue = this.valueToCode(block, 'ITEM', this.ORDER_NONE) || 0;
  const code = `!!runtime.findValueFromList(${listName}, ${itemValue})`;
  return [code, this.ORDER_FUNCTION_CALL];
};
