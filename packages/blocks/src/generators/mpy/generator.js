import { ScratchBlocks } from '../../lib/scratch-blocks';
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

    // 获取变量定义
    if (this.onVariableDefinitions) {
      delete this.definitions_['variables'];
      this.onVariableDefinitions(workspace);
    }
  }

  // 获取循环临时变量名
  getLoopVarName() {
    const count = ++this.loopVarCount_;
    const varName = `_${count}_`;
    return varName;
  }

  // 将事件积木转为代码
  eventToCode(name, flash, ...args) {
    const eventName = this.getProcedureName(name);
    let funcCode = '';
    funcCode += `async def ${eventName}(${args.join(',')}):\n`;
    funcCode += `${this.INDENT}func_id = f"{__name__}.${eventName}"\n`; // 用于停止其他脚本时过滤需要停止的脚本
    funcCode += `${this.INDENT}flash_mode = ${flash}\n`;
    funcCode += this.PASS;
    return funcCode;
  }

  // 循环机制
  loopToCode(block, name, loopVarName = '_') {
    let branchCode = this.statementToCode(block, name) || this.PASS;
    if (this.STATEMENT_SUFFIX) {
      branchCode = this.prefixLines(this.injectId(this.STATEMENT_SUFFIX, block), this.INDENT) + branchCode;
    }
    branchCode += `${this.INDENT}if not flash_mode or ${loopVarName} % 10 == 9:\n`; // 防止卡死异步任务，每循环10次强制等待
    branchCode += `${this.INDENT}${this.INDENT}await runtime.next_frame()\n`;
    return branchCode;
  }
}
