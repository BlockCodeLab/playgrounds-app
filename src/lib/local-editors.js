import { readdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { app, ipcMain } from 'electron';

const localEditorsPath = resolve(app.getPath('home'), 'BlockCode/editors');

const getEditorsInfo = (path) => {
  if (!existsSync(path)) {
    return {};
  }
  const editors = readdirSync(path);
  return Object.fromEntries(
    editors
      .filter((editorDir) => existsSync(resolve(path, editorDir, 'package.json')))
      .map((editorDir) => {
        const info = require(resolve(path, editorDir, 'package.json'));
        return [
          info.name,
          {
            id: info.name,
            main: resolve(path, editorDir, info.exports['.'].import),
            info: resolve(path, editorDir, info.exports['./info'].import),
          },
        ];
      }),
  );
};

export const readLoaclEditors = () => {
  ipcMain.on('local:editors', (event) => {
    try {
      event.returnValue = getEditorsInfo(localEditorsPath);
    } catch (err) {
      event.returnValue = {};
    }
  });
};
