import { MPYBoard } from './mpy-board';
import { getImageBase64 } from '../lib/image-base64';

export class MPYUtils {
  static async connect(filters, downloadMode = true) {
    const board = new MPYBoard();
    await board.requestPort(filters);
    await board.connect();
    if (downloadMode) {
      await board.stop(true);
      await board.enterRawRepl();
      await board.execRaw('import download_screen\n');
      await board.exitRawRepl();
    }
    return board;
  }

  static async disconnect(board) {
    await board?.disconnect();
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
        return controller();
        return this;
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

  static async write(board, files, progress) {
    await board.stop();

    const len = files.length;
    let finished = 0;
    const reporter = (x) => {
      progress(((finished + (1 / len) * (x / 100)) * 100).toFixed(1));
    };
    for (const file of files) {
      let { id: filePath, content } = file;
      if (file.type) {
        if (file.type === 'text/x-python' && !filePath.endsWith('.py')) {
          filePath += '.py';
        } else if (file.type.startsWith('image/') && !content) {
          content = await getImageBase64(file.type, file.data);
        }
      }
      await board.put(content || '', filePath, reporter);
      finished += 1 / len;
    }
    progress(100);
  }
}
