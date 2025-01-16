import { addLocalesMessages, Text } from '@blockcode/core';
import featureImage from './feature.png';
import iconImage from './icon.png';

export default {
  image: featureImage,
  icon: iconImage,
  name: (
    <Text
      id="blocks.broadcast.name"
      defaultMessage="ESP-Now Broadcast"
    />
  ),
  description: (
    <Text
      id="blocks.broadcast.description"
      defaultMessage="Broadcast the messages via the ESP-Now."
    />
  ),
  tags: ['mpy', 'device', 'communication', 'data'],
};

addLocalesMessages({
  en: {
    'blocks.broadcast.name': 'ESP-Now Broadcast',
    'blocks.broadcast.description': 'Broadcast the messages via the ESP-Now.',
  },
  'zh-Hans': {
    'blocks.broadcast.name': 'ESP-Now 无线广播',
    'blocks.broadcast.description': '通过 ESP-Now 广播消息。',
  },
  'zh-Hant': {
    'blocks.broadcast.name': 'ESP-Now 無線廣播',
    'blocks.broadcast.description': '通過 ESP-Now 廣播消息。',
  },
});
