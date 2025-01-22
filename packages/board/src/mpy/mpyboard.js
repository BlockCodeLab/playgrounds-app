/* inspired by https://github.com/arduino/micropython.js/blob/main/micropython.js */
import { sleepMs } from '@blockcode/utils';
import { Serial } from '@blockcode/core';

const CTRL_A = '\x01'; // raw repl
const CTRL_B = '\x02'; // exit raw repl
const CTRL_C = '\x03'; // ctrl-c
const CTRL_D = '\x04'; // reset (ctrl-d)
const CTRL_E = '\x05'; // paste mode (ctrl-e)
const CTRL_F = '\x06'; // safe boot (ctrl-f)

const CMD_CHUNK_SIZE = 512;
const FILE_CHUNK_SIZE = 80;
// const BAUD_RATE = 115200;
const BAUD_RATE = 460800;

function fixLineBreak(str) {
  // https://stackoverflow.com/questions/4025760/python-file-write-creating-extra-carriage-return
  return str.replaceAll('\r\n', '\n');
}

function extract(str) {
  /**
   * Message ($msg) will come out following this template:
   * "OK${msg}\x04${err}\x04>"
   */
  return str.slice(2, -3);
}

export class MPYBoard {
  constructor() {
    this.serial = null;
    this._connected = false;
    this._encoder = new TextEncoder();
    this._decoder = new TextDecoder();
  }

  requestPort(filters = []) {
    return navigator.serial.requestPort({ filters }).then((port) => {
      if (port._serial) {
        this.serial = port._serial;
        this.serial.on('connect', () => (this._connected = true));
        this.serial.on('disconnect', () => (this._connected = false));
        return;
      }
      this.serial = new Serial(port);
      this.serial.on('connect', () => (this._connected = true));
      this.serial.on('disconnect', () => (this._connected = false));
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
          .then(() => resolve())
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
    return new Promise((resolve) => {
      let buff = '';
      const fn = async (data) => {
        if (data) {
          buff += this._decoder.decode(data);
          if (dataConsumer) {
            dataConsumer(data);
          }
        }
        if (buff.indexOf(ending) !== -1) {
          this.serial.off('data', fn);
          resolve(buff);
        }
      };
      this.serial.on('data', fn);
    });
  }

  writeAndReadUntil(cmd, expect, dataConsumer) {
    return new Promise(async (resolve) => {
      if (expect) {
        this.readUntil(expect, dataConsumer).then(resolve);
      }
      for (let i = 0; i < cmd.length; i += CMD_CHUNK_SIZE) {
        await this.serial.write(cmd.slice(i, i + CMD_CHUNK_SIZE));
        await sleepMs(10);
      }
      if (!expect) {
        resolve();
      }
    });
  }

  async getPrompt() {
    await sleepMs(150);
    await this.stop();
    await sleepMs(150);
    const out = await this.writeAndReadUntil(`\r${CTRL_C}${CTRL_B}`, '\r\n>>>');
    return out;
  }

  async enterRawRepl() {
    const out = await this.writeAndReadUntil(CTRL_A, 'raw REPL; CTRL-B to exit');
    return out;
  }

  async exitRawRepl() {
    const out = await this.writeAndReadUntil(CTRL_B, '\r\n>>>');
    return out;
  }

  async execRaw(cmd, dataConsumer) {
    await this.writeAndReadUntil(cmd);
    const out = await this.writeAndReadUntil(CTRL_D, `${CTRL_D}>`, dataConsumer);
    return out;
  }

  async execFile(fileContent, dataConsumer) {
    dataConsumer = dataConsumer || function () {};
    if (fileContent) {
      await this.enterRawRepl();
      const out = await this.execRaw(fileContent, dataConsumer);
      await this.exitRawRepl();
      return out;
    }
    return Promise.reject();
  }

  async run(code, dataConsumer) {
    dataConsumer = dataConsumer || function () {};
    return new Promise(async (resolve, reject) => {
      if (this.rejectRun) {
        this.rejectRun(new Error('re-run'));
        this.rejectRun = null;
      }
      this.rejectRun = reject;
      try {
        await this.enterRawRepl();
        const output = await this.execRaw(code || '#', dataConsumer);
        await this.exitRawRepl();
        return resolve(output);
      } catch (e) {
        reject(e);
        this.rejectRun = null;
      }
    });
  }

  async eval(code) {
    await this.serial.write(code);
  }

  async stop() {
    if (this.rejectRun) {
      this.rejectRun(new Error('pre stop'));
      this.rejectRun = null;
    }
    // Dismiss any data with ctrl-C
    await this.serial.write(CTRL_C);
  }

  async reset() {
    if (this.rejectRun) {
      this.rejectRun(new Error('pre reset'));
      this.rejectRun = null;
    }
    // Dismiss any data with ctrl-C
    await this.serial.write(CTRL_C);
    // Soft reboot
    await this.serial.write(CTRL_D);
  }

  async hardReset() {
    if (this.rejectRun) {
      this.rejectRun(new Error('pre reset'));
      this.rejectRun = null;
    }
    // Hardware reboot
    await this.enterRawRepl();
    this.execRaw('import machine\nmachine.reset()');
    // await this.exitRawRepl();
  }

  /**
   * fs functions
   */

  async exists(filePath) {
    filePath = filePath || '';
    let command = '';
    command += `try:\n`;
    command += `  f = open('${filePath}', 'r')\n`;
    command += `  print(1)\n`;
    command += `except OSError:\n`;
    command += `  print(0)\n`;
    await this.enterRawRepl();
    const output = await this.execRaw(command);
    await this.exitRawRepl();
    return output[2] == '1';
  }

  async listdir(folderPath) {
    folderPath = folderPath || '';
    let command = '';
    command += `import os\n`;
    command += `try:\n`;
    command += `  print(os.listdir('${folderPath}'))\n`;
    command += `except OSError:\n`;
    command += `  print([])\n`;
    await this.enterRawRepl();
    let output = await this.execRaw(command);
    await this.exitRawRepl();
    output = extract(output);
    // Convert text output to js array
    output = output.replace(/'/g, '"');
    return JSON.parse(output);
  }

  async mkdir(filePath) {
    if (filePath) {
      await this.enterRawRepl();
      const output = await this.execRaw(`import os\nos.mkdir('${filePath}')`);
      await this.exitRawRepl();
      return output;
    }
    return Promise.reject(new Error(`Path to file was not specified`));
  }

  async rmdir(filePath) {
    if (filePath) {
      let command = '';
      command += `import os\n`;
      command += `try:\n`;
      command += `  os.rmdir("${filePath}")\n`;
      command += `except OSError:\n`;
      command += `  print(0)\n`;
      await this.enterRawRepl();
      const output = await this.execRaw(command);
      await this.exitRawRepl();
      return output;
    }
    return Promise.reject(new Error(`Path to file was not specified`));
  }

  async remove(filePath) {
    if (filePath) {
      let command = '';
      command += `import os\n`;
      command += `try:\n`;
      command += `  os.remove("${filePath}")\n`;
      command += `except OSError:\n`;
      command += `  print(0)\n`;
      await this.enterRawRepl();
      const output = await this.execRaw(command);
      this.exitRawRepl();
      return output;
    }
    return Promise.reject(new Error(`Path to file was not specified`));
  }

  async rename(oldFilePath, newFilePath) {
    if (oldFilePath && newFilePath) {
      await this.enterRawRepl();
      const output = await this.execRaw(`import os\nos.rename('${oldFilePath}', '${newFilePath}')`);
      this.exitRawRepl();
      return output;
    }
    return Promise.reject(new Error(`Path to file was not specified`));
  }

  async cat(filePath) {
    if (filePath) {
      await this.enterRawRepl();
      let output = await this.execRaw(
        `with open('${filePath}','r') as f:\n while 1:\n  b=f.read(256)\n  if not b:break\n  print(b,end='')`,
      );
      await this.exitRawRepl();
      output = extract(output);
      return fixLineBreak(output);
    }
    return Promise.reject(new Error(`Path to file was not specified`));
  }

  async hash(filePath) {
    if (filePath) {
      let command = '';
      command += 'import os\n';
      command += 'import hashlib\n';
      command += 'import binascii\n';
      command += 'hash = hashlib.sha256()\n';
      command += `with open('${filePath}', 'rb') as f:\n`;
      command += '  while True:\n';
      command += `    c = f.read(${FILE_CHUNK_SIZE})\n`;
      command += '    if not c: break\n';
      command += '    hash.update(c)\n';
      command += 'print(binascii.hexlify(hash.digest()).decode())\n';
      await this.enterRawRepl();
      let output = await this.execRaw(command);
      await this.exitRawRepl();
      output = output.slice(2, output.indexOf('\n') - 1);
      return output;
    }
    return Promise.reject(new Error(`Path to file was not specified`));
  }

  async put(content, dest, dataConsumer) {
    if (!dest) {
      Promise.reject(new Error(`Must specify content and destination path`));
      return;
    }

    let contentUint8;
    if (typeof content === 'string') {
      contentUint8 = this._encoder.encode(fixLineBreak(content));
    } else if (content instanceof ArrayBuffer) {
      contentUint8 = new Uint8Array(content);
    } else if (content instanceof Uint8Array) {
      contentUint8 = content;
    } else {
      Promise.reject(new Error(`${content} must string, Uint8Array or ArrayBuffer`));
    }

    dataConsumer = dataConsumer || function () {};

    // skip same file
    if (await this.exists(dest)) {
      const hashBuffer = await crypto.subtle.digest('SHA-256', contentUint8);
      const hash = Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      const result = await this.hash(dest);
      if (hash === result) {
        dataConsumer(100);
        return;
      }
    }

    const hexArray = Array.from(contentUint8).map((c) => c.toString(16).padStart(2, '0'));
    let out = '';
    out += await this.enterRawRepl();
    // mkdir
    let destcomps = dest.split('/');
    destcomps.pop(); // remove filename
    if (destcomps.length > 0) {
      out += await this.execRaw(`import os`);
      const dirs = [];
      destcomps.reduce((path, dir) => {
        if (dir === '' || (path !== '' && path.at(-1) !== '/')) path += '/';
        path += dir;
        if (path !== '/') dirs.push(path);
        return path;
      }, '');
      for (const dir of dirs) {
        out += await this.execRaw(`os.mkdir('${dir}')`);
      }
    }
    // write file
    out += await this.execRaw(`f=open('${dest}','w')\nw=f.write`);
    for (let i = 0; i < hexArray.length; i += FILE_CHUNK_SIZE) {
      // const bytes = hexArray.slice(i, i + FILE_CHUNK_SIZE).map((h) => `0x${h}`);
      // out += await this.execRaw(`w(bytes([${bytes.join(',')}]))`);
      const bytes = hexArray.slice(i, i + FILE_CHUNK_SIZE).map((h) => `\\x${h}`);
      out += await this.execRaw(`w(b"${bytes.join('')}")`);
      dataConsumer(parseInt((i / hexArray.length) * 100));
    }
    out += await this.execRaw(`f.close()`);
    out += await this.exitRawRepl();
    dataConsumer(100);
    return out;
  }
}
