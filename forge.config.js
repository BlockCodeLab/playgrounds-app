const arduinoConfig = require('./packages/gui/editors/arduino/forge.config');

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
    ...arduinoConfig.hooks,
    readPackageJson: (forgeConfig, packageJson) => {
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
