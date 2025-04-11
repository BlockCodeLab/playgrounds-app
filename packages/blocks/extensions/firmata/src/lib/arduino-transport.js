import { EventEmitter } from 'node:events';
import { sleepMs } from '@blockcode/utils';
import { setAlert, delAlert, Text, Spinner } from '@blockcode/core';
import { ArduinoUtils } from '@blockcode/board';
import firmataHex from './firmata-express.ino.hex';

const updatingAlert = (progress) => {
  if (progress < 100) {
    setAlert({
      id: 'firmata-uploading',
      icon: <Spinner level="success" />,
      message: (
        <Text
          id="blocks.firmata.firmware"
          defaultMessage="Updating firmware...{progress}%"
          progress={progress}
        />
      ),
    });
  } else {
    setAlert(
      {
        id: 'firmata-uploading',
        icon: null,
        message: (
          <Text
            id="blocks.firmata.completed"
            defaultMessage="Updating firmware completed."
          />
        ),
      },
      2000,
    );
  }
};

export class ArduinoTransport extends EventEmitter {
  constructor(board) {
    super();
    this._board = board;
    this._writeQueue = [];

    board.serial.on('disconnect', (e) => {
      this.emit('close', e);
    });
    board.serial.on('connect', (e) => {
      this.emit('open', e);
    });
    board.serial.on('error', (e) => {
      this.emit('error', e);
    });
    board.serial.on('data', (e) => {
      this.emit('data', e);
    });
  }

  get board() {
    return this._board;
  }

  async flash() {
    updatingAlert(0);
    const res = await fetch(firmataHex);
    const buffer = await res.arrayBuffer();
    await ArduinoUtils.write(this.board, buffer, updatingAlert);
    if (this.board.type === 'serial') {
      await sleepMs(2000);
    }
  }

  async write(data, callback) {
    await this._write(data, 'binary');
    callback?.();
  }

  _write(data) {
    return new Promise((resolve, reject) => {
      this._writeQueue.push({ data, resolve, reject });
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
      await this.board.serial.write(data, 'binary');
      resolve();
    } catch (err) {
      reject(err);
    } finally {
      this._writing = false;
      if (this._writeQueue.length > 0) {
        this._processWriteQueue();
      }
    }
  }
}
