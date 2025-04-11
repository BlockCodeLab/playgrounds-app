import { sleepMs } from '@blockcode/utils';
import { Serial } from '@blockcode/core';
import { bufferEqual } from '../lib/buffer-equal';
import { mergeUint8Arrays } from '../lib/merge-uint8-arrays';
import { BLESerial } from './ble-serial';

// STK500 协议常量
const Resp_STK_INSYNC = 0x14;
const Resp_STK_OK = 0x10;
const Cmnd_STK_GET_SYNC = 0x30;
const Cmnd_STK_SET_DEVICE = 0x42;
const Cmnd_STK_ENTER_PROGMODE = 0x50;
const Cmnd_STK_LOAD_ADDRESS = 0x55;
const STK_UNIVERSAL = 0x56;
const Cmnd_STK_PROG_PAGE = 0x64;
const Cmnd_STK_LEAVE_PROGMODE = 0x51;
const Cmnd_STK_READ_SIGN = 0x75;
const Sync_CRC_EOP = 0x20;
const Resp_STK_NOSYNC = 0x15;
const Cmnd_STK_READ_PAGE = 0x74;
const OK_RESPONSE = [Resp_STK_INSYNC, Resp_STK_OK];

const USB_VENDOR_ID = 9025;
const BLE_SERVICE_UUID = '0000ffe0-0000-1000-8000-00805f9b34fb';

const BLE_CHUNK_SIZE = 60;
const PAGE_SIZE = 128;
const BAUD_RATE = 57600;

export class ArduinoBoard {
  static fromPort(port) {
    const board = new ArduinoBoard();
    if (port._serial) {
      board._setSerial(port._serial);
    } else {
      board._setSerial(new Serial(port));
    }
    return board;
  }

  constructor() {
    this._serial = null;
    this._timeout = 5000;
    this._connected = false;
  }

  get type() {
    return 'serial';
  }

  get timeout() {
    return this._timeout;
  }

  set timeout(timeout) {
    this._timeout = timeout;
  }

  get serial() {
    return this._serial;
  }

  _setSerial(serial) {
    this._serial = serial;
    this.serial.on('connect', () => (this._connected = true));
    this.serial.on('disconnect', () => (this._connected = false));
  }

  requestPort() {
    const filters = [{ usbVendorId: USB_VENDOR_ID }];
    return navigator.serial.requestPort({ filters }).then((port) => {
      if (port._serial) {
        this._setSerial(port._serial);
      } else {
        this._setSerial(new Serial(port));
      }
    });
  }

  connect(options = {}) {
    return new Promise((resolve, reject) => {
      if (this.serial) {
        this.serial
          .open({
            baudRate: BAUD_RATE,
            ...options,
          })
          .then(resolve)
          .catch((err) => {
            if (err.name === 'InvalidStateError') {
              this._connected = true;
              return resolve();
            }
            reject(err);
          });
      } else {
        reject(new Error('No device specified'));
      }
    });
  }

  get connected() {
    return this._connected;
  }

  disconnect() {
    return this.serial.close();
  }

  get deviceInfo() {
    return this.serial.getInfo();
  }

  readUntil(ending, dataConsumer) {
    return new Promise((resolve, reject) => {
      const queue = [];
      const fn = (data) => {
        if (data) {
          for (let i = 0; i < data.length; i++) {
            queue.push(data[i]);
          }
          dataConsumer?.(data);
        }
        if (bufferEqual(ending, queue)) {
          clearTimeout(this._timer);
          this.serial.off('data', fn);
          resolve(queue);
        }
      };

      this._timer = setTimeout(() => {
        this.serial.off('data', fn);
        reject(new Error('Timeout waiting for response'));
      }, this.timeout);

      this.serial.on('data', fn);
    });
  }

  writeAndReadUntil(cmd, expect, dataConsumer) {
    return new Promise(async (resolve, reject) => {
      if (expect) {
        this.readUntil(expect, dataConsumer).then(resolve).catch(reject);
      }
      await this.serial.write(cmd, 'binary');
      await sleepMs(10);
      if (!expect) {
        resolve();
      }
    });
  }

  async getSync() {
    const syncReq = new Uint8Array([Cmnd_STK_GET_SYNC, Sync_CRC_EOP]);
    const okResp = new Uint8Array(OK_RESPONSE);
    const out = await this.writeAndReadUntil(syncReq, okResp);
    if (!out) {
      Promise.reject(new Error('stk500 sync error'));
    }
    return out;
  }

  async enterProgMode() {
    const enterProgModeReq = new Uint8Array([Cmnd_STK_ENTER_PROGMODE, Sync_CRC_EOP]);
    const okResp = new Uint8Array(OK_RESPONSE);
    const out = await this.writeAndReadUntil(enterProgModeReq, okResp);
    if (!out) {
      Promise.reject(new Error('stk500 enter progmode error'));
    }
    return out;
  }

  async leaveProgMode() {
    const leaveProgModeReq = new Uint8Array([Cmnd_STK_LEAVE_PROGMODE, Sync_CRC_EOP]);
    const okResp = new Uint8Array(OK_RESPONSE);
    const out = await this.writeAndReadUntil(leaveProgModeReq, okResp);
    if (!out) {
      Promise.reject(new Error('stk500 leave progmode error'));
    }
    return out;
  }

  async getUniversal() {
    const universalReq = new Uint8Array([STK_UNIVERSAL, 172, 128, 0, 0, Sync_CRC_EOP]);
    const universalResp = new Uint8Array([Resp_STK_INSYNC, 0, Resp_STK_OK]);
    const out = await this.writeAndReadUntil(universalReq, universalResp);
    if (!out) {
      Promise.reject(new Error('stk500 universal error'));
    }
    return out;
  }

  async loadAddress(useaddr) {
    const addr_low = useaddr & 0xff;
    const addr_high = (useaddr >> 8) & 0xff;
    const cmd = new Uint8Array([Cmnd_STK_LOAD_ADDRESS, addr_low, addr_high, Sync_CRC_EOP]);
    const okResp = new Uint8Array(OK_RESPONSE);
    const out = await this.writeAndReadUntil(cmd, okResp);
    if (!out) {
      Promise.reject(new Error('stk500 load address error'));
    }
    return out;
  }

  async loadPage(bytes) {
    const bytes_low = bytes.length & 0xff;
    const bytes_high = bytes.length >> 8;
    const cmd = mergeUint8Arrays(
      new Uint8Array([Cmnd_STK_PROG_PAGE, bytes_high, bytes_low, 0x46]),
      bytes,
      new Uint8Array([Sync_CRC_EOP]),
    );
    const okResp = new Uint8Array(OK_RESPONSE);
    const out = await this.writeAndReadUntil(cmd, okResp);
    if (!out) {
      Promise.reject(new Error('stk500 load page error'));
    }
    return out;
  }

  async upload(data, progress = function () {}) {
    let pageAddr = 0;
    while (pageAddr < data.length) {
      const useaddr = pageAddr >> 1;
      await this.loadAddress(useaddr);
      const bytes = data.slice(pageAddr, Math.min(pageAddr + PAGE_SIZE, data.length));
      await this.loadPage(bytes);
      pageAddr = pageAddr + bytes.length;
      progress(parseInt((pageAddr / data.length) * 100));
      await sleepMs(4);
    }
    progress(100);
  }

  async put(data, progress) {
    // 重新以 115200 速率连接
    await this.disconnect();
    await this.connect({ baudRate: 115200 });
    await sleepMs(100);

    await this.serial.setSignals({
      dataTerminalReady: true,
      requestToSend: true,
    });
    await sleepMs(150);

    await this.getSync();
    await this.enterProgMode();
    await this.getUniversal();
    await this.upload(data, progress);
    await this.leaveProgMode();

    await sleepMs(100);
    await this.disconnect();
    await sleepMs(100);
    await this.connect();
    await sleepMs(100);
  }
}

// 带蓝牙的 Arduino 开发版
//
export class ArduinoBLEBoard extends ArduinoBoard {
  static fromGATTServer(gattServer) {
    const board = new ArduinoBLEBoard();
    if (gattServer.device._serial) {
      board._setSerial(gattServer.device._serial);
    } else {
      const serial = new BLESerial(gattServer);
      board._setSerial(serial);
    }
    return board;
  }

  get type() {
    return 'ble';
  }

  requestPort() {
    return this.requestDevice();
  }

  requestDevice() {
    const filters = [{ services: [BLE_SERVICE_UUID] }];
    return navigator.bluetooth.requestDevice({ filters }).then((device) => {
      if (device._serial) {
        this._setSerial(device._serial);
      } else {
        const serial = new BLESerial(device.gatt);
        this._setSerial(serial);
      }
    });
  }

  get connected() {
    return this.serial.server.connected;
  }

  async loadPage(bytes) {
    const bytes_low = bytes.length & 0xff;
    const bytes_high = bytes.length >> 8;
    const cmd = new Uint8Array([Cmnd_STK_PROG_PAGE, bytes_high, bytes_low, 0x46]);
    await this.serial.write(cmd, 'binary');

    // BLE 数据切分
    let i = 0;
    while (i < bytes.length) {
      const splitLength = Math.min(BLE_CHUNK_SIZE, bytes.length - i);
      const chunk = bytes.slice(i, i + splitLength);
      await this.serial.write(new Uint8Array(chunk), 'binary');
      i += splitLength;
    }

    const cmd2 = new Uint8Array([Sync_CRC_EOP]);
    const okResp = new Uint8Array(OK_RESPONSE);
    const out = await this.writeAndReadUntil(cmd2, okResp);
    if (!out) {
      Promise.reject(new Error('stk500 load page error'));
    }
  }

  async put(data, progress) {
    await this.serial.sendATMessage('AT+BAUD=4');

    await this.serial.sendATMessage('AT+TARGE_RESET');
    await sleepMs(100);

    await this.getSync();
    await this.enterProgMode();
    await this.getUniversal();
    await this.upload(data, progress);
    await this.leaveProgMode();

    await sleepMs(100);
    await this.serial.sendATMessage('AT+BAUD=3');
    await sleepMs(100);
    await this.serial.sendATMessage('AT+BLEUSB=3');
  }
}
