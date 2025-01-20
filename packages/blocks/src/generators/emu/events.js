import { EMUGenerator } from './generator';

const proto = EMUGenerator.prototype;

proto['event_whenflagclicked'] = function () {
  return `runtime.when('start', ${this.HAT_CALLBACK});\n`;
};

proto['event_whengreaterthan'] = function (block) {
  const nameValue = block.getFieldValue('WHENGREATERTHANMENU');
  const valueCode = this.valueToCode(block, 'VALUE', this.ORDER_NONE) || '10';
  return `runtime.whenGreaterThen('${nameValue}', ${valueCode}, ${this.HAT_CALLBACK});\n`;
};

proto['event_whenbroadcastreceived'] = function (block) {
  const messageName = this.getVariableName(block.getFieldValue('BROADCAST_OPTION'));
  return `runtime.when('message:${messageName}', ${this.HAT_CALLBACK});\n`;
};

proto['event_broadcast_menu'] = function (block) {
  const messageName = this.getVariableName(block.getFieldValue('BROADCAST_OPTION'));
  return [messageName, this.ORDER_ATOMIC];
};

proto['event_broadcast'] = function (block) {
  let code = '';
  if (this.STATEMENT_PREFIX) {
    code += this.injectId(this.STATEMENT_PREFIX, block);
  }
  const messageName = this.valueToCode(block, 'BROADCAST_INPUT', this.ORDER_NONE) || 'message1';
  code += `runtime.run('message:${messageName}')\n`;
  return code;
};

proto['event_broadcastandwait'] = function (block) {
  let code = '';
  if (this.STATEMENT_PREFIX) {
    code += this.injectId(this.STATEMENT_PREFIX, block);
  }
  const messageName = this.valueToCode(block, 'BROADCAST_INPUT', this.ORDER_NONE) || 'message1';
  code += `await runtime.run('message:${messageName}');\n`;
  return code;
};
