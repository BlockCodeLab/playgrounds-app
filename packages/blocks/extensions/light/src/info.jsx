import { addLocalesMessages, Text } from '@blockcode/core';
import featureImage from './feature.png';
import iconImage from './icon.png';

export default {
  image: featureImage,
  icon: iconImage,
  name: (
    <Text
      id="blocks.light.name"
      defaultMessage="Light"
    />
  ),
  description: (
    <Text
      id="blocks.light.description"
      defaultMessage="Sense and use the light."
    />
  ),
  tags: ['scratch', 'sensor', 'display'],
};

addLocalesMessages({
  en: {
    'blocks.light.name': 'Light',
    'blocks.light.description': 'Sense and use the light.',
  },
  'zh-Hans': {
    'blocks.light.name': '灯光',
    'blocks.light.description': '感受和使用真实的光。',
  },
  'zh-Hant': {
    'blocks.light.name': '燈光',
    'blocks.light.description': '感受和使用真實的光。',
  },
});
