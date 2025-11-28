const { resolve } = require('path');
const { readdirSync, existsSync } = require('fs');

const modulesConfig = readdirSync(resolve(__dirname, './packages/gui/editors'), { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory() && existsSync(resolve(dirent.parentPath, dirent.name, 'forge.config.js')))
  .map((dirent) => require(resolve(dirent.parentPath, dirent.name, 'forge.config.js')));

module.exports = {
  packagerConfig: {
    name: 'BlockCode Playgrounds',
    icon: 'public/icon',
    appCopyright: 'Copyright(c) BlockCode Lab, 2023-2025.',
    // asar: true,
    ignore: [
      '/\\.zed($|/)',
      '/arduino_cli($|/)',
      '/docs($|/)',
      '/examples($|/)',
      '/node_modules($|/)',
      '/packages($|/)',
      '/public($|/)',
      '/scripts($|/)',
      '/src($|/)',
      '/\\.editorconfig$',
      '/\\.gitignore$',
      '/\\.gitmodules$',
      '/\\.prettierrc$',
      '/build\\.config\\.js$',
      '/bun\\.lock$',
      '/forge.config\\.js$',
      '/jsconfig\\.json$',
      '/README\\.md$',
    ],
  },
  makers: [
    {
      name: '@electron-forge/maker-zip',
    },
  ],
  hooks: {
    async generateAssets(forgeConfig, platform, arch) {
      await Promise.all(modulesConfig.map((config) => config.hooks?.generateAssets?.(forgeConfig)));
    },

    async preStart(forgeConfig) {
      await Promise.all(modulesConfig.map((config) => config.hooks?.preStart?.(forgeConfig)));
    },

    async postStart(forgeConfig, appProcess) {
      await Promise.all(modulesConfig.map((config) => config.hooks?.postStart?.(forgeConfig, appProcess)));
    },

    async prePackage(forgeConfig, platform, arch) {
      await Promise.all(modulesConfig.map((config) => config.hooks?.prePackage?.(forgeConfig, platform, arch)));
    },

    async packageAfterCopy(forgeConfig, buildPath, electronVersion, platform, arch) {
      await Promise.all(
        modulesConfig.map((config) =>
          config.hooks?.packageAfterCopy?.(forgeConfig, buildPath, electronVersion, platform, arch),
        ),
      );
    },

    async packageAfterPrune(forgeConfig, buildPath, electronVersion, platform, arch) {
      await Promise.all(
        modulesConfig.map((config) =>
          config.hooks?.packageAfterPrune?.(forgeConfig, buildPath, electronVersion, platform, arch),
        ),
      );
    },

    async packageAfterExtract(forgeConfig, buildPath, electronVersion, platform, arch) {
      await Promise.all(
        modulesConfig.map((config) =>
          config.hooks?.packageAfterExtract?.(forgeConfig, buildPath, electronVersion, platform, arch),
        ),
      );
    },

    async postPackage(forgeConfig, packageResult) {
      await Promise.all(modulesConfig.map((config) => config.hooks?.postPackage?.(forgeConfig, packageResult)));
    },

    async preMake(forgeConfig) {
      await Promise.all(modulesConfig.map((config) => config.hooks?.preMake?.(forgeConfig)));
    },

    // mutating hooks

    async postMake(forgeConfig, makeResults) {
      makeResults = [].concat(
        ...(
          await Promise.all(modulesConfig.map((config) => config.hooks?.postMake?.(forgeConfig, makeResults)))
        ).filter(Boolean),
      );
      return makeResults;
    },

    async readPackageJson(forgeConfig, packageJson) {
      packageJson = Object.assign(
        ...(await Promise.all(
          modulesConfig.map((config) => config.hooks?.readPackageJson?.(forgeConfig, packageJson)),
        )),
      );

      delete packageJson.scripts;
      delete packageJson.workspaces;
      for (const dep in packageJson.devDependencies) {
        if (dep !== 'electron') {
          delete packageJson.devDependencies[dep];
        }
      }
      return packageJson;
    },
  },
};
