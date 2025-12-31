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

  open(options) {
    return this.port
      .open(options)
      .then(() => {
        const reader = this.port.readable.getReader();
        const readLoop = () => {
          reader
            .read()
            .then(({ value, done }) => {
              if (value) {
                this.emit('data', value);
              }
              if (done) {
                reader.releaseLock();
              } else {
                readLoop();
              }
            })
            .catch((err) => {
              this.emit('error', err);
            });
        };
        this._reader = reader;
        this.emit('connect');
        readLoop();
      })
      .catch((err) => {
        this.emit('error', err);
        this.close();
        throw err;
      });
  }

  close(enableEvent = true) {
    if (enableEvent) {
      this.emit('disconnect');
    }
    return new Promise((resolve, reject) => {
      if (this._reader) {
        this._reader
          .cancel()
          .then(() => this.port.close())
          .then(resolve)
          .catch((err) => {
            this.emit('error', err);
            reject(err);
          });
      } else {
        this.port
          .close()
          .then(resolve)
          .catch((err) => {
            this.emit('error', err);
            reject();
          });
      }
      this._reader = null;
    });
  }

  write(data, encoding = 'text') {
    return new Promise((resolve) => {
      const writer = this.port.writable.getWriter();
      data = encoding === 'text' ? encoder.encode(data) : data;
      writer
        .write(data)
        .then(() => {
          writer.releaseLock();
          resolve();
        })
        .catch((err) => {
          this.emit('error', err);
        });
    });
  }

  setSignals(options) {
    this.port.setSignals(options);
  }
}
