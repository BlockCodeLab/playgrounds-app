// bun macro
import { resolve } from 'node:path';
import { readdirSync, readFileSync, existsSync } from 'node:fs';

export function readServices() {
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
        service: serviceConfig.service ? resolve(dirent.parentPath, dirent.name, serviceConfig.service) : '',
        preload: serviceConfig.preload ? resolve(dirent.parentPath, dirent.name, serviceConfig.preload) : '',
      });
    }
  }

  return services;
}
