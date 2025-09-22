import { ScratchBlocks } from '../../lib/scratch-blocks';
import { JavaScriptGenerator } from '../javascript';

export class EmulatorGenerator extends JavaScriptGenerator {
  constructor() {
    super('EMU');
  }

  init(workspace) {
    super.init(workspace);

    // 中断运行控制
    this.definitions_['abort_controller'] = 'const controller = runtime.createAbortController();';
    this.definitions_['abort_signal'] = 'const signal = controller.signal;';

    // 获取用户定义
    this.onDefinitions?.();

    // 获取用户变量定义
    if (this.onVariableDefinitions) {
      this.onVariableDefinitions(workspace);
      return;
    }

    // 默认变量定义
    const defvars = [];
    const variables = workspace.getAllVariables();
    for (let i = 0; i < variables.length; i++) {
      const variable = variables[i];
      if (variable.type === ScratchBlocks.BROADCAST_MESSAGE_VARIABLE_TYPE) {
        continue;
      }

      // 全部和局部变量
      const varName = variable.getId();
      let varValue = '0';
      if (variable.type === ScratchBlocks.LIST_VARIABLE_TYPE) {
        varValue = '[]';
      } else if (variable.type === ScratchBlocks.DICTIONARY_VARIABLE_TYPE) {
        varValue = '{}';
      }
      defvars.push(`runtime.setVariable('${varName}', ${varValue})`);
    }

    if (defvars.length) {
      this.definitions_['variables'] = defvars.join('\n');
    }
  }

  // 检查孤立积木
  check_(block) {
    return block?.startHat_ || block?.parentBlock_;
  }

  addEventTrap(branchCode, id) {
    let code = '';
    code += '(done) => {\n';
    code += `const funcId = ${this.quote_(id)};\n`; // 用于检查是否满足函数中断控制的条件
    code += 'const warpMode = runtime.warpMode;\n'; // 是否跳过请求屏幕刷新
    code += 'return new Promise(async (resolve) => {\n';
    code += `${this.INDENT}let forceWait = Date.now();\n`; // 强制等待（避免死循环）
    code += `${this.INDENT}let renderMode = false;\n`; // 渲染模式，当需要渲染时设为 true
    // 中断函数控制
    code += `${this.INDENT}const handleAbort = (skipId) => {\n`;
    code += `${this.INDENT}${this.INDENT}if (funcId === skipId) return;\n`;
    code += `${this.INDENT}${this.INDENT}signal.off('abort', handleAbort);\n`;
    code += `${this.INDENT}${this.INDENT}handleAbort.stopped = true;\n`;
    code += `${this.INDENT}${this.INDENT}resolve();\n`;
    code += `${this.INDENT}};\n`;
    code += `${this.INDENT}signal.once('abort', handleAbort);\n`;
    // 用户积木脚本
    code += branchCode;
    // 完成脚本
    code += `${this.INDENT}signal.off('abort', handleAbort);\n`;
    code += `${this.INDENT}resolve();\n`;
    code += '}).then(done).catch(done);\n';
    code += '}';
    return code;
  }

  addLoopTrap(branchCode, id) {
    let code = '';
    // 等待帧渲染
    code += `${this.INDENT}if (renderMode && !warpMode) {\n`;
    code += `${this.INDENT}${this.INDENT}await runtime.nextFrame();\n`;
    code += `${this.INDENT}${this.INDENT}forceWait = Date.now();\n`;
    code += `${this.INDENT}${this.INDENT}renderMode = false;\n`;
    code += `${this.INDENT}}\n`;
    // 循环代码
    code += super.addLoopTrap(branchCode, id);
    // 退出循环
    code += `${this.INDENT}if (handleAbort.stopped) break;\n`;
    // 防止死循环
    code += `${this.INDENT}if ((!renderMode && !warpMode) || Date.now() - forceWait > 300) {\n`;
    code += `${this.INDENT}${this.INDENT}await runtime.nextTick();\n`;
    code += `${this.INDENT}${this.INDENT}forceWait = Date.now();\n`;
    code += `${this.INDENT}}\n`;
    return code;
  }
}
