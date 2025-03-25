import { resolve } from 'node:path';

const srcDir = resolve(import.meta.dir, 'src');

export default {
  entrypoints: [
    resolve(srcDir, 'index.js'),
    resolve(srcDir, 'assets/workers/editor-worker.js'),
    resolve(srcDir, 'assets/workers/css-worker.js'),
    resolve(srcDir, 'assets/workers/html-worker.js'),
    resolve(srcDir, 'assets/workers/json-worker.js'),
    resolve(srcDir, 'assets/workers/ts-worker.js'),
  ],
};
