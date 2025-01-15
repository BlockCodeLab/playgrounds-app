import { resolve } from 'node:path';
import copy from 'bun-copy-plugin';

const projectDir = import.meta.dir;
const srcDir = resolve(projectDir, 'src');
const distDir = resolve(projectDir, 'dist');

export default {
  entrypoints: [resolve(srcDir, 'index.js')],
  outdir: distDir,
  plugins: [
    copy(
      `${resolve(Bun.resolveSync('scratch-blocks', projectDir), '../../media')}/`,
      resolve(distDir, 'assets/blocks-media'),
    ),
  ],
};
