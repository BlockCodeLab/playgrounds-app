import JSZip from 'jszip';
import { readdirSync, existsSync, readFileSync, mkdirSync, writeFileSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { ipcMain, dialog } from 'electron';
import { escape } from './escape';

import * as localPath from './local-path';

const getBlocksInfo = (path) => {
  if (!existsSync(path)) {
    return {};
  }
  const extensions = readdirSync(path);
  return Object.fromEntries(
    extensions
      .filter((extDir) => statSync(join(path, extDir)).isDirectory())
      .map((extDir) => {
        // 编译后的扩展
        if (existsSync(join(path, extDir, 'package.json'))) {
          const info = require(join(path, extDir, 'package.json'));
          return [
            info.name,
            {
              id: info.name,
              main: join(path, extDir, info.exports['.'].import),
              info: join(path, extDir, info.exports['./info'].import),
              basepath: dirname(join(path, extDir, info.exports['./info'].import)),
            },
          ];
        }
        // 非编译扩展
        return [
          extDir,
          {
            id: extDir,
            main: join(path, extDir, 'index.js'),
            info: join(path, extDir, 'info.js'),
            basepath: join(path, extDir),
          },
        ];
      }),
  );
};

export const readLoaclBlocks = () => {
  ipcMain.on('local:blocks', (event) => {
    try {
      event.returnValue = getBlocksInfo(localPath.blocks);
    } catch (err) {
      event.returnValue = {};
    }
  });
  // 获取本地扩展的所有文件
  ipcMain.on('local:blocks:zip', (event, id) => {
    let files = [];
    try {
      files = readdirSync(join(localPath.blocks, escape(id)))
        .filter((file) => !file.endsWith('.DS_Store'))
        .map((file) => ({
          path: join(escape(id), file),
          uri: join(localPath.blocks, escape(id), file),
        }));
    } catch (err) {}
    event.reply('local:blocks:zip:reply', files);
  });
};

//
// 将用户扩展添加到本地
//
ipcMain.handle('local:blocks:select', async (event, data) => {
  if (!data) {
    const result = await dialog.showOpenDialog({
      filters: [{ name: '.zip', extensions: ['zip'] }],
      properties: ['openFile'],
    });
    if (result.canceled || result.filePaths.length === 0) return;
    data = readFileSync(result.filePaths[0]);
  } else {
    const res = await fetch(data);
    data = await res.arrayBuffer();
  }

  // 读取 ZIP 文件
  const zip = await JSZip.loadAsync(data);

  // macOS 产生系统文件
  const zipFiles = Object.values(zip.files).filter(
    (file) => !file.name.endsWith('.DS_Store') && !file.name.startsWith('__MACOSX/'),
  );

  // 查找扩展入口文件 package.json 或简单扩展（无 package.json）
  const packageEntries = Object.fromEntries(
    Object.values(zipFiles)
      .filter((file) => file.name.endsWith('package.json'))
      .map((file) => [file.name.split('/')[0], file]),
  );
  const noPackageEntries = Object.fromEntries(
    Object.values(zipFiles)
      .filter((file) => file.name.endsWith('index.js'))
      .map((file) => [file.name.split('/')[0], file]),
  );
  const entries = Object.values({ ...packageEntries, ...noPackageEntries });

  // 将每一个入口文件对应的扩展复制到本地
  for (const entry of entries) {
    const entryName = dirname(entry.name) === '.' ? '' : `${dirname(entry.name)}/`;
    const files = Object.values(zipFiles).filter((file) => !file.dir && file.name.startsWith(entryName));
    if (files.length === 0) continue;

    // 如果有 package.json 用 package.json 中的 name 作为文件夹名，避免重名
    let entryDir = entry.name.split('/')[0];
    if (entry.name.endsWith('package.json')) {
      const entryJson = JSON.parse(await entry.async('string'));
      entryDir = escape(entryJson.name);
    }

    for (const file of files) {
      const fileName = entryName ? file.name.replace(entryName, '') : file.name;
      const filePath = join(localPath.blocks, entryDir, fileName);

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
