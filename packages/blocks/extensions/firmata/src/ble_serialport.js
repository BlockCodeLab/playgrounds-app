import { EventEmitter } from 'node:events';
import fileHex from './FirmataTest.hex';

export class BleSerialPort extends EventEmitter {
  constructor(ble) {
    super();
    this._ble = ble;
    this._ble.on('close', (event) => {
      this.emit('close', event);
    });
    this._ble.on('open', (event) => {
      this.emit('open', event);
    });
    this._ble.on('error', (event) => {
      this.emit('error', event);
    });
    this._ble.on('data', (event) => {
      this.emit('data', event);
    });
  }

  connect() {
    this._ble.requestPort();
  }

  disConnect() {
    this._ble.disConnect();
  }

  async write(data, callback) {
    console.log(`send: ${data}`);
    await this._ble.sendSerialMessageWithResp(data);
    callback();
  }

  async flash(file) {
    await this._ble.flash(file);
  }

  async flashHex() {
    const res = await fetch(fileHex);
    const buffer = await res.arrayBuffer();
    await this.flash(buffer);
  }
}
