import { resolve } from 'node:path';
import colors from './src/css/colors.toml';

const srcDir = resolve(import.meta.dir, 'src');

export default {
  entrypoints: [resolve(srcDir, 'index.js')],
  theme: colors,
};
