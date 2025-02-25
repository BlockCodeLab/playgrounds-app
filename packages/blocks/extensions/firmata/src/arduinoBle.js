import { EventEmitter } from 'node:events';

const SERVICE_UUID = '0000ffe0-0000-1000-8000-00805f9b34fb';

const BLE_AT_UUID = '0000ffe2-0000-1000-8000-00805f9b34fb';
const SERIAL_UUID = '0000ffe1-0000-1000-8000-00805f9b34fb';

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

const bleOptions = {
  filters: [{ services: [SERVICE_UUID] }],
};

export class ArduinoBle extends EventEmitter {
  constructor() {
    super();
    this.bleService = null;
    this.serialChar = null;
    this.atChar = null;
    this.respQueue = [];
    this._encoder = new TextEncoder();
    this._decoder = new TextDecoder();
    this._inFlash = false;
    this.bleBusy = false;
  }

  requestPort(filters = []) {
    return navigator.bluetooth
      .requestDevice(bleOptions)
      .then((device) => {
        device.addEventListener('gattserverdisconnected', this.handleDisconnectError.bind(this));
        return device.gatt.connect();
      })
      .then((server) => {
        this.bleServer = server;
        this.emit('open');
        this.bleServer
          .getPrimaryService(SERVICE_UUID)
          .then((service) => service.getCharacteristic(SERIAL_UUID))
          .then((c1) => c1.startNotifications())
          .then((c1) => {
            this.serialChar = c1;
            this.serialChar.addEventListener('characteristicvaluechanged', this.serialNotify.bind(this));
          });
        this.bleServer
          .getPrimaryService(SERVICE_UUID)
          .then((service) => service.getCharacteristic(BLE_AT_UUID))
          .then((c2) => c2.startNotifications())
          .then((c2) => {
            this.atChar = c2;
            this.atChar.addEventListener('characteristicvaluechanged', this.bleAtNotify.bind(this));
          });
      })
      .catch((e) => {
        this.emit('error', e);
        console.log(e);
      });
  }

  init(server) {
    this.bleServer = server;
    this.emit('open');
    this.bleServer
      .getPrimaryService(SERVICE_UUID)
      .then((service) => service.getCharacteristic(SERIAL_UUID))
      .then((characteristic) => characteristic.startNotifications())
      .then((characteristic) => {
        this.serialChar = characteristic;
        characteristic.addEventListener('characteristicvaluechanged', this.serialNotify.bind(this));
      });
    this.bleServer
      .getPrimaryService(SERVICE_UUID)
      .then((service) => service.getCharacteristic(BLE_AT_UUID))
      .then((characteristic) => characteristic.startNotifications())
      .then((characteristic) => {
        this.atChar = characteristic;
        characteristic.addEventListener('characteristicvaluechanged', this.bleAtNotify.bind(this));
      });
  }

  async disconnect() {
    this.emit('close');
    await this.bleServer.disconnect();
  }

  async connect() {
    await this.bleServer.connect();
  }

  getConnectStates() {
    return this.bleServer.connected;
  }

  handleDisconnectError(event) {
    console.log('disconnect ' + event);
    this.emit('close');
  }

  serialNotify(event) {
    if (!this._inFlash) {
      const dataView = event.target.value;
      const data = new Uint8Array(dataView.buffer);
      this.emit('data', data);
      //console.log("serial_notify----" + dataView.byteLength + "  " + data);
    }
  }

  bleAtNotify(event) {
    console.log('bleAt_notify----' + this._decoder.decode(event.target.value));
  }

  waitForResponse(device, resp_data, timeout = 5000) {
    return new Promise((resolve, reject) => {
      let timeoutId;
      const onResponse = (event) => {
        const dataView = event.target.value;

        for (let i = 0; i < dataView.byteLength; i++) {
          const char = dataView.getUint8(i); // 获取单个字节
          this.respQueue.push(char);
        }
        // 验证返回值是否符合预期
        if (this.bufferEqual(resp_data, new Uint8Array(this.respQueue))) {
          console.log('rr ' + this.respQueue);
          clearTimeout(timeoutId);
          device.removeEventListener('characteristicvaluechanged', onResponse);
          resolve(this.respQueue);
        }
      };

      // 设置超时处理
      timeoutId = setTimeout(() => {
        device.removeEventListener('characteristicvaluechanged', onResponse);
        reject(new Error('Timeout waiting for the expected response.'));
      }, timeout);

      // 监听 characteristic 的 value changed 事件
      console.log('监听啦');
      this.respQueue = [];
      device.addEventListener('characteristicvaluechanged', onResponse);
    });
  }

  async sendATMessage(message) {
    console.log('发送了 ' + message);
    message = message + '\r\n';
    const data = this._encoder.encode(message);
    await this.atChar.writeValue(data);
  }

  async sendSerialMessage(req_data) {
    await this.serialChar.writeValue(req_data);
  }

  async sendSerialMessageWithResp(req_data, retryCount = 0) {
    if (this.bleBusy) {
      if (retryCount < 30) {
        setTimeout(() => this.sendSerialMessageWithResp(req_data, retryCount + 1), 10);
      } else {
        console.error('Max retries reached.');
      }
      return;
    }
    try {
      this.bleBusy = true;
      await this.sendSerialMessage(req_data);
    } finally {
      this.bleBusy = false;
    }
  }

  async sendSerialAndTestRet(req_data, resp_data) {
    await this.sendSerialMessage(req_data);
    const resp = await this.waitForResponse(this.serialChar, resp_data);
    const ret = this.bufferEqual(resp_data, new Uint8Array(resp));
    // console.log("发送--" + req_data);
    // console.log("返回--" + new Uint8Array(resp));
    // console.log("希望-" + resp_data);
    return ret;
  }

  async flash(file) {
    this._inFlash = true;
    const fileHex = this.parseIntelHex(file);
    try {
      await this.sendATMessage('AT+TARGE_RESET');
      await new Promise((resolve) => setTimeout(resolve, 100));
      const syncReq = new Uint8Array([Cmnd_STK_GET_SYNC, Sync_CRC_EOP]);
      const okResp = new Uint8Array(OK_RESPONSE);
      const sync_succ = await this.sendSerialAndTestRet(syncReq, okResp);
      if (!sync_succ) {
        throw new Error('stk500 sync error');
      }
      const enterProgModelReq = new Uint8Array([Cmnd_STK_ENTER_PROGMODE, Sync_CRC_EOP]);
      const enter_succ = await this.sendSerialAndTestRet(enterProgModelReq, okResp);
      if (!enter_succ) {
        throw new Error('stk500 enter progmodel error');
      }
      const universalReq = new Uint8Array([STK_UNIVERSAL, 172, 128, 0, 0, Sync_CRC_EOP]);
      const universalResp = new Uint8Array([Resp_STK_INSYNC, 0, Resp_STK_OK]);
      const universal_succ = await this.sendSerialAndTestRet(universalReq, universalResp);
      if (!universal_succ) {
        throw new Error('stk500 universal error');
      }
      await this.upload(fileHex);
      const leaveProgModelReq = new Uint8Array([Cmnd_STK_LEAVE_PROGMODE, Sync_CRC_EOP]);
      const leave_succ = await this.sendSerialAndTestRet(leaveProgModelReq, okResp);
      if (!leave_succ) {
        throw new Error('stk500 leaveProgMode error');
      } else {
        console.log('leaveProgMode');
      }
    } catch (error) {
      console.log(error);
    } finally {
      this._inFlash = false;
    }
  }

  async upload(hex) {
    const pageSize = 128;
    let pageaddr = 0;
    let writeBytes = null;
    let useaddr = null;

    try {
      while (pageaddr < hex.length) {
        console.log('program page');
        useaddr = pageaddr >> 1;
        await this.loadAddress(useaddr);
        writeBytes = hex.slice(pageaddr, hex.length > pageSize ? pageaddr + pageSize : hex.length - 1);
        await this.loadPage(writeBytes);
        console.log('programmed page');
        pageaddr = pageaddr + writeBytes.length;
        await new Promise((resolve) => setTimeout(resolve, 4));
        console.log('page done');
      }
    } catch (err) {
      throw err;
    }
    console.log('upload done');
    return true;
  }

  async loadAddress(useaddr) {
    const addr_low = useaddr & 0xff;
    const addr_high = (useaddr >> 8) & 0xff;
    const cmd = new Uint8Array([Cmnd_STK_LOAD_ADDRESS, addr_low, addr_high, Sync_CRC_EOP]);
    const okResp = new Uint8Array(OK_RESPONSE);
    console.log('loadAddress');
    const ret = await this.sendSerialAndTestRet(cmd, okResp);
    if (!ret) {
      throw new Error('stk500 loadAddress error');
    }
  }

  async loadPage(writeBytes) {
    const bytes_low = writeBytes.length & 0xff;
    const bytes_high = writeBytes.length >> 8;
    const cmd1 = new Uint8Array([Cmnd_STK_PROG_PAGE, bytes_high, bytes_low, 0x46]);
    await this.sendSerialMessage(cmd1);
    let i = 0;
    console.log('loadAddress');
    const length = writeBytes.length;
    while (i < length) {
      const splitLength = Math.min(30, length - i);
      console.log('splitLength:', splitLength);
      const chunk = writeBytes.slice(i, i + splitLength);
      await this.sendSerialMessage(new Uint8Array(chunk));
      i += splitLength;
    }
    const cmd3 = new Uint8Array([Sync_CRC_EOP]);
    const okResp = new Uint8Array(OK_RESPONSE);
    const ret = await this.sendSerialAndTestRet(cmd3, okResp);
    if (!ret) {
      throw new Error('stk500 loadPage error');
    }
  }

  mergeUint8Arrays(...arrays) {
    const totalLength = arrays.reduce((acc, arr) => acc + arr.length, 0);
    const mergedArray = new Uint8Array(totalLength);

    let offset = 0;
    for (const arr of arrays) {
      mergedArray.set(arr, offset);
      offset += arr.length;
    }

    return mergedArray;
  }

  parseIntelHex(data) {
    const bytes = [];
    const str = typeof data === 'string' ? data : new TextDecoder('utf-8').decode(data);
    var extra_addr = 0;
    for (let line of str.split(/\s*\n\s*/)) {
      if (line.length < 1) {
        continue;
      }
      if (line[0] != ':') {
        throw new Error("Hex file has a line not starting with ':'");
      }
      const rec_len = parseInt(line.substring(1, 3), 16);
      const addr = parseInt(line.substring(3, 7), 16) + extra_addr;
      const rec_type = parseInt(line.substring(7, 9), 16);
      if (line.length != rec_len * 2 + 11) {
        throw new Error('Error in hex file: ' + line);
      }
      var check_sum = 0;
      for (let i = 0; i < rec_len + 5; i++) {
        check_sum += parseInt(line.substring(i * 2 + 1, i * 2 + 3), 16);
      }
      check_sum &= 0xff;
      if (check_sum != 0) {
        throw new Error('Checksum error in hex file: ' + line);
      }
      switch (rec_type) {
        case 0: // Data record
          while (bytes.length < addr + rec_len) {
            bytes.push(0);
          }
          for (let i = 0; i < rec_len; i++) {
            bytes[addr + i] = parseInt(line.substring(i * 2 + 9, i * 2 + 11), 16);
          }
          break;
        case 1: // End Of File record
          break;
        case 2: // Extended Segment Address Record
          extra_addr = parseInt(line.substring(9, 13), 16) * 16;
          break;
        default:
          console.log(rec_type, rec_len, addr, check_sum, line);
      }
    }
    return bytes;
  }

  bufferEqual(a, b) {
    if (a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) {
        return false;
      }
    }
    return true;
  }
}
