import { MPYGenerator } from './generator';

const proto = MPYGenerator.prototype;

proto['event_whenflagclicked'] = function () {
  const branchCode = this.eventToCode('start', 'runtime.flash_mode');
  return `@when_start\n${branchCode}`;
};

proto['event_whengreaterthan'] = function (block) {
  const nameValue = block.getFieldValue('WHENGREATERTHANMENU');
  const valueCode = this.valueToCode(block, 'VALUE', this.ORDER_NONE) || 0;
  const branchCode = this.eventToCode('greaterthen', 'runtime.flash_mode');
  return `@when_greaterthen("${nameValue}", num(${valueCode}))\n${branchCode}`;
};

proto['event_whenbroadcastreceived'] = function (block) {
  const messageName = this.getVariableName(block.getFieldValue('BROADCAST_OPTION'));
  const branchCode = this.eventToCode('broadcastreceived', 'runtime.flash_mode');
  return `@when_broadcastreceived("${messageName}")\n${branchCode}`;
};

proto['event_broadcast_menu'] = function (block) {
  const messageName = this.getVariableName(block.getFieldValue('BROADCAST_OPTION'));
  return [messageName, this.ORDER_ATOMIC];
};

proto['event_broadcast'] = function (block) {
  const messageName = this.valueToCode(block, 'BROADCAST_INPUT', this.ORDER_NONE) || 'message1';
  return `runtime.broadcast("${messageName}")\n`;
};

proto['event_broadcastandwait'] = function (block) {
  const messageName = this.valueToCode(block, 'BROADCAST_INPUT', this.ORDER_NONE) || 'message1';
  return `await runtime.broadcast("${messageName}", waiting=True)\n`;
};
