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
    let code = '';
    code += `async def ${eventName}(${args.join(',')}):\n`;
    code += `${this.INDENT}func_id = f"{__name__}.${eventName}"\n`; // 用于停止其他脚本时过滤需要停止的脚本
    code += `${this.INDENT}flash_mode = ${flash}\n`;
    code += `${this.INDENT}force_wait = time.ticks_ms()\n`;
    code += `${this.INDENT}render_mode = False\n`;
    code += this.PASS;
    return code;
  }

  loopToCode(block, name) {
    let code = '';
    // 等待帧渲染
    code += `${this.INDENT}if render_mode and not flash_mode:\n`;
    code += `${this.INDENT}${this.INDENT}await runtime.next_frame()\n`;
    code += `${this.INDENT}${this.INDENT}force_wait = time.ticks_ms()\n`;
    code += `${this.INDENT}${this.INDENT}render_mode = False\n`;
    // 循环代码
    code += this.statementToCode(block, name) || `${this.INDENT}await runtime.next_tick()\n`;
    // 防止死循环
    code += `${this.INDENT}loop_times = time.ticks_diff(time.ticks_ms(), force_wait)\n`;
    code += `${this.INDENT}if (not render_mode and not flash_mode) or loop_times > 300:\n`;
    code += `${this.INDENT}${this.INDENT}await runtime.next_tick()\n`;
    code += `${this.INDENT}${this.INDENT}force_wait = time.ticks_ms()\n`;
    return code;
  }
}
