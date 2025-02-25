import { resolve } from 'node:path';

const srcDir = resolve(import.meta.dir, 'src');

export default {
  entrypoints: [resolve(srcDir, 'main.js'), resolve(srcDir, 'preload.js')],
  target: 'node',
  format: 'cjs',
  external: ['electron'],
};
