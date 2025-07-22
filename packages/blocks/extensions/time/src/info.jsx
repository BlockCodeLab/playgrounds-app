import { addLocalesMessages, Text } from '@blockcode/core';
import featureImage from './feature.svg';
import iconImage from './icon.svg';

export default {
  name: (
    <Text
      id="blocks.time.name"
      defaultMessage="Time"
    />
  ),
  description: (
    <Text
      id="blocks.time.description"
      defaultMessage="Time in the world."
    />
  ),
  image: featureImage,
  icon: iconImage,
  tags: ['data'],
  internetRequired: true,
};

addLocalesMessages({
  en: {
    'blocks.time.name': 'Time',
    'blocks.time.description': 'Tick, tick, tick...',
  },
  'zh-Hans': {
    'blocks.time.name': '时间',
    'blocks.time.description': '嘀嗒、嘀嗒、嘀嗒…',
  },
  'zh-Hant': {
    'blocks.time.name': '時間',
    'blocks.time.description': '嘀嗒、嘀嗒、嘀嗒…',
  },
});
