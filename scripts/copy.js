import { dirname, extname, resolve } from 'node:path';
import { readdirSync, existsSync, watchFile } from 'node:fs';
import { mkdirp } from 'mkdirp';

const isDev = Bun.env.BUN_ENV !== 'production';

function _copyfile(from, to) {
  if (!existsSync(from)) return;
  mkdirp.sync(dirname(to));
  return Bun.write(to, Bun.file(from));
}

export function copyfile(from, to) {
  _copyfile(from, to);
  if (isDev && existsSync(from)) {
    watchFile(from, () => _copyfile(from, to));
  }
}

export function copydir(from, to, match) {
  if (!existsSync(from)) return;
  readdirSync(from, { withFileTypes: true })
    .filter((dirent) => {
      if (!match) return true;

      const inputPath = resolve(from, dirent.name);
      if (!existsSync(inputPath)) return false;

      if (typeof match === 'function') {
        return match(dirent.name, stat);
      }

      switch (match) {
        case '*':
        case 'all':
          return true;
        case 'file':
          return dirent.isFile();
        case 'directory':
          return dirent.isDirectory();
        default:
          if (match[0] === '.') {
            return extname(dirent.name) === match;
          }
          return false;
      }
    })
    .forEach((dirent) => {
      const inputPath = resolve(from, dirent.name);
      const outputPath = resolve(to, dirent.name);
      if (dirent.isDirectory()) {
        return copydir(inputPath, outputPath, match);
      }
      return copyfile(inputPath, outputPath);
    });
}
