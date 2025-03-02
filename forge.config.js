module.exports = {
  packagerConfig: {
    name: 'BlockCode Playgrounds',
    icon: 'public/icon',
    appCopyright: 'Copyright(c) BlockCode Lab, 2023-2025.',
    asar: true,
    ignore: [
      'docs',
      'examples',
      'packages',
      'node_modules',
      'public',
      'scripts',
      'src',
      '.editorconfig',
      '.gitignore',
      '.gitmodules',
      '.prettierrc',
      'bun.lockb',
      'build.config.js',
      'forge.config.js',
      'jsconfig.json',
      'README.md',
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
  },
};
