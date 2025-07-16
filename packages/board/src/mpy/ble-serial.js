import { sleepMs } from '@blockcode/utils';
import { BLE } from '@blockcode/core';

const SERVICE_UUID = '00000001-8c26-476f-89a7-a108033a69c7';
const FILE_CHAR = '00000002-8c26-476f-89a7-a108033a69c7';
const STDIO_CHAR = '00000003-8c26-476f-89a7-a108033a69c7';

const encoder = new TextEncoder();

export class ESP32BLESerial extends BLE {
  constructor(server) {
    super(server);
    this.device._serial = this.device._ble;
  }

  async open() {
    await super.open();
    setTimeout(async () => {
      await this.startNotifications(SERVICE_UUID, STDIO_CHAR);
      await sleepMs(100);
    });
  }

  write(data, encoding = 'text') {
    data = encoding === 'text' ? encoder.encode(data) : data;
    return super.write(SERVICE_UUID, STDIO_CHAR, data);
  }
}
