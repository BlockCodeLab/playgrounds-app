const { resolve } = require('node:path');
const { copydir } = require('./scripts/copy');

module.exports = {
  packagerConfig: {
    name: 'BlockCode Playgrounds',
    icon: 'public/icon',
    appCopyright: 'Copyright(c) BlockCode Lab, 2023-2025.',
    asar: true,
    ignore: [
      '/.zed/',
      '/arduino/',
      '/docs/',
      '/examples/',
      '/packages/',
      '/node_modules/',
      '/public/',
      '/scripts/',
      '/src/',
      '/.editorconfig',
      '/.gitignore',
      '/.gitmodules',
      '/.prettierrc',
      '/bun.lock',
      '/build.config.js',
      '/forge.config.js',
      '/jsconfig.json',
      '/README.md',
    ],
  },
  makers: [
    {
      name: '@electron-forge/maker-zip',
    },
  ],
  hooks: {
    readPackageJson: async (forgeConfig, packageJson) => {
      delete packageJson.scripts;
      delete packageJson.workspaces;
      for (const dep in packageJson.devDependencies) {
        if (!dep.includes('electron')) {
          delete packageJson.devDependencies[dep];
        }
      }
      return packageJson;
    },
    // 将 arduino-cli 复制到 resources 文件夹
    packageAfterCopy: async (forgeConfig, buildPath, electronVersion, platform, arch) => {
      const assetsDir = resolve(__dirname, `arduino_cli/${platform}_${arch}`);
      const resourcesDir = resolve(buildPath, '../arduino_cli');
      copydir(assetsDir, resourcesDir);
    },
  },
};
