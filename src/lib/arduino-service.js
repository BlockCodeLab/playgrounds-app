import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { app, ipcMain } from 'electron';
import { compileService, setArduinoCliPath } from 'arduino-webcli';

const isWindows7 = process.platform === 'win32' && +process.versions.electron.split('.')[0] < 23;

// 本地 arduino_cli 路径，用于测试
const localCliPath = './packages/gui/editors/arduino/arduino_cli';

export const arduinoService = () => {
  // 设置 arduino_cli 路径
  const arduinoCliPath = app.isPackaged
    ? resolve(process.resourcesPath, 'arduino_cli')
    : resolve(process.cwd(), localCliPath, `${process.platform}_${process.arch}`);
  setArduinoCliPath(arduinoCliPath);

  // 检查并启动 Arduino 编译服务
  ipcMain.on('check:arduino:compile', (event) => {
    event.returnValue = existsSync(arduinoCliPath);
  });
  ipcMain.on('arduino:compile', async (event, body) => {
    const data = await compileService(JSON.parse(body));
    event.reply('arduino:compile:reply', JSON.stringify(data));
  });
};

// polyfill class File in Windows 7
if (isWindows7) {
  globalThis.File = class File {
    constructor(bits, name) {
      const parts = [];

      let size = 0;
      for (const part of bits) {
        if (typeof part === 'string') {
          const bytes = new TextEncoder().encode(part);
          parts.push(bytes);
          size += bytes.byteLength;
        } else if (part instanceof ArrayBuffer) {
          parts.push(new Uint8Array(part));
          size += part.byteLength;
        } else if (part instanceof Uint8Array) {
          parts.push(part);
          size += part.byteLength;
        } else if (ArrayBuffer.isView(part)) {
          const { buffer, byteOffset, byteLength } = part;
          parts.push(new Uint8Array(buffer, byteOffset, byteLength));
          size += byteLength;
        } else {
          const bytes = new TextEncoder().encode(String(part));
          parts.push(bytes);
          size += bytes.byteLength;
        }
      }

      this._size = size;
      this._parts = parts;
      this._name = name;
    }

    get size() {
      return this._size;
    }

    get name() {
      return this._name;
    }

    async arrayBuffer() {
      const buffer = new ArrayBuffer(this.size);
      const bytes = new Uint8Array(buffer);
      let offset = 0;
      for (const part of this._parts) {
        bytes.set(part, offset);
        offset += part.byteLength;
      }
      return buffer;
    }
  };
}
