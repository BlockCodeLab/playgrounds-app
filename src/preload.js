import { contextBridge, ipcRenderer } from 'electron/renderer';

contextBridge.exposeInMainWorld('electron', {
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
