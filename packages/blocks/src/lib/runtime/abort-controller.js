import { EventEmitter } from 'node:events';

class AbortSignal extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(0);
  }
}

// 用于停止脚本时中断运行中的函数
export class AbortController {
  constructor() {
    this._signal = new AbortSignal();
  }

  get signal() {
    return this._signal;
  }

  abort(reason) {
    this.signal.emit('abort', reason);
  }
}
