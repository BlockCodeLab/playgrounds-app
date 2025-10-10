import MD5 from 'crypto-js/md5';
import Latin1 from 'crypto-js/enc-latin1';
import { ESPLoader, Transport } from 'esptool-js';

export class ESPTool {
  static async connect(filters, baudrate = 921600) {
    const device = await navigator.serial.requestPort({ filters });
    const esploader = new ESPLoader({
      baudrate,
      transport: new Transport(device, true),
    });

    // const chip = await esploader.main();

    // Temporarily broken
    // await esploader.flashId();

    return esploader;
  }

  static async disconnect(esploader) {
    await esploader.transport?.disconnect();
  }

  static check(esploader, timeout = 1000) {
    let controller;
    const checker = new Promise((resolve, reject) => {
      controller = resolve;
      const check = () => {
        setTimeout(() => {
          if (esploader.transport?.getInfo()) {
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

  static async eraseFlash(esploader) {
    await esploader.eraseFlash();
  }

  static async writeFlash(esploader, files, eraseAll, progress) {
    if (typeof eraseAll === 'function') {
      progress = eraseAll;
      eraseAll = false;
    }
    const flashOptions = {
      eraseAll,
      fileArray: files,
      flashSize: 'keep',
      compress: true,
      reportProgress: (fileIndex, written, total) => {
        progress(parseInt((written / total) * 100));
      },
      calculateMD5Hash: (image) => MD5(Latin1.parse(image)),
    };
    await esploader.writeFlash(flashOptions);
    progress(100);
  }
}
