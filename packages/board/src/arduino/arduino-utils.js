import { sleepMs } from '@blockcode/utils';
import { parseIntelHex } from '../lib/parse-intel-hex';
import { ArduinoBoard, ArduinoBLEBoard } from './arduino-board';
import { Firmata } from '../lib/firmata-io/firmata';

export class ArduinoUtils {
  static async connect(options) {
    const board = new ArduinoBoard();
    await board.requestPort();
    await board.connect(options);
    return board;
  }

  static async connectBLE() {
    const board = new ArduinoBLEBoard();
    await board.requestDevice();
    await board.connect();
    return board;
  }

  static async bindingFirmata(device, Transport) {
    let board;
    if (device instanceof SerialPort) {
      board = ArduinoBoard.fromPort(device);
    } else if (device instanceof BluetoothRemoteGATTServer) {
      board = ArduinoBLEBoard.fromGATTServer(device);
    }
    if (!board) {
      Promise.reject(new Error('Invalid device'));
      return;
    }

    await board.connect();
    await sleepMs(2000);

    const transport = new Transport(board);
    const firmata = new Firmata(transport, { skipCapabilities: true });
    return firmata;
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

  static bindingTransport(board) {
    const transport = new FirmataTransport(board);
    return transport;
  }

  static async write(board, hex, progress) {
    const data = parseIntelHex(hex);
    await board.put(data, progress);
  }
}
