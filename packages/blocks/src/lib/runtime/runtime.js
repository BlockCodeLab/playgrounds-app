import { EventEmitter } from 'node:events';
import { nanoid, sleep, sleepMs, MathUtils, getUserLanguage } from '@blockcode/utils';
import { setAppState } from '@blockcode/core';
import { MonitorTypes } from '../monitor-types';
import { AbortController } from './abort-controller';
import { Tone } from './tone';

const DefaultFPS = 60;

class EmulatorEvents extends EventEmitter {
  reset() {
    this.removeAllListeners();
  }

  emit(...args) {
    return new Promise((resolve) => {
      super.emit(...args, resolve);
    });
  }
}

export class Runtime extends EventEmitter {
  static get currentRuntime() {
    return Runtime._currentRuntime;
  }

  constructor(stage, warpMode = false) {
    super();
    Runtime._currentRuntime = this;

    // 文件库
    this._files = null;

    // 合成音乐
    this._tone = new Tone({ type: 'square' });

    // 舞台
    this._stage = stage;

    // 运行时不刷新
    this._warpMode = warpMode;

    // 运行动画
    this._running = false;

    // 运行计时
    this._timer = 0;

    // 所有定时器
    this._timers = [];

    // 所有中断控制器
    this._abortControllers = [];

    // 附加数据
    this._data = new Map();

    // 当脚本正在运行
    this._scriptRunnings = new Map();

    // 侦测阀值
    this._thresholds = new Map();

    // 监视器
    this._monitors = new Map();

    // 扩展
    this._extensions = new Map();

    this._extensionsProxy = new Proxy(
      {},
      {
        get: (_, prop) => this._extensions.values().find((ext) => ext.key === prop),
      },
    );

    // 模拟器运行事件
    this._events = new EmulatorEvents();

    // 舞台层，背景和地图
    this._backdrop = new Konva.Layer();
    stage.add(this._backdrop);

    // 绘图层，画笔绘图
    this._paint = new Konva.Layer();
    stage.add(this._paint);

    // 角色层，放置角色和克隆体
    this._sprites = new Konva.Layer();
    stage.add(this._sprites);

    // 信息层，对话框或其他信息
    this._board = new Konva.Layer();
    stage.add(this._board);

    // 绑定事件
    this.on('start', this._handleStart.bind(this));
    this.on('frame', this._updateThresholds.bind(this));
  }

  get fps() {
    return DefaultFPS;
  }

  get frameTimes() {
    return 1000 / this.fps;
  }

  get language() {
    return getUserLanguage();
  }

  get files() {
    return this._files;
  }

  get tone() {
    return this._tone;
  }

  get stage() {
    return this._stage;
  }

  get backdropLayer() {
    return this._backdrop;
  }

  get paintLayer() {
    return this._paint;
  }

  get spritesLayer() {
    return this._sprites;
  }

  get boardLayer() {
    return this._board;
  }

  get running() {
    return this._running;
  }

  get warpMode() {
    return this._warpMode;
  }

  get times() {
    return this._timer ? (Date.now() - this._timer) / 1000 : 0;
  }

  get extensions() {
    return this._extensionsProxy;
  }

  binding(files) {
    this._files = files;
  }

  reset() {
    // 正在运行
    this._running = false;

    // 运行计时
    this._timer = 0;

    // 所有定时器
    this._timers.length = 0;

    // 所有中断控制器
    this._abortControllers.length = 0;

    // 附加数据
    this._data.clear();

    // 当脚本正在运行
    this._scriptRunnings.clear();

    // 侦测阀值
    this._thresholds.clear();

    // 清空所有监视器
    this._monitors.clear();

    // 重置模拟器
    this._events.reset();
  }

  resetTimes() {
    this._timer = Date.now();
  }

  setData(key, value) {
    this._data.set(key, value);
  }

  getData(key) {
    return this._data.get(key);
  }

  hasData(key) {
    return this._data.has(key);
  }

  uid() {
    return nanoid();
  }

  createAbortController() {
    const controller = new AbortController();
    this._abortControllers.push(controller);
    return controller;
  }

  querySelector(selector) {
    return this.stage.findOne(selector);
  }

  querySelectorAll(selector) {
    return this.stage.find(selector);
  }

  async launch(code) {
    try {
      let launcher = new Function('runtime', 'MathUtils', code);
      launcher(this, MathUtils);
      launcher = null;
    } catch (err) {
      if (DEBUG) {
        console.error(err);
      }
      this.stop(true);
    }
  }

  define(...args) {
    this._events.on(...args);
  }

  when(scriptName, script) {
    let runnings = this._scriptRunnings.get(scriptName);
    if (!runnings) {
      runnings = [];
    }
    runnings.push(false);
    this._scriptRunnings.set(scriptName, runnings);

    const i = runnings.length - 1;
    this.define(`${scriptName}_${i}`, script);
  }

  whenGreaterThen(name, value, script) {
    const key = `${name}>${MathUtils.toNumber(value)}`;
    this._thresholds.set(key, false);
    this.when(`threshold:${key}`, script);
  }

  call(...args) {
    if (!this.running) return;
    return this._events.emit(...args);
  }

  run(scriptName, ...args) {
    if (!this.running) return;
    this.call(scriptName, ...args);

    // 检查脚本是否正在运行，如果已经在运行则不触发
    const runnings = this._scriptRunnings.get(scriptName);
    if (runnings?.length > 0) {
      return Promise.all(
        runnings.map(async (running, i) => {
          if (!running) {
            // 将运行中标识设为正在运行
            runnings[i] = true;
            await this.call(`${scriptName}_${i}`, ...args);
            // 因为脚本有执行时间，结束后如果没有停止则重置运行中标识
            if (this.running) {
              runnings[i] = false;
            }
          }
        }),
      );
    }
    return Promise.resolve();
  }

  _updateThresholds() {
    const keys = this._thresholds.keys();
    for (const key of keys) {
      const [name, value] = key.split('>');
      if (name === 'TIMER') {
        const isGreater = this.times > parseFloat(value);
        if (isGreater && !this._thresholds.get(key)) {
          this.run(`threshold:${key}`);
        }
        this._thresholds.set(key, isGreater);
      }
    }
  }

  async _handleStart() {
    while (this.running) {
      this.emit('frame');
      await this.nextFrame();
    }
  }

  start() {
    if (!this.stage) return;
    this._running = true;
    this.emit('start');
    this.run('start');
    this.resetTimes();
  }

  stop(force) {
    if (force || this.running) {
      this.tone.stop();
      this.emit('stop');
      this._timers.forEach(clearTimeout);
      this._abortControllers.forEach((controller) => controller.abort());
      this._running = false;
      this.reset();

      setAppState('monitors', null);
    }
  }

  sleep(signal, sec) {
    const secValue = MathUtils.toNumber(sec);

    return new Promise(async (resolve, reject) => {
      const handleAbort = () => {
        signal.off('abort', handleAbort);
        reject();
      };
      signal.once('abort', handleAbort);

      await sleep(secValue);

      signal.off('abort', handleAbort);
      resolve();
    });
  }

  nextFrame() {
    return sleepMs(this.frameTimes);
  }

  nextTick() {
    return sleepMs(0);
  }

  // 监视
  //

  _updateMonitorData(type, id, target, label, color, value) {
    this._monitors.set(id, {
      type,
      target,
      label,
      color,
      value,
    });
    setAppState('monitors', Array.from(this._monitors.values()));
  }

  // 监测数值变化
  monitorValue(id, target, label, color, value) {
    if (!this.running) return;
    this._updateMonitorData(MonitorTypes.Value, id, target, label, color, value);
  }

  // 监测数据折线图
}
