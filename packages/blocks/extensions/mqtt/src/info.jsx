import { addLocalesMessages, Text } from '@blockcode/core';
import featureImage from './feature.svg';
import iconImage from './icon.svg';

addLocalesMessages({
  en: {
    'blocks.mqtt.name': 'MQTT',
    'blocks.mqtt.description': 'The standard for IoT messaging.',
  },
  'zh-Hans': {
    'blocks.mqtt.name': 'MQTT',
    'blocks.mqtt.description': '让万物互联的消息。',
  },
  'zh-Hant': {
    'blocks.mqtt.name': 'MQTT',
    'blocks.mqtt.description': '让万物互联的消息。',
  },
});

export default {
  beta: true,
  image: featureImage,
  icon: iconImage,
  name: (
    <Text
      id="blocks.mqtt.name"
      defaultMessage="MQTT"
    />
  ),
  description: (
    <Text
      id="blocks.mqtt.description"
      defaultMessage="The standard for IoT messaging."
    />
  ),
  tags: ['data', 'communication'],
  internetRequired: true,
};
