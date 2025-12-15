import { crypto } from '@blockcode/utils';
import { ESPLoader, Transport } from 'esptool-js';

export class ESPTool {
  static async connect(filters, baudrate = 921600) {
    const device = await navigator.serial.requestPort({ filters });
    const transport = new Transport(device);
    const esploader = new ESPLoader({
      baudrate,
      transport,
    });

    // await esploader.main();
    // Temporarily broken
    // await esploader.flashId();

    return esploader;
  }

  static async disconnect(esploader) {
    await esploader.transport.disconnect();
  }

  static async eraseFlash(esploader) {
    await esploader.main();
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
      calculateMD5Hash: (image) => crypto.MD5(crypto.Latin1.parse(image)),
    };
    await esploader.main();
    await esploader.writeFlash(flashOptions);
    progress(100);
  }
}
