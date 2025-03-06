import { MicroPythonGenerator } from './generator';

const proto = MicroPythonGenerator.prototype;

proto['monitor_showvalue'] = () => '';
proto['monitor_shownamedvalue'] = proto['monitor_showvalue'];
