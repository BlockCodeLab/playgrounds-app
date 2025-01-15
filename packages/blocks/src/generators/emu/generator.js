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
    code += '  const handleAbort = (skipId) => {\n';
    code += '    if (funcId === skipId) return;\n';
    code += `    signal.off('abort', handleAbort);\n`;
    code += '    handleAbort.stopped = true;\n';
    code += `    resolve();\n`;
    code += '  };\n';
    code += `  signal.once('abort', handleAbort);\n`;
    code += '  let forceSync = Date.now()\n'; // 强制帧同步（避免死循环）
    // 真正积木脚本
    code += '  /* 用户脚本开始 */\n/* hatcode */  /* 用户脚本结束 */\n';
    // 完成脚本
    code += `  signal.off('abort', handleAbort);\n`;
    code += '  resolve();\n';
    code += '}).then(done).catch(done);\n';
    code += '}';
    return code;
  }

  get NEXT_LOOP() {
    let code = '';
    code += '  /* 等待帧同步 */\n';
    code += '  if (handleAbort.stopped) return;\n';
    code += '  if (warpMode && Date.now() - forceSync < 300) continue;\n'; // 跳过帧同步
    code += '  await runtime.nextFrame();\n';
    code += '  forceSync = Date.now();\n';
    return code;
  }
}
