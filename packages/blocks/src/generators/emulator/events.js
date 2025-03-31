import { EmulatorGenerator } from './generator';

const proto = EmulatorGenerator.prototype;

proto['event_whenflagclicked'] = function (block) {
  let branchCode = this.statementToCode(block);
  branchCode = this.addEventTrap(branchCode, block.id);
  const code = `runtime.when('start', ${branchCode});\n`;
  return code;
};

proto['event_whengreaterthan'] = function (block) {
  const nameValue = this.quote_(block.getFieldValue('WHENGREATERTHANMENU') || 'TIMER');
  const valueCode = this.valueToCode(block, 'VALUE', this.ORDER_NONE);

  let branchCode = this.statementToCode(block);
  branchCode = this.addEventTrap(branchCode, block.id);

  const code = `runtime.whenGreaterThen(${nameValue}, ${valueCode}, ${branchCode});\n`;
  return code;
};

proto['event_whenbroadcastreceived'] = function (block) {
  const messageName = this.getVariableName(block.getFieldValue('BROADCAST_OPTION'));

  let branchCode = this.statementToCode(block);
  branchCode = this.addEventTrap(branchCode, block.id);

  const code = `runtime.when('message:${messageName}', ${branchCode});\n`;
  return code;
};

proto['event_broadcast'] = function (block) {
  const messageName = this.valueToCode(block, 'BROADCAST_INPUT', this.ORDER_NONE);
  const code = `runtime.run('message:${messageName}')\n`;
  return code;
};

proto['event_broadcastandwait'] = function (block) {
  const messageName = this.valueToCode(block, 'BROADCAST_INPUT', this.ORDER_NONE);
  const code = `await runtime.run('message:${messageName}');\n`;
  return code;
};
