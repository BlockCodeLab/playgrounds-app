// bun macro
import { resolve } from 'node:path';
import { readdirSync, readFileSync, existsSync } from 'node:fs';

const DIST_DIR = 'dist';
const INFO_FILE = 'info.js';

export function readExtensions() {
  return readdirSync(resolve(import.meta.dir, '../../extensions'), { withFileTypes: true })
    .filter((dirent) => {
      if (!dirent.isDirectory()) {
        return false;
      }
      const infoFile = resolve(dirent.parentPath, dirent.name, DIST_DIR, INFO_FILE);
      return existsSync(infoFile);
    })
    .sort((a, b) => {
      // 按名称排序
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    })
    .map((dirent) => {
      const path = resolve(dirent.parentPath, dirent.name, 'package.json');
      const data = readFileSync(path);
      const packageJson = JSON.parse(data);
      return packageJson.name;
    });
}
