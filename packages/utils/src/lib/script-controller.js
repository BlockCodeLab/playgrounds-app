import { EventEmitter } from 'node:events';

const userscripts = [];

export class ScriptController {
  static clear() {
    userscripts.length = 0;
  }

  static abortAll() {
    userscripts.forEach((p) => p.abort());
    ScriptController.clear();
  }

  constructor() {
    this._signal = new EventEmitter();
    this._signal.setMaxListeners(0);
    userscripts.push(this);
  }

  get signal() {
    return this._signal;
  }

  abort() {
    this.abortSkip();
  }

  abortSkip(userscriptId) {
    this.signal.emit('abort', userscriptId);
  }

  execute(userscript, ...args) {
    return new Promise(async (resolve) => {
      const abort = (id) => {
        if (id === userscript.id) return;
        userscript.aborted = true;
        this.signal.off('abort', abort);
        resolve();
      };
      this.signal.once('abort', abort);
      await userscript(...args);
      this.signal.off('abort', abort);
      resolve();
    });
  }
}
