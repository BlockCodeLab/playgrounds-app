import { EventEmitter } from 'node:events';
import fileHex from './FirmataExpress.ino.hex';
import { ArduinoBle } from './arduinoBle';

export class BleSerialPort extends EventEmitter {
  constructor(server) {
    super();
    this._ble = new ArduinoBle();
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

  async init(server){
    await this._ble.init(server);
  }

  connect() {
    this._ble.requestPort();
  }

  disconnect() {
    this._ble.disconnect();
  }

  async write(data, callback) {
    console.log('send: ' + new Uint8Array(data));
    await this._ble.sendSerialMessageWithResp(data);
    callback();
  }

  async flash(file) {
    await this._ble.sendATMessage('AT+BAUD=4');
    await this._ble.flash(file);
    await new Promise((resolve) => {setTimeout(resolve, 100) });
    await this._ble.sendATMessage('AT+BAUD=3');
    await this._ble.sendATMessage('AT+BLEUSB=3');
    await new Promise((resolve) => { setTimeout(resolve, 100) });
  }

  async flashHex() {
    const res = await fetch(fileHex);
    const buffer = await res.arrayBuffer();
    await this.flash(buffer);
  }
}
