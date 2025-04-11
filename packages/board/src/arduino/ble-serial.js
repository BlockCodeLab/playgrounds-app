import { sleepMs } from '@blockcode/utils';
import { BLE } from '@blockcode/core';

const SERVICE_UUID = '0000ffe0-0000-1000-8000-00805f9b34fb';
const SERIAL_UUID = '0000ffe1-0000-1000-8000-00805f9b34fb';
const BLE_AT_UUID = '0000ffe2-0000-1000-8000-00805f9b34fb';

const encoder = new TextEncoder();

export class BLESerial extends BLE {
  constructor(server) {
    super(server);
    this.device._serial = this.device._ble;
  }

  async open() {
    await super.open();
    setTimeout(async () => {
      await this.startNotifications(SERVICE_UUID, SERIAL_UUID);
      await sleepMs(100);
      await this.sendATMessage('AT+BAUD=3');
      await this.sendATMessage('AT+BLEUSB=3');
      await this.sendATMessage('AT+ALL');
    });
  }

  sendATMessage(message) {
    const data = encoder.encode(`${message}\r\n`);
    return super.write(SERVICE_UUID, BLE_AT_UUID, data);
  }

  write(data, encoding = 'text') {
    data = encoding === 'text' ? encoder.encode(data) : data;
    return super.write(SERVICE_UUID, SERIAL_UUID, data);
  }
}
