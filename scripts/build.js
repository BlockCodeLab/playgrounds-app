import { argv } from 'node:process';
import { build } from './builder';

for (const dir of argv.slice(2)) {
  try {
    await build(dir);
  } catch (err) {
    console.error(err);
  }
}
