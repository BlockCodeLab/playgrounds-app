import { PythonGenerator } from '../python';

export class MPYGenerator extends PythonGenerator {
  constructor() {
    super('MPY');
  }

  init(workspace) {
    super.init(workspace);

    // 导入默认支持库
    this.definitions_['import_blocks'] = 'from blocks import *';

    // 获取用户定义
    this.onDefinitions?.();

    // 导入时间库，必须在用户定义之后，防止被覆盖
    this.definitions_['import_time'] = 'import time';

    // 获取变量定义
    if (this.onVariableDefinitions) {
      delete this.definitions_['variables'];
      this.onVariableDefinitions(workspace);
    }
  }

  // 将事件积木转为代码
  eventToCode(name, flash, ...args) {
    const eventName = this.getProcedureName(name);
    let funcCode = '';
    funcCode += `async def ${eventName}(${args.join(',')}):\n`;
    funcCode += `${this.INDENT}func_id = f"{__name__}.${eventName}"\n`; // 用于停止其他脚本时过滤需要停止的脚本
    funcCode += `${this.INDENT}flash_mode = ${flash}\n`;
    funcCode += `${this.INDENT}force_wait = time.ticks_ms()\n`;
    funcCode += `${this.INDENT}render_mode = False\n`;
    funcCode += this.PASS;
    return funcCode;
  }

  // 循环机制
  loopToCode(block, name) {
    let branchCode = this.statementToCode(block, name) || this.PASS;
    branchCode += `${this.INDENT}if time.ticks_diff(time.ticks_ms(), force_wait) < 500:\n`; // 防止死循环，等待下一帧
    branchCode += `${this.INDENT}${this.INDENT}if flash_mode:\n`;
    branchCode += `${this.INDENT}${this.INDENT}${this.INDENT}continue\n`;
    branchCode += `${this.INDENT}${this.INDENT}if not render_mode:\n`;
    branchCode += `${this.INDENT}${this.INDENT}${this.INDENT}await runtime.next_tick()\n`;
    branchCode += `${this.INDENT}${this.INDENT}${this.INDENT}continue\n`;
    branchCode += `${this.INDENT}await runtime.next_frame()\n`;
    branchCode += `${this.INDENT}force_wait = time.ticks_ms()\n`;
    branchCode += `${this.INDENT}render_mode = False\n`;
    return branchCode;
  }
}
