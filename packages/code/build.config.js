import { resolve } from 'node:path';

const srcDir = resolve(import.meta.dir, 'src');

export default {
  entrypoints: [
    resolve(srcDir, 'index.js'),
    resolve(srcDir, 'monaco-editor/workers/editor-worker.js'),
    resolve(srcDir, 'monaco-editor/workers/css-worker.js'),
    resolve(srcDir, 'monaco-editor/workers/html-worker.js'),
    resolve(srcDir, 'monaco-editor/workers/json-worker.js'),
    resolve(srcDir, 'monaco-editor/workers/ts-worker.js'),
  ],
};
