import { Serial } from '@blockcode/core';
import fileHex from './FirmataExpress.ino.hex';

// STK500 协议常量
const Resp_STK_INSYNC = 0x14;
const Resp_STK_OK = 0x10;
const Cmnd_STK_GET_SYNC = 0x30;
const Cmnd_STK_ENTER_PROGMODE = 0x50;
const Cmnd_STK_LOAD_ADDRESS = 0x55;
const STK_UNIVERSAL = 0x56;
const Cmnd_STK_PROG_PAGE = 0x64;
const Cmnd_STK_LEAVE_PROGMODE = 0x51;
const Sync_CRC_EOP = 0x20;
const OK_RESPONSE = [Resp_STK_INSYNC, Resp_STK_OK];


export class ASerialPort extends Serial {
  constructor(port) {
    super(port);
    this._port = port;
    this.respQueue = [];
    this._inFlash = false;
    this._writer = null;
    this._writeQueue = [];
    this._writing = false;
  }

  async write(data, callback) {
    console.log(data);
    await this._write(data, 'binary');
    console.log(callback);
    callback();
  }

  _write(data, encoding = 'text') {
    return new Promise((resolve, reject) => {
      this._writeQueue.push({
        data: encoding === 'text' ? encoder.encode(data) : data,
        resolve,
        reject
      });
      
      if (!this._writing) {
        this._processWriteQueue();
      }
    });
  }

  async _processWriteQueue() {
    if (this._writeQueue.length === 0 || this._writing) {
      return;
    }

    this._writing = true;
    const { data, resolve, reject } = this._writeQueue.shift();

    try {
      this._writer = this.port.writable.getWriter();
      await this._writer.write(data);
      this._writer.releaseLock();
      this._writer = null;
      resolve();
    } catch (error) {
      reject(error);
    } finally {
      this._writing = false;
      if (this._writeQueue.length > 0) {
        this._processWriteQueue();
      }
    }
  }

  async flashHex() {
    const res = await fetch(fileHex);
    const buffer = await res.arrayBuffer();
    await this.close();
    await this.open({ baudRate: 115200 });
    await new Promise(resolve => setTimeout(resolve, 100));
    await this.flash(buffer);
    await new Promise(resolve => setTimeout(resolve, 100));
    await this.close();
    await new Promise(resolve => setTimeout(resolve, 100));
    await this.open({ baudRate: 57600 });
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  async flashFile(file) {
    await this.close();
    await this.open({ baudRate: 115200 });
    await new Promise(resolve => setTimeout(resolve, 100));
    await this.flash(file);
    await new Promise(resolve => setTimeout(resolve, 100));
    await this.close();
    await new Promise(resolve => setTimeout(resolve, 100));
    await this.open({ baudRate: 57600 });
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  waitForResponse(resp_data, timeout = 5000) {
    return new Promise((resolve, reject) => {
      let timeoutId;
      const onData = (data) => {
        for (let i = 0; i < data.length; i++) {
          this.respQueue.push(data[i]);
        }
        if (this.bufferEqual(resp_data, new Uint8Array(this.respQueue))) {
          clearTimeout(timeoutId);
          this.removeListener('data', onData);
          resolve(this.respQueue);
        }
      };

      timeoutId = setTimeout(() => {
        this.removeListener('data', onData);
        reject(new Error('Timeout waiting for response'));
      }, timeout);

      this.respQueue = [];
      this.on('data', onData);
    });
  }

  async sendSerialAndTestRet(req_data, resp_data) {
    const rr = this.waitForResponse(resp_data);
    await this._write(req_data, 'binary');
    const resp = await rr;
    return this.bufferEqual(resp_data, new Uint8Array(resp));
  }

  async flash(file) {
    console.log("flash ---");
    this._inFlash = true;
    this._port.setSignals({ dataTerminalReady: true, requestToSend: true});
    await new Promise(resolve => setTimeout(resolve, 150));
    const fileHex = this.parseIntelHex(file);
    try {
      const syncReq = new Uint8Array([Cmnd_STK_GET_SYNC, Sync_CRC_EOP]);
      const okResp = new Uint8Array(OK_RESPONSE);
      if (!await this.sendSerialAndTestRet(syncReq, okResp)) {
        throw new Error('stk500 sync error');
      }

      const enterProgModelReq = new Uint8Array([Cmnd_STK_ENTER_PROGMODE, Sync_CRC_EOP]);
      if (!await this.sendSerialAndTestRet(enterProgModelReq, okResp)) {
        throw new Error('stk500 enter progmodel error');
      }

      const universalReq = new Uint8Array([STK_UNIVERSAL, 172, 128, 0, 0, Sync_CRC_EOP]);
      const universalResp = new Uint8Array([Resp_STK_INSYNC, 0, Resp_STK_OK]);
      if (!await this.sendSerialAndTestRet(universalReq, universalResp)) {
        throw new Error('stk500 universal error');
      }

      await this.upload(fileHex);

      const leaveProgModelReq = new Uint8Array([Cmnd_STK_LEAVE_PROGMODE, Sync_CRC_EOP]);
      if (!await this.sendSerialAndTestRet(leaveProgModelReq, okResp)) {
        throw new Error('stk500 leaveProgMode error');
      }
    } catch (error) {
      console.error(error);
    } finally {
      this._inFlash = false;
    }
  }

  async upload(hex) {
    const pageSize = 128;
    let pageaddr = 0;

    try {
      while (pageaddr < hex.length) {
        const useaddr = pageaddr >> 1;
        await this.loadAddress(useaddr);
        const writeBytes = hex.slice(pageaddr, Math.min(pageaddr + pageSize, hex.length));
        await this.loadPage(writeBytes);
        pageaddr = pageaddr + writeBytes.length;
        await new Promise((resolve) => setTimeout(resolve, 4));
      }
      return true;
    } catch (err) {
      throw err;
    }
  }

  async loadAddress(useaddr) {
    const addr_low = useaddr & 0xff;
    const addr_high = (useaddr >> 8) & 0xff;
    const cmd = new Uint8Array([Cmnd_STK_LOAD_ADDRESS, addr_low, addr_high, Sync_CRC_EOP]);
    const okResp = new Uint8Array(OK_RESPONSE);
    const ret = await this.sendSerialAndTestRet(cmd, okResp);
    if (!ret) {
      throw new Error('stk500 loadAddress error');
    }
  }

  async loadPage(writeBytes) {
    const bytes_low = writeBytes.length & 0xff;
    const bytes_high = writeBytes.length >> 8;
    const cmd = this.mergeUint8Arrays(
      new Uint8Array([Cmnd_STK_PROG_PAGE, bytes_high, bytes_low, 0x46]),
      writeBytes,
      new Uint8Array([Sync_CRC_EOP])
    );
    const okResp = new Uint8Array(OK_RESPONSE);
    const ret = await this.sendSerialAndTestRet(cmd, okResp);
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
    let extra_addr = 0;
    
    for (let line of str.split(/\s*\n\s*/)) {
      if (line.length < 1) continue;
      if (line[0] != ':') {
        throw new Error("Hex file has a line not starting with ':'");
      }
      
      const rec_len = parseInt(line.substring(1, 3), 16);
      const addr = parseInt(line.substring(3, 7), 16) + extra_addr;
      const rec_type = parseInt(line.substring(7, 9), 16);
      
      if (line.length != rec_len * 2 + 11) {
        throw new Error('Error in hex file: ' + line);
      }
      
      let check_sum = 0;
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
      }
    }
    return bytes;
  }

  bufferEqual(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

}