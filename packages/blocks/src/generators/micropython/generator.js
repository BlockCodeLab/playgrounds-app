import { PythonGenerator } from '../python';

export class MicroPythonGenerator extends PythonGenerator {
  constructor() {
    super('MPY');
  }

  init(workspace) {
    super.init(workspace);

    // 获取用户定义
    this.onDefinitions?.();

    // 获取变量定义
    if (this.onVariableDefinitions) {
      delete this.definitions_['variables'];
      this.onVariableDefinitions(workspace);
    }
  }

  onDefinitions() {
    // 导入默认支持库
    this.definitions_['import_time'] = 'import time';
    this.definitions_['import_asyncio'] = 'import asyncio';

    // 全局变量
    this.definitions_['asyncio_coros'] = '_coros__ = []';
    this.definitions_['asyncio_tasks'] = '_tasks__ = []';
    this.definitions_['running_times'] = '_times__ = time.ticks_ms()';
  }

  // 将事件积木转为代码
  eventToCode(name, flash, ...args) {
    const eventName = this.getProcedureName(name);
    let code = '';
    return code;
  }

  // 将循环积木转为代码
  loopToCode(block, name) {
    let code = '';
    return code;
  }
}
