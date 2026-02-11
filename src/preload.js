import { readServices } from './lib/read-services' with { type: 'macro' };

import { contextBridge, ipcRenderer } from 'electron/renderer';

const electronObj = {
  cwd() {
    return ipcRenderer.sendSync('local:cwd');
  },

  home() {
    return ipcRenderer.sendSync('local:home');
  },

  loadBlocksZip() {
    return ipcRenderer.invoke('local:blocks:select');
  },

  getLocalBlocks() {
    return ipcRenderer.sendSync('local:blocks');
  },

  getLocalEditors() {
    return ipcRenderer.sendSync('local:editors');
  },

  getLocalTutorials(editorOrBlockId, lang) {
    return ipcRenderer.sendSync('local:tutorials', editorOrBlockId, lang);
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
};

// 载入扩展服务
(async () => {
  const services = readServices();
  for (const { preload } of services) {
    if (preload) {
      const { default: getService } = await import(preload);
      const service = getService(ipcRenderer);
      Object.assign(electronObj, service);
    }
  }

  // 添加 window.electron
  contextBridge.exposeInMainWorld('electron', electronObj);
})();
