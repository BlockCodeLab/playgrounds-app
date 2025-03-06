import { EmulatorGenerator } from './generator';

const proto = EmulatorGenerator.prototype;

const getMonitor = (input) => {
  if (input.connection) {
    const child = input.connection.targetBlock();

    if (child) {
      return {
        id: child.id,
        label: child.toString(),
        color: child.getColour(),
      };
    }
  }
};

proto['monitor_showvalue'] = function (block) {
  const monitor = getMonitor(block.getInput('VALUE'));
  if (!monitor) return '';

  let code = '';
  if (this.STATEMENT_PREFIX) {
    code += this.injectId(this.STATEMENT_PREFIX, block);
  }

  let labelCode = '""';
  if (block.getInput('LABEL')) {
    labelCode = this.valueToCode(block, 'LABEL', this.ORDER_NONE) || '""';
  }

  const valueCode = this.valueToCode(block, 'VALUE', this.ORDER_NONE) || '""';
  code += `runtime.monitorValue(`;
  code += `target.id() + '${monitor.id}', target.name(), ${labelCode}, `;
  code += `'${monitor.color}', ${valueCode});\n`;
  return code;
};

proto['monitor_shownamedvalue'] = proto['monitor_showvalue'];
