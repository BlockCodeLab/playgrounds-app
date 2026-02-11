import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { ipcMain } from 'electron';

import * as localPath from './local-path';

const getEditorsInfo = (path) => {
  if (!existsSync(path)) {
    return {};
  }
  const editors = readdirSync(path);
  return Object.fromEntries(
    editors
      .filter((editorDir) => existsSync(join(path, editorDir, 'package.json')))
      .map((editorDir) => {
        const info = require(join(path, editorDir, 'package.json'));
        return [
          info.name,
          {
            id: info.name,
            main: join(path, editorDir, info.exports['.'].import),
            info: join(path, editorDir, info.exports['./info'].import),
          },
        ];
      }),
  );
};

export const readLoaclEditors = () => {
  ipcMain.on('local:editors', (event) => {
    try {
      event.returnValue = getEditorsInfo(localPath.editors);
    } catch (err) {
      event.returnValue = {};
    }
  });
};
