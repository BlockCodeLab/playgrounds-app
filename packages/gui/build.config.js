import { resolve } from 'node:path';

const srcDir = resolve(import.meta.dir, 'src');

export default {
  entrypoints: [resolve(srcDir, 'index.jsx')],
};
