import { JavaScriptGenerator } from '../javascript';

export class EMUGenerator extends JavaScriptGenerator {
  constructor() {
    super('EMU');
  }

  init(workspace) {
    super.init(workspace);

    // 中断运行控制
    this.definitions_['abort_controller'] = '';
    this.definitions_['abort_controller'] += 'const controller = runtime.createAbortController();\n';
    this.definitions_['abort_controller'] += 'const signal = controller.signal;';

    // 获取用户定义
    this.onDefinitions?.();

    // 获取变量定义
    if (this.onVariableDefinitions) {
      delete this.definitions_['variables'];
      this.onVariableDefinitions(workspace);
    }
  }

  get HAT_CALLBACK() {
    let code = '';
    code += '(done) => {\n';
    code += 'const funcId = runtime.uid();\n'; // 用于检查是否满足函数中断控制的条件
    code += 'const warpMode = runtime.warpMode;\n'; // 是否跳过请求屏幕刷新
    code += 'return new Promise(async (resolve) => {\n';
    // 中断函数控制
    code += `${this.INDENT}const handleAbort = (skipId) => {\n`;
    code += `${this.INDENT}${this.INDENT}if (funcId === skipId) return;\n`;
    code += `${this.INDENT}${this.INDENT}signal.off('abort', handleAbort);\n`;
    code += `${this.INDENT}${this.INDENT}handleAbort.stopped = true;\n`;
    code += `${this.INDENT}${this.INDENT}resolve();\n`;
    code += `${this.INDENT}};\n`;
    code += `${this.INDENT}signal.once('abort', handleAbort);\n`;
    code += `${this.INDENT}let forceWait = Date.now()\n`; // 强制等待（避免死循环）
    code += `${this.INDENT}let renderMode = false;\n`; // 渲染模式，当需要渲染时设为 true
    // 真正积木脚本
    code += `${this.INDENT}/* 用户脚本开始 */\n`;
    code += `/* hatcode */`;
    code += `${this.INDENT}/* 用户脚本结束 */\n`;
    // 完成脚本
    code += `${this.INDENT}signal.off('abort', handleAbort);\n`;
    code += `${this.INDENT}resolve();\n`;
    code += '}).then(done).catch(done);\n';
    code += '}';
    return code;
  }

  // 循环机制
  loopToCode(block, name) {
    let code = '';
    // 等待帧渲染
    code += `${this.INDENT}if (renderMode && !warpMode) {\n`;
    code += `${this.INDENT}${this.INDENT}await runtime.nextFrame();\n`;
    code += `${this.INDENT}${this.INDENT}forceWait = Date.now();\n`;
    code += `${this.INDENT}${this.INDENT}renderMode = false;\n`;
    code += `${this.INDENT}}\n`;
    // 循环代码
    code += this.statementToCode(block, name) || '';
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
