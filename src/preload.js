import { contextBridge, ipcRenderer } from 'electron/renderer';

const checkArduinoCompile = ipcRenderer.sendSync('check:arduino:compile');

contextBridge.exposeInMainWorld('electron', {
  get arduinoCompile() {
    return (
      checkArduinoCompile &&
      ((body) =>
        new Promise((resolve) => {
          ipcRenderer.on('arduino:compile:reply', (event, data) => resolve(data));
          ipcRenderer.send('arduino:compile', body);
        }))
    );
  },

  get bluetooth() {
    return {
      onScan(callback) {
        ipcRenderer.on('bluetooth:scan', (event, value) => callback(value));
      },
      cancel() {
        return ipcRenderer.send('bluetooth:cancel');
      },
      connect(portId) {
        return ipcRenderer.send('bluetooth:connect', portId);
      },
    };
  },

  get serial() {
    return {
      onScan(callback) {
        ipcRenderer.on('serial:scan', (event, value) => callback(value));
      },
      cancel() {
        return ipcRenderer.send('serial:cancel');
      },
      connect(portId) {
        return ipcRenderer.send('serial:connect', portId);
      },
    };
  },

  onChangeFullscreen(callback) {
    ipcRenderer.on('window:fullscreen', (event, value) => callback(value));
  },
});
