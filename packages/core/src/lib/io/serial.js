import { EventEmitter } from 'node:events';

const encoder = new TextEncoder();

export class Serial extends EventEmitter {
  constructor(port) {
    super();
    this._port = port;
    this._reader = null;
    port._serial = this;
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

  open(options) {
    return new Promise((resolve, reject) => {
      this.port
        .open(options)
        .then(() => {
          const readLoop = () => {
            this._reader = this.port.readable.getReader();
            this._reader
              .read()
              .then(({ value, done }) => {
                this._reader.releaseLock();
                if (value) {
                  this.emit('data', value);
                }
                if (done) {
                  // disconnect
                } else {
                  readLoop();
                }
              })
              .catch((/* err */) => {
                this.emit('disconnect');
              });
          };
          readLoop();
          this.emit('connect');
          resolve();
        })
        .catch(reject);
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      if (this._reader) {
        this._reader
          .cancel()
          .then(() => this.port.close())
          .then(resolve)
          .catch(reject);
      } else {
        this._reader = null;
        this.port.close().then(resolve).catch(reject);
      }
    });
  }

  write(data, encoding = 'text') {
    return new Promise((resolve, reject) => {
      const writer = this.port.writable.getWriter();
      data = encoding === 'text' ? encoder.encode(data) : data;
      writer.write(encoder.encode(data)).then(resolve).catch(reject);
      writer.releaseLock();
    });
  }
}
