import { MicrobitMore } from './microbit-more';
import { MicrobitUtils } from './microbit-utils';

export function emulator(runtime) {
  const microbit = new MicrobitMore(runtime);
  const utils = new MicrobitUtils(microbit);

  runtime.on('connecting', (server) => {
    microbit.connect(server);
  });

  runtime.on('disconnect', () => {
    microbit.disconnect();
  });

  return utils;
}
