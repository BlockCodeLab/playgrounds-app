import http from 'node:http';
import handler from 'serve-handler';

import { cwd, argv } from 'node:process';
import { dirname, basename, join, relative, resolve } from 'node:path';
import { readdirSync, existsSync, watch, watchFile } from 'node:fs';
import { emptyDirSync } from 'fs-extra';
import { copyfile, copydir } from './copy.js';
import { workspaces } from '../package.json';

const DIST_DIR = 'dist';
const ASSETS_DIR = 'assets';
const INDEX_HTML = 'index.html';

const distDir = resolve(cwd(), DIST_DIR);
const publicDir = resolve(cwd(), 'public');

const isDev = Bun.env.BUN_ENV !== 'production';
const isWatch = argv[2] === 'watch';
const isClean = argv[2] === 'clean';

if (isClean) {
  emptyDirSync(distDir);
}

if (isWatch) {
  http
    .createServer((req, res) =>
      handler(req, res, {
        public: distDir,
      }),
    )
    .listen(3000, () => {
      console.log('Running at http://localhost:3000');
    });
}

// 复制 public 文件夹
copydir(publicDir, distDir);

// 复制并监控项目
const watchAndCopyfile = (src, dist) => {
  copyfile(src, dist);
  // 添加监控
  if (isWatch) {
    watchFile(src, () => copyfile(src, dist));
  }
};

// 复制并监控资源
const watchAndCopydir = (src, dist) => {
  copydir(src, dist);
  // 添加监控
  if (isWatch) {
    let timer = null;
    let timestamp = 0;
    watch(src, (_, f) => {
      timestamp = Date.now();
      if (!timer) {
        timer = setInterval(() => {
          if (Date.now() - timestamp < 1000) return;
          copydir(src, dist);
          clearInterval(timer);
          timer = null;
        }, 1000);
      }
    });
  }
};

// 合并子模块和库文件
//
(async (imports) => {
  // 核心 Preact 库文件
  //
  const runtimeFile = `preact/jsx-${isDev ? 'dev-' : ''}runtime`;
  imports.preact = './preact/index.mjs';
  imports['preact/hooks'] = './preact/hooks.mjs';
  imports[runtimeFile] = `./${runtimeFile}.mjs`;
  imports['@preact/signals'] = './preact/signals.mjs';
  imports['@preact/signals-core'] = './preact/signals-core.mjs';

  // 复制文件
  copyfile(Bun.resolveSync('preact', '.'), resolve(distDir, 'preact/index.mjs'));
  copyfile(Bun.resolveSync('preact/hooks', '.'), resolve(distDir, 'preact/hooks.mjs'));
  copyfile(Bun.resolveSync(runtimeFile, '.'), resolve(distDir, `${runtimeFile}.mjs`));
  copyfile(Bun.resolveSync('@preact/signals', '.'), resolve(distDir, 'preact/signals.mjs'));
  copyfile(Bun.resolveSync('@preact/signals-core', '.'), resolve(distDir, 'preact/signals-core.mjs'));

  // 子模块文件
  //
  for (const workspace of workspaces) {
    let path = resolve(cwd(), workspace.slice(0, -1));
    const dirs = readdirSync(path, { withFileTypes: true }).filter((d) => d.isDirectory());
    for (const dir of dirs) {
      // 读取子模块 package.json
      path = resolve(dir.parentPath, dir.name, 'package.json');
      if (!existsSync(path)) continue;
      path = relative(import.meta.dir, path);
      path = path[0] !== '.' ? `./${path}` : path;
      const { default: packageJson } = await import(path);

      // 复制文件
      if (packageJson.exports) {
        for (const id in packageJson.exports) {
          const src = resolve(dir.parentPath, dir.name, packageJson.exports[id].import);
          const file = `${packageJson.name}/${basename(src)}`;
          imports[join(packageJson.name, id)] = `./${file}`;
          watchAndCopyfile(src, resolve(distDir, file));
        }
      } else if (packageJson.module) {
        const src = resolve(dir.parentPath, dir.name, packageJson.module);
        const file = `${packageJson.name}/${basename(packageJson.module)}`;
        imports[packageJson.name] = `./${file}`;
        watchAndCopyfile(src, resolve(distDir, file));
      }

      // 复制资源
      path = resolve(dir.parentPath, dir.name, DIST_DIR, ASSETS_DIR);
      if (!existsSync(path)) continue;
      watchAndCopydir(path, resolve(distDir, ASSETS_DIR));
    }
  }

  // 生成 index.html 文件
  //
  const file = resolve(publicDir, INDEX_HTML);
  const html = await Bun.file(file).text();
  const content = html.replace(
    '<script type="importmap"></script>',
    `<script type="importmap">{"imports":${JSON.stringify(imports)}}</script>`,
  );
  const outpath = resolve(distDir, INDEX_HTML);
  Bun.write(outpath, content);
})({});
