import { EventEmitter } from 'node:events';
import { Base64Utils } from '@blockcode/utils';

export class BLE extends EventEmitter {
  constructor(server) {
    super();
    this._server = server;
    this.device._ble = this;
    this.setMaxListeners(0);
  }

  get server() {
    return this._server;
  }

  get device() {
    return this.server.device;
  }

  dispose() {
    this.close();
    this._server = null;
  }

  getInfo() {
    return {
      id: this.device.id,
      name: this.device.name,
    };
  }

  handleGattServerDisconnected(e) {
    this.device.removeEventListener('gattserverdisconnected', this.handleGattServerDisconnected.bind(this));
    let err;
    if (this._manualDisconnect !== true) {
      err = new Error('Unexpectedly disconnected');
    }
    this.emit('disconnect', err);
    this.close();
    this._manualDisconnect = false;
  }

  async open() {
    this._manualDisconnect = false;
    try {
      await this.server.connect();
    } catch (err) {
      this.emit('error', err);
      this.close();
    }
    this.device.addEventListener('gattserverdisconnected', this.handleGattServerDisconnected.bind(this));
    this.emit('connect');
  }

  close() {
    this._manualDisconnect = true;
    this.server.disconnect();
  }

  get connected() {
    return !!this.server?.connected;
  }

  handleCharacteristicValueChanged(e) {
    const dataView = e.target.value;
    const buffer = new Uint8Array(dataView.buffer);
    this.emit('data', buffer);
  }

  async startNotifications(serviceId, characteristicId) {
    try {
      const service = await this._server.getPrimaryService(serviceId);
      const characteristic = await service.getCharacteristic(characteristicId);
      characteristic.stopNotifications();
      characteristic.oncharacteristicvaluechanged = this.handleCharacteristicValueChanged.bind(this);
      characteristic.startNotifications();
    } catch (err) {
      this.emit('error', err);
    }
  }

  async read(serviceId, characteristicId, optStartNotifications = false) {
    try {
      const service = await this._server.getPrimaryService(serviceId);
      const characteristic = await service.getCharacteristic(characteristicId);
      if (optStartNotifications) {
        characteristic.stopNotifications();
        characteristic.oncharacteristicvaluechanged = this.handleCharacteristicValueChanged.bind(this);
        characteristic.startNotifications();
      }
      const dataView = await characteristic.readValue();
      const message = new Uint8Array(dataView.buffer);
      return { message };
    } catch (err) {
      this.emit('error', err);
    }
  }

  async write(serviceId, characteristicId, message, encoding = null, withResponse = null) {
    const data = encoding === 'base64' ? Base64Utils.base64ToUint8Array(message) : message;
    try {
      const service = await this._server.getPrimaryService(serviceId);
      const characteristic = await service.getCharacteristic(characteristicId);
      if (withResponse && characteristic.writeValueWithResponse) {
        await characteristic.writeValueWithResponse(data);
      }
      if (withResponse === false && characteristic.writeValueWithoutResponse) {
        await characteristic.writeValueWithoutResponse(data);
      }
      await characteristic.writeValue(data);
    } catch (err) {
      this.emit('error', err);
    }
  }
}
