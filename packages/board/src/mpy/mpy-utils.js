import { mime } from '@blockcode/utils';
import { MPYBoard, ESP32BLEMPYBoard } from './mpy-board';
import { getImageBase64 } from '../lib/image-base64';

export class MPYUtils {
  static async connect(filters, options) {
    const board = new MPYBoard();
    await board.requestPort(filters);
    await board.connect(options);
    return board;
  }

  static async connectBLE() {
    const board = new ESP32BLEMPYBoard();
    await board.requestDevice();
    await board.connect();
    return board;
  }

  static async disconnect(board, reset = false) {
    if (!board.connected) return;
    if (reset) {
      await board.hardReset();
    }
    await board.disconnect();
  }

  static check(board, timeout = 1000) {
    let controller;
    const checker = new Promise((resolve, reject) => {
      controller = resolve;
      const check = () => {
        setTimeout(() => {
          if (board.connected) {
            check();
          } else {
            reject('disconnected');
          }
        }, timeout);
      };
      check();
    });
    return {
      cancel() {
        if (controller) {
          controller();
        }
      },
      catch(...args) {
        checker.catch(...args);
        return this;
      },
      then(...args) {
        checker.then(...args);
        return this;
      },
      finally(...args) {
        checker.finally(...args);
        return this;
      },
    };
  }

  static async enterDownloadMode(board) {
    await board.stop(true);
    await board.enterRawRepl();
    await board.execRaw('import download_screen\n');
    await board.exitRawRepl();
  }

  static async config(board, settings) {
    await board.stop();
    await board.enterRawRepl();
    // await board.execRaw('import device.config as config');
    let line = 'import device.config as config\n';
    for (const [key, value] of Object.entries(settings)) {
      if (typeof value === 'number' && value % 1 === 0) {
        // await board.execRaw(`config.set_int("${key}", ${value})`);
        line += `config.set_int("${key}", ${value})\n`;
      } else if (typeof value === 'boolean') {
        // await board.execRaw(`config.set_bool("${key}", ${value ? 'True' : 'False'})`);
        line += `config.set_bool("${key}", ${value ? 'True' : 'False'})\n`;
      } else {
        // await board.execRaw(`config.set_str("${key}", "${value}")`);
        line += `config.set_str("${key}", "${value}")\n`;
      }
    }
    // await board.execRaw('config.save()');
    line += 'config.save()\n';
    await board.execRaw(line);
    await board.exitRawRepl();
  }

  static async checkVersion(board, version) {
    const [major, minor, revision] = version.split('.').map((v) => parseInt(v, 10));
    await board.stop();
    await board.enterRawRepl();
    let line = '';
    line += 'import version\n';
    line += `print(version.major>=${major} and version.minor>=${minor} and version.revision>=${revision})\n`;
    const out = await board.execRaw(line);
    await board.exitRawRepl();
    return out.slice(2, -3).trim() === 'True';
  }

  static async flashFree(board, files) {
    await board.stop();
    let size = 0;
    for (const file of files) {
      size += file.content?.length ?? file.data?.length ?? 0;
    }
    await board.enterRawRepl();
    let out = await board.execRaw('from device.flash import check_flash_free\n');
    if (out.includes('ImportError: ')) return true;
    out = await board.execRaw(`print(check_flash_free(${size}))\n`);
    await board.exitRawRepl();
    return out.slice(2, -3).trim() === 'True';
  }

  static async eraseAll(board, exclude) {
    await board.stop();
    await board.enterRawRepl();
    let line = 'from device.flash import erase_all\n';
    line += `erase_all(${exclude ? JSON.stringify(exclude) : ''})\n`;
    await board.execRaw(line);
    await board.exitRawRepl();
  }

  static async write(board, files, progress, fixed = parseInt) {
    await board.stop();

    let finished = 0;
    const reporter = (x) => {
      const value = (finished + (1 / files.length) * (x / 100)) * 100;
      progress(fixed(value));
    };

    for (const file of files) {
      let { name: filePath, content } = file;
      filePath = filePath ?? file.id;
      // 根据类型处理
      if (file.type) {
        // 添加后缀名
        const extname = '.' + mime.getExtension(file.type);
        if (!filePath.endsWith(extname)) {
          filePath += extname;
        }
        // 从数据生成内容
        if (!content) {
          if (file.type.startsWith('image/')) {
            content = await getImageBase64(file.type, file.data);
          }
        }
      }
      await board.put(content ?? '', filePath, reporter);
      finished += 1 / files.length;
    }
    progress(100);
  }
}
