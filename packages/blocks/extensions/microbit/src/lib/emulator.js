import { MicrobitMore } from './microbit-more';

export function emulator(runtime) {
  const microbit = new MicrobitMore(runtime);

  runtime.on('connecting', (server) => {
    microbit.connect(server);
  });

  runtime.on('disconnect', () => {
    microbit.disconnect();
  });

  return microbit;
}
