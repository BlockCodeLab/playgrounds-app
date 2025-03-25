import mqtt from 'mqtt';

export function emulator(runtime) {
  return {
    get key() {
      return 'mqtt';
    },
  };
}
