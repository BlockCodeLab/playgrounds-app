import { dirname, resolve } from 'node:path';
import { app, BrowserWindow } from 'electron';
import { arduinoService } from 'arduino-webcli';
import { node } from '@elysiajs/node';
import { serial } from './lib/serial';
import { bluetooth } from './lib/bluetooth';
import './lib/menu';

const isMac = process.platform === 'darwin';
const isAppleSilicon = isMac && process.arch === 'arm64';

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

  // Apple Silicon 芯片跳过 Arduino 编译服务
  if (isAppleSilicon) return;

  // 启动 Arduino 编译服务
  try {
    arduinoService({
      adapter: node(),
      arduinoCliPath: app.isPackaged
        ? resolve(process.resourcesPath, 'arduino_cli')
        : resolve(process.cwd(), 'arduino_cli', `${process.platform}_${process.arch}`),
    });
  } catch (err) {}
};

app.whenReady().then(() => createWindow());

app.on('window-all-closed', () => app.quit());
