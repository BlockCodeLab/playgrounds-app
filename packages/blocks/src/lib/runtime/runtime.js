import { EventEmitter } from 'node:events';
import { nanoid, sleep, sleepMs, MathUtils, getUserLanguage } from '@blockcode/utils';
import { setAppState, setMeta } from '@blockcode/core';
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
  static get MonitorMode() {
    return {
      Monitor: 0, // 只显示数值
      Label: 1, // 带标签显示
    };
  }

  static get currentRuntime() {
    return Runtime._currentRuntime;
  }

  constructor(stage, warpMode = false) {
    super();
    Runtime._currentRuntime = this;

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

    // 监视器
    this._monitors = {};

    // 附加数据
    this._data = new Map();

    // 当脚本正在运行
    this._scriptRunnings = new Map();

    // 侦测阀值
    this._thresholds = new Map();

    // 扩展
    this._extensions = new Map();

    this._extensionsProxy = new Proxy(
      {},
      {
        get: (_, prop) => this._extensions.get(prop),
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

  get monitors() {
    return this._monitors;
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

  // 变量和列表
  //
  // 设置变量值
  setVariable(name, value) {
    if (!this.running) return;
    this.setData(name, value);
    this.setMonitorValueById(name, value);
  }

  // 获取变量值
  getVariable(name) {
    return this.getData(name);
  }

  // 增加变量值
  incVariable(name, value) {
    const oldValue = MathUtils.toNumber(this.getVariable(name));
    const addValue = MathUtils.toNumber(value);
    this.setVariable(name, oldValue + addValue);
  }

  // 向列表尾添加值
  pushValueToList(name, value) {
    const list = this.getVariable(name);
    if (Array.isArray(list)) {
      list.push(value);
      this.setVariable(name, list);
    }
  }

  // 向列表添加值
  insertValueToList(name, index, value) {
    const list = this.getVariable(name);
    if (Array.isArray(list)) {
      list.splice(index, 0, value);
      this.setVariable(name, list);
    }
  }

  setValueToList(name, index, value) {
    const list = this.getVariable(name);
    if (Array.isArray(list)) {
      list[index] = value;
      this.setVariable(name, list);
    }
  }

  delAllFromList(name) {
    const list = this.getVariable(name);
    if (Array.isArray(list)) {
      list.length = 0;
      this.setVariable(name, list);
    }
  }

  delValueFromList(name, index) {
    const list = this.getVariable(name);
    if (Array.isArray(list)) {
      list.splice(index, 1);
      this.setVariable(name, list);
    }
  }

  getValueFromList(name, index) {
    const list = this.getVariable(name);
    if (Array.isArray(list)) {
      return list[index] ?? '';
    }
    return '';
  }

  getLengthOfList(name) {
    const list = this.getVariable(name);
    if (Array.isArray(list)) {
      return list.length;
    }
    return 0;
  }

  findValueFromList(name, value) {
    const list = this.getVariable(name);
    if (Array.isArray(list)) {
      const index = list.indexOf(value);
      if (index === -1) return 0;
      return MathUtils.indexToSerial(index, list.length);
    }
    return 0;
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
    // 更新计时器监测
    this.setMonitorValueById('sensing_timer', this.times);
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

  // 更新监测
  updateMonitors(newMonitors) {
    this._monitors = newMonitors;
    if (!this.monitors) return;

    let x = -this.stage.width() / 2 + 10;
    let y = this.stage.height() / 2 - 10;
    let maxWidth = 0;
    for (const monitor of this.monitors) {
      const labelId = monitor.groupId !== 'data' ? btoa(`${monitor.groupId}.${monitor.id}`) : btoa(monitor.id);
      let monitorLabel = this.boardLayer.findOne(`#${labelId}`);
      if (!monitorLabel) {
        const label = new Konva.Label({
          id: labelId,
          scaleY: this.stage.scaleY(),
          opacity: 0.9,
          draggable: true,
          x: monitor.x ?? x,
          y: monitor.y ?? y,
          monitor,
        });
        label.add(
          new Konva.Tag({
            fill: monitor.color,
            cornerRadius: 5,
          }),
        );
        label.add(
          new Konva.Text({
            fontFamily: 'Helvetica',
            fontSize: monitor.mode === Runtime.MonitorMode.Monitor ? 12 : 16,
            padding: 4,
            fill: 'white',
            text:
              monitor.mode === Runtime.MonitorMode.Monitor
                ? (monitor.name ? `${monitor.name}: ` : '') + `${monitor.label}: 0`
                : '0',
          }),
        );
        // 拖拽改动位置
        label.on('dragend', () => {
          const monitors = this.monitors;
          const monitor = label.getAttr('monitor');
          monitor.x = label.x();
          monitor.y = label.y();
          const index = monitors.findIndex((m) => m.groupId === monitor.groupId && m.id === monitor.id);
          monitors[index] = monitor;
          setMeta({ monitors });
        });
        // 单击改变样式
        label.on('pointerclick', () => {
          const monitors = this.monitors;
          const monitor = label.getAttr('monitor');
          monitor.mode = (monitor.mode + 1) % 2;
          const index = monitors.findIndex((m) => m.groupId === monitor.groupId && m.id === monitor.id);
          monitors[index] = monitor;
          setMeta({ monitors });
          this.setMonitorValue(label);
        });
        // 可见性改变
        label.on('visibleChange', ({ newVal }) => {
          const monitors = this.monitors;
          const monitor = label.getAttr('monitor');
          if (monitor.visible !== newVal) {
            monitor.visible = newVal;
            const index = monitors.findIndex((m) => m.groupId === monitor.groupId && m.id === monitor.id);
            monitors[index] = monitor;
            setMeta({ monitors });
          }
        });
        this.boardLayer.add(label);
        monitorLabel = label;
      }
      monitorLabel.setAttrs({
        visible: monitor.visible,
        label: monitor.label,
        monitor,
      });
      this.setMonitorValue(monitorLabel);
      maxWidth = monitorLabel.width() > maxWidth ? monitorLabel.width() : maxWidth;
      y -= 24;
      if (y < -this.stage.height() / 2 + 30) {
        y = 110;
        x += Math.round(maxWidth + 3);
      }
    }
  }

  setMonitorValue(label, value = 0) {
    if (label) {
      const monitor = label.getAttr('monitor');
      if (monitor.mode === Runtime.MonitorMode.Monitor) {
        label.getText().setAttrs({
          fontSize: 12,
          text: (monitor.name ? `${monitor.name}: ` : '') + `${monitor.label}: ${value}`,
        });
      } else {
        label.getText().setAttrs({
          fontSize: 16,
          text: `${value}`,
        });
      }
    }
  }

  setMonitorValueById(id, value) {
    const label = this.boardLayer.findOne(`#${btoa(id)}`);
    this.setMonitorValue(label, value);
  }

  setMonitorVisible(label, visible) {
    label?.setVisible?.(visible);
  }

  setMonitorVisibleById(id, visible) {
    const label = this.boardLayer.findOne(`#${btoa(id)}`);
    this.setMonitorVisible(label, visible);
  }
}
