import { readServices } from './lib/read-services' with { type: 'macro' };

import { dirname, resolve } from 'node:path';
import { app, BrowserWindow, globalShortcut, ipcMain } from 'electron';
import { serial } from './lib/serial';
import { bluetooth } from './lib/bluetooth';
import { readLoaclBlocks } from './lib/local-blocks';
import { readLoaclEditors } from './lib/local-editors';
import { readLoaclTutorials } from './lib/local-tutorials';

import * as localPath from './lib/local-path';

import './lib/menu';

const isMac = process.platform === 'darwin';

const __dirname = dirname(require.resolve('./main.js'));
const winConfig = {
  width: 1100,
  height: 760,
  webPreferences: {
    preload: resolve(__dirname, 'preload.js'),
  },
};

// 如果是 macOS 系统，隐藏标题栏
if (isMac) {
  winConfig.titleBarStyle = 'hidden';
  // 修改“🚥”位置
  winConfig.trafficLightPosition = { x: 8, y: 16 };
}

app.whenReady().then(() => {
  const mainWindow = new BrowserWindow(winConfig);

  // 注册重载快捷键
  // globalShortcut.register('CommandOrControl+R', () => {
  //   mainWindow.reload();
  // });
  globalShortcut.register('CommandOrControl+Shift+I', () => {
    mainWindow.webContents.openDevTools();
  });

  serial.setBrowserWindow(mainWindow);
  bluetooth.setBrowserWindow(mainWindow);

  mainWindow.on('enter-full-screen', () => {
    mainWindow.webContents.send('window:fullscreen', true);
  });
  mainWindow.on('leave-full-screen', () => {
    mainWindow.webContents.send('window:fullscreen', false);
  });

  mainWindow.loadFile(resolve(__dirname, 'index.html'));

  ipcMain.on('local:cwd', (event) => (event.returnValue = __dirname));
  ipcMain.on('local:home', (event) => (event.returnValue = localPath.home));

  // 读取本地资源
  readLoaclBlocks();
  readLoaclEditors();
  readLoaclTutorials();

  // 启动扩展服务
  const services = readServices();
  for (const { service } of services) {
    if (service) {
      const { default: startService } = require(service);
      startService();
    }
  }
});

app.on('window-all-closed', () => app.quit());
