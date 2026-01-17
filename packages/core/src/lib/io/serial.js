import { EventEmitter } from 'node:events';

const encoder = new TextEncoder();

export class Serial extends EventEmitter {
  constructor(port) {
    super();
    this._port = port;
    this._reader = null;
    port._serial = this;
    this._port.ondisconnect = () => {
      this.emit('disconnect', new Error('Unexpectedly disconnected'));
    };
    this.setMaxListeners(0);
  }

  get port() {
    return this._port;
  }

  dispose() {
    this.close().then(() => {
      this._port = null;
    });
  }

  getInfo() {
    return this.port.getInfo();
  }

  async readLoop() {
    try {
      const { value, done } = await this._reader.read();
      if (value) {
        this.emit('data', value);
      }
      if (done) {
        this._reader.releaseLock();
      } else {
        this.readLoop();
      }
    } catch (err) {
      this.emit('error', err);
    }
  }

  async open(options) {
    try {
      await this.port.open(options);
    } catch (err) {
      this.emit('error', err);
      this.close();
    }

    this._reader = this.port.readable.getReader();
    this.emit('connect');
    this.readLoop();
  }

  async close(enableEvent = true) {
    if (enableEvent) {
      this.emit('disconnect');
    }
    try {
      await this._reader?.cancel();
      await this.port.close();
    } catch (err) {
      this.emit('error', err);
    }
    this._reader = null;
  }

  async write(data, encoding = 'text') {
    const writer = this.port.writable.getWriter();
    data = encoding === 'text' ? encoder.encode(data) : data;
    try {
      await writer.write(data);
      writer.releaseLock();
    } catch (err) {
      this.emit('error', err);
    }
  }

  setSignals(options) {
    this.port.setSignals(options);
  }
}
