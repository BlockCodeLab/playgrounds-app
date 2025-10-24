import { dirname, resolve } from 'node:path';
import { app, BrowserWindow, globalShortcut } from 'electron';
import { serial } from './lib/serial';
import { bluetooth } from './lib/bluetooth';
import { arduinoService } from './lib/arduino-service';
import { readLoaclBlocks } from './lib/local-blocks';
import { readLoaclEditors } from './lib/local-editors';
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

const createWindow = () => {
  const mainWindow = new BrowserWindow(winConfig);

  // 注册重载快捷键
  globalShortcut.register('CommandOrControl+R', () => {
    if (mainWindow) {
      mainWindow.reload();
    }
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
  if (DEBUG) {
    mainWindow.webContents.openDevTools();
  }

  // 读取本地扩展
  readLoaclBlocks();
  readLoaclEditors();

  // 启动 Arduino 编译服务
  arduinoService();
};

app.whenReady().then(() => createWindow());

app.on('window-all-closed', () => app.quit());
