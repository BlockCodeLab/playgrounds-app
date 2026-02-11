import { resolve } from 'node:path';
import { app } from 'electron';

export const home = resolve(app.getPath('home'), 'BlockCode');
export const blocks = resolve(home, 'blocks');
export const editors = resolve(home, 'editors');
export const tutorials = resolve(home, 'tutorials');
