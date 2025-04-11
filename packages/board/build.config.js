import { resolve } from 'node:path';

const srcDir = resolve(import.meta.dir, 'src');

export default {
  entrypoints: [resolve(srcDir, 'index.js')],
  define: {
    // 为 firmata-io 添加的环境变量
    'process.env': JSON.stringify(Bun.env),
  },
};
