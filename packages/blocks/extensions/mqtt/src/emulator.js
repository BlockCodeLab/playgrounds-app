import mqtt from 'mqtt';

export function emulator(runtime) {
  let mqttClient = null;

  runtime.on('stop', () => {
    if (mqttClient) {
      mqttClient.end();
    }
  });

  return {
    get key() {
      return 'mqtt';
    },

    async connect(url) {
      try {
        mqttClient = await mqtt.connectAsync(url);
        mqttClient.on('message', () => {});
        runtime.run('mqtt.connected');
      } catch (err) {
        mqttClient = null;
      }
    },

    isConnected() {
      return mqttClient?.connected;
    },
  };
}
