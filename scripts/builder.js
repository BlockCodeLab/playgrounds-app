import { cwd } from 'node:process';
import { resolve } from 'node:path';
import { emptyDirSync } from 'fs-extra';
import { cssLoader } from './css-loader';
import { yamlLoader } from './yaml-loader';

const isRelease = Bun.env.BUN_ENV === 'production';

const isTrue = (env) => env === 'yes' || env === 'on' || env === 'true'

const isFalse = (env) => env === 'no' || env === 'off' || env === 'false'

const getValueByPath = (res, path) => {
  if (!path) return '';
  const keys = path.split('.');
  for (const key of keys) {
    if (!res) return '';
    res = res[key];
  }
  return res;
};

export async function build(dir) {
  const { default: packageJson } = await import(resolve(cwd(), dir, 'package.json'));
  console.log(`${packageJson.name} is builing...`);

  let { default: config } = await import(resolve(cwd(), dir, 'build.config'));
  if (typeof config === 'function') {
    config = config();
  }
  if (config instanceof Promise) {
    config = await config;
  }

  // 编译选项
  //
  const options = {
    entrypoints: config.entrypoints,
    outdir: config.outdir ?? resolve(cwd(), dir, 'dist'),
    minify: config.minify ?? isRelease,
    naming: {
      asset: 'assets/[name]-[hash].[ext]',
      ...(config.naming ?? {}),
    },
    define: {
      DEBUG: JSON.stringify(Bun.env.BUN_ENV !== 'production'),
      BETA: JSON.stringify(isTrue(Bun.env.BETA)),
      ...(config.define ?? {}),
    },
    plugins: [
      yamlLoader(),
      cssLoader({
        visitor: {
          Function: {
            token(f) {
              return {
                raw: getValueByPath(config.theme, f?.arguments[0]?.value?.value),
              };
            },
          },
        },
      }),
    ].concat(config.plugins ?? []),
    external: Array.from(
      new Set(
        [
          'preact',
          'preact/hooks',
          `preact/jsx-${isRelease ? '' : 'dev-'}runtime`,
          '@preact/signals',
          '@blockcode/*',
        ].concat(config.external ?? []),
      ),
    ),
  };

  emptyDirSync(options.outdir);

  const { success, logs } = await Bun.build(options);
  if (success) {
    console.log(`${packageJson.name} is complete.`);
  } else {
    console.error(logs);
  }
}
