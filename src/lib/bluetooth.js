import { ipcMain } from 'electron';

class Bluetooth {
  constructor() {
    this._portList = null;
  }

  get portList() {
    if (!this._portList) return;
    return this._portList.map((port) => ({
      id: port.deviceId,
      name: port.deviceName,
    }));
  }

  setBrowserWindow(mainWindow) {
    mainWindow.webContents.on('select-bluetooth-device', (event, deviceList, callback) => {
      event.preventDefault();
      this._portList = deviceList;
      this._callback = (portId) => {
        mainWindow.webContents.send('bluetooth:scan', null);
        this._callback = null;
        callback(portId);
      };
      mainWindow.webContents.send('bluetooth:scan', this.portList);
    });

    ipcMain.on('bluetooth:cancel', () => this.cancel());
    ipcMain.on('bluetooth:connect', (event, portId) => this.connect(portId));
  }

  cancel() {
    if (this._callback) {
      this._callback(''); // Could not find any matching devices
    }
  }

  connect(portId) {
    if (this._callback) {
      this._callback(portId);
    }
  }
}

export const bluetooth = new Bluetooth();
