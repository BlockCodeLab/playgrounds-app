import { addLocalesMessages, Text } from '@blockcode/core';
import featureImage from './feature.svg';
import iconImage from './icon.svg';

addLocalesMessages({
  en: {
    'blocks.websocket.name': 'WebSocket',
    'blocks.websocket.description': 'Connect to WebSocket server.',
  },
  'zh-Hans': {
    'blocks.websocket.name': 'WebSocket',
    'blocks.websocket.description': '连接到 WebSocket 服务器。',
  },
  'zh-Hant': {
    'blocks.websocket.name': 'WebSocket',
    'blocks.websocket.description': '連接到 WebSocket 服務器。',
  },
});

export default {
  beta: true,
  image: featureImage,
  icon: iconImage,
  name: (
    <Text
      id="blocks.websocket.name"
      defaultMessage="WebSocket"
    />
  ),
  description: (
    <Text
      id="blocks.websocket.description"
      defaultMessage="Connect to WebSocket server."
    />
  ),
  tags: ['scratch'],
  internetRequired: true,
};
