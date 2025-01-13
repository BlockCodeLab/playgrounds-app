// 定义串口通讯的连接窗口
class SerialPort {
  constructor() {
    this._portList = null;
  }

  get portList() {
    if (!this._portList) return;
    return this._portList.map((port) => ({
      id: port.portId,
      name: port.displayName,
    }));
  }

  setBrowserWindow(mainWindow) {
    mainWindow.webContents.session.setPermissionCheckHandler((webContents, permission, requestingOrigin, details) => {
      if (permission === 'serial' && details.securityOrigin === 'file:///') {
        return true;
      }
      return false;
    });

    mainWindow.webContents.session.on('serial-port-added', (event, port) => {
      const portList = this._portList;
      if (portList.find(({ portId }) => portId == port.portId)) return;
      portList.push(port);
      if (this._callback) {
        mainWindow.webContents.send('serial:scan', this.portList);
      }
    });

    mainWindow.webContents.session.on('serial-port-removed', (event, port) => {
      const portList = this._portList;
      const index = portList.findIndex(({ portId }) => portId == port.portId);
      if (index !== -1) {
        portList.splice(index, 1);
      }
      if (this._callback) {
        mainWindow.webContents.send('serial:scan', this.portList);
      }
    });

    mainWindow.webContents.session.on('select-serial-port', (event, portList, webContents, callback) => {
      event.preventDefault();
      this._portList = portList;
      this._callback = (portId) => {
        mainWindow.webContents.send('serial:scan', null);
        this._callback = null;
        callback(portId);
      };
      mainWindow.webContents.send('serial:scan', this.portList);
    });
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

export const serial = new SerialPort();
