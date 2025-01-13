module.exports = {
  packagerConfig: {
    name: 'The BlockCode Playgrounds',
    icon: 'public/icon',
    appCopyright: 'Copyright(c) BlockCode Lab, 2023-2024.',
    asar: true,
    ignore: [
      /^\/docs\//g,
      /^\/packages\//g,
      /^\/public\//g,
      /^\/scripts\//g,
      /^\/src\//g,
      /^\..*/g,
      'bun.lockb',
      'forge.config.js',
      'jsconfig.json',
      'README.md',
    ],
  },
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        setupIcon: 'apps/desktop/res/icon.ico',
      },
    },
    {
      name: '@electron-forge/maker-dmg',
    },
  ],
  hooks: {
    readPackageJson: async (forgeConfig, packageJson) => {
      delete packageJson.scripts;
      delete packageJson.devDependencies;
      delete packageJson.workspaces;
      return packageJson;
    },
  },
};
