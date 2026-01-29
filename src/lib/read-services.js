import { resolve } from 'node:path';
import { readdirSync, readFileSync, existsSync } from 'node:fs';

export function readServices(bundler = false) {
  const dirs = readdirSync(resolve(import.meta.dir, '../../packages/gui/editors'), { withFileTypes: true }).filter(
    (dirent) => dirent.isDirectory() && existsSync(resolve(dirent.parentPath, dirent.name, 'package.json')),
  );

  const services = [];
  for (const dirent of dirs) {
    const data = readFileSync(resolve(dirent.parentPath, dirent.name, 'package.json'));
    const packageJson = JSON.parse(data);
    const serviceConfig = packageJson['electron-service'];
    if (serviceConfig) {
      services.push({
        name: packageJson.name,
        service: serviceConfig.service
          ? bundler
            ? readFileSync(resolve(dirent.parentPath, dirent.name, serviceConfig.service))
            : `./${packageJson.name}/service.js`
          : false,
        preload: serviceConfig.preload
          ? bundler
            ? readFileSync(resolve(dirent.parentPath, dirent.name, serviceConfig.preload))
            : `./${packageJson.name}/preload.js`
          : false,
      });
    }
  }
  return services;
}
