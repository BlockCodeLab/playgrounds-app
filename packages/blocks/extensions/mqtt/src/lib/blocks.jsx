import { Text } from '@blockcode/core';

export const blocks = [
  {
    id: 'connect',
    text: (
      <Text
        id="blocks.mqtt.connect"
        defaultMessage="connect to [URL]"
      />
    ),
    inputs: {
      URL: {
        type: 'string',
        defaultValue: 'mqtt://test.mosquitto.org:1883',
      },
    },
    emu(block) {},
  },
  '---',
  {
    id: 'subscribe',
    text: (
      <Text
        id="blocks.mqtt.subscribe"
        defaultMessage="subscribe topic [TOPIC]"
      />
    ),
    inputs: {
      TOPIC: {
        type: 'string',
        defaultValue: (
          <Text
            id="blocks.mqtt.messageTopic"
            defaultMessage="topic"
          />
        ),
      },
    },
  },
  {
    id: 'publish',
    text: (
      <Text
        id="blocks.mqtt.publish"
        defaultMessage="publish message [MESSAGE] to topic [TOPIC]"
      />
    ),
    inputs: {
      MESSAGE: {
        type: 'string',
        defaultValue: (
          <Text
            id="blocks.mqtt.messageContent"
            defaultMessage="hello"
          />
        ),
      },
      TOPIC: {
        type: 'string',
        defaultValue: (
          <Text
            id="blocks.mqtt.messageTopic"
            defaultMessage="greeting"
          />
        ),
      },
    },
  },
  '---',
  {
    id: 'whenReceived',
    hat: true,
    text: (
      <Text
        id="blocks.mqtt.whenReceived"
        defaultMessage="when received from topic [TOPIC]"
      />
    ),
    inputs: {
      TOPIC: {
        type: 'string',
        defaultValue: (
          <Text
            id="blocks.mqtt.messageTopic"
            defaultMessage="greeting"
          />
        ),
      },
    },
  },
  {
    id: 'message',
    text: (
      <Text
        id="blocks.mqtt.message"
        defaultMessage="last message from [TOPIC]"
      />
    ),
    output: 'string',
    inputs: {
      TOPIC: {
        type: 'string',
        defaultValue: (
          <Text
            id="blocks.mqtt.messageTopic"
            defaultMessage="greeting"
          />
        ),
      },
    },
  },
  '---',
  {
    id: 'whenConnected',
    text: (
      <Text
        id="blocks.mqtt.whenConnected"
        defaultMessage="when connected to MQTT server"
      />
    ),
    hat: true,
  },
  {
    id: 'isConnected',
    text: (
      <Text
        id="blocks.mqtt.isConnected"
        defaultMessage="is connected?"
      />
    ),
    output: 'boolean',
  },
  '---',
  {
    id: 'close',
    text: (
      <Text
        id="blocks.mqtt.close"
        defaultMessage="close connection"
      />
    ),
  },
];
