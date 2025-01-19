import { EventEmitter } from 'node:events';
import { base64ToUint8Array } from '@blockcode/utils';

export class BLE extends EventEmitter {
  constructor(server) {
    super();
    this._server = server;
  }

  get device() {
    return this.server.device;
  }

  get server() {
    return this._server;
  }

  dispose() {
    this.disconnect();
    this._server = null;
  }

  getInfo() {
    return {
      id: this.device.id,
      name: this.device.name,
    };
  }

  connect() {
    this.server.connect().then(() => {
      this.emit('connect');
      this.device.addEventListener('gattserverdisconnected', () => {
        this.disconnect();
        this.emit('disconnect');
      });
    });
  }

  disconnect() {
    this.server.disconnect();
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
      .catch((e) => {
        this.disconnect();
      });
  }

  write(serviceId, characteristicId, message, encoding = null, withResponse = null) {
    const data = encoding === 'base64' ? base64ToUint8Array(message) : message;
    return this._server
      .getPrimaryService(serviceId)
      .then((service) => service.getCharacteristic(characteristicId))
      .then((characteristic) => {
        if (withResponse && characteristic.writeValueWithResponse) {
          return characteristic.writeValueWithResponse(data);
        }
        if (characteristic.writeValueWithoutResponse) {
          return characteristic.writeValueWithoutResponse(data);
        }
        return characteristic.writeValue(data);
      })
      .catch((e) => {
        this.disconnect();
      });
  }
}
