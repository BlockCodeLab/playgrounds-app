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

  open() {
    return new Promise((resolve) => {
      this.server
        .connect()
        .then(() => {
          this.device.addEventListener('gattserverdisconnected', () => {
            this.emit('disconnect');
            this.close();
          });
          this.emit('connect');
          resolve();
        })
        .catch((err) => {
          this.handleDisconnectError(err);
        });
    });
  }

  close() {
    this.server.disconnect();
  }

  get connected() {
    return !!this.server?.connected;
  }

  startNotifications(serviceId, characteristicId) {
    return this._server
      .getPrimaryService(serviceId)
      .then((service) => service.getCharacteristic(characteristicId))
      .then((characteristic) => {
        characteristic.stopNotifications();
        characteristic.oncharacteristicvaluechanged = (event) => {
          const dataView = event.target.value;
          const buffer = new Uint8Array(dataView.buffer);
          this.emit('data', buffer);
        };
        characteristic.startNotifications();
      })
      .catch((err) => {
        this.emit('error', err);
      });
  }

  read(serviceId, characteristicId, optStartNotifications = false) {
    return this._server
      .getPrimaryService(serviceId)
      .then((service) => service.getCharacteristic(characteristicId))
      .then((characteristic) => {
        if (optStartNotifications) {
          characteristic.stopNotifications();
          characteristic.oncharacteristicvaluechanged = (event) => {
            const dataView = event.target.value;
            const buffer = new Uint8Array(dataView.buffer);
            this.emit('data', buffer);
          };
          characteristic.startNotifications();
        }
        return characteristic.readValue();
      })
      .then((dataView) => ({
        message: new Uint8Array(dataView.buffer),
      }))
      .catch((err) => {
        this.emit('error', err);
      });
  }

  write(serviceId, characteristicId, message, encoding = null, withResponse = null) {
    const data = encoding === 'base64' ? Base64Utils.base64ToUint8Array(message) : message;
    return this._server
      .getPrimaryService(serviceId)
      .then((service) => service.getCharacteristic(characteristicId))
      .then((characteristic) => {
        if (withResponse && characteristic.writeValueWithResponse) {
          return characteristic.writeValueWithResponse(data);
        }
        if (withResponse === false && characteristic.writeValueWithoutResponse) {
          return characteristic.writeValueWithoutResponse(data);
        }
        return characteristic.writeValue(data);
      })
      .catch((err) => {
        this.emit('error', err);
      });
  }

  handleDisconnectError(err) {
    this.emit('error', err);
    this.close();
  }
}
