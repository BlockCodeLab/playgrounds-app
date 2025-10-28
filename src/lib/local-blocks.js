import JSZip from 'jszip';
import { readdirSync, existsSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { app, ipcMain, dialog } from 'electron';
import { escape } from './escape';

const localBlocksPath = resolve(app.getPath('home'), 'BlockCode/blocks');

const getBlocksInfo = (path) => {
  if (!existsSync(path)) {
    return {};
  }
  const extensions = readdirSync(path);
  return Object.fromEntries(
    extensions
      .filter((extDir) => existsSync(resolve(path, extDir, 'package.json')))
      .map((extDir) => {
        const info = require(resolve(path, extDir, 'package.json'));
        return [
          info.name,
          {
            id: info.name,
            main: resolve(path, extDir, info.exports['.'].import),
            info: resolve(path, extDir, info.exports['./info'].import),
          },
        ];
      }),
  );
};

export const readLoaclBlocks = () => {
  ipcMain.on('local:blocks', (event) => {
    try {
      event.returnValue = getBlocksInfo(localBlocksPath);
    } catch (err) {
      event.returnValue = {};
    }
  });
};

//
// 将用户扩展添加到本地
//
ipcMain.handle('local:blocks:select', async () => {
  const result = await dialog.showOpenDialog({
    filters: [{ name: '.zip', extensions: ['zip'] }],
    properties: ['openFile'],
  });
  if (result.canceled || result.filePaths.length === 0) return;

  // 读取 ZIP 文件
  const data = readFileSync(result.filePaths[0]);
  const zip = await JSZip.loadAsync(data);

  // macOS 产生系统文件
  const zipFiles = Object.values(zip.files).filter(
    (file) => !file.name.endsWith('.DS_Store') && !file.name.startsWith('__MACOSX/'),
  );

  // 查找扩展入口文件 package.json
  const entries = Object.values(zipFiles).filter((file) => file.name.endsWith('package.json'));

  // 将每一个入口文件对应的扩展复制到本地
  for (const entry of entries) {
    const entryName = dirname(entry.name) === '.' ? '' : `${dirname(entry.name)}/`;
    const files = Object.values(zipFiles).filter((file) => !file.dir && file.name.startsWith(entryName));
    if (files.length === 0) continue;

    // 用 package.json 中的 name 作为文件夹名，避免重名
    const entryJson = JSON.parse(await entry.async('string'));
    const entryDir = escape(entryJson.name);

    for (const file of files) {
      const fileName = entryName ? file.name.replace(entryName, '') : file.name;
      const filePath = resolve(localBlocksPath, entryDir, fileName);

      // 创建目录
      const dirPath = dirname(filePath);
      if (!existsSync(dirPath)) {
        mkdirSync(dirPath, { recursive: true });
      }

      // 写入文件
      const content = await file.async('nodebuffer');
      writeFileSync(filePath, content);
    }
  }
});
