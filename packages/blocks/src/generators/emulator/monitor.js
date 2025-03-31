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

  let labelCode = '""';
  if (block.getInput('LABEL')) {
    labelCode = this.valueToCode(block, 'LABEL', this.ORDER_NONE);
  }

  const valueCode = this.valueToCode(block, 'VALUE', this.ORDER_NONE);

  let code = '';
  code += `runtime.monitorValue(`;
  code += `target.id() + '${monitor.id}',`;
  code += 'target.name(),';
  code += `${labelCode},`;
  code += `'${monitor.color}',`;
  code += valueCode;
  code += ');\n';
  return code;
};

proto['monitor_shownamedvalue'] = proto['monitor_showvalue'];
