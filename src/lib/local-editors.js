import { readdirSync, statSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { app, ipcMain } from 'electron';

const getEditorsInfo = () => {
  const path = resolve(app.getPath('home'), 'BlockCode/editors');
  if (!existsSync(path)) {
    return {};
  }
  const extensions = readdirSync(path);
  return Object.fromEntries(
    extensions
      .filter((extdir) => statSync(resolve(path, extdir)).isDirectory())
      .map((extdir) => {
        const info = require(resolve(path, extdir, 'package.json'));
        return [
          info.name,
          {
            id: info.name,
            main: resolve(path, extdir, info.exports['.'].import),
            info: resolve(path, extdir, info.exports['./info'].import),
          },
        ];
      }),
  );
};

export const readLoaclEditors = () => {
  ipcMain.on('local:editors', (event) => {
    event.returnValue = getEditorsInfo();
  });
};
