import { resolve } from 'node:path';
import { readServices } from './src/lib/read-services';

const srcDir = resolve(import.meta.dir, 'src');

const services = readServices(true);

export default {
  entrypoints: [resolve(srcDir, 'main.js'), resolve(srcDir, 'preload.js')].concat(
    services.filter(({ service }) => service).map(({ name }) => `src/${name}/service.js`),
  ),
  files: Object.fromEntries(
    services.filter(({ service }) => service).map(({ name, service }) => [`src/${name}/service.js`, service]),
  ),
  root: srcDir,
  target: 'node',
  format: 'cjs',
  minify: process.env.BUN_ENV === 'production',
  external: ['electron'],
};
