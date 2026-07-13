import { sleepMs } from '@blockcode/utils';
import { BLE } from '@blockcode/core';

export const BLE_SERVICE_UUID = '00000000-8c26-476f-89a7-a108033a69c7';
export const SERVICE_UUID = '00000001-8c26-476f-89a7-a108033a69c7';
const FILE_CHAR = '00000002-8c26-476f-89a7-a108033a69c7';
const STDIO_CHAR = '00000003-8c26-476f-89a7-a108033a69c7';

// export const SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
// const TX_CHAR_UUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';
// const RX_CHAR_UUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';

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
