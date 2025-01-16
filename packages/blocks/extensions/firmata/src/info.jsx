import { addLocalesMessages, Text } from '@blockcode/core';
import featureImage from './feature.png';
import iconImage from './icon.png';

addLocalesMessages({
  en: {
    'blocks.firmata.name': 'Arduino Firmata',
    'blocks.firmata.description': 'Communicating with Arduino via Firmata protocol.',
  },
  'zh-Hans': {
    'blocks.firmata.name': 'Arduino Firmata',
    'blocks.firmata.description': '通过 Firmata 协议与 Ardunio 交互。',
  },
  'zh-Hant': {
    'blocks.firmata.name': 'Arduino Firmata',
    'blocks.firmata.description': '通過 Firmata 協議與 Ardunio 交互。',
  },
});

export default {
  beta: true,
  image: featureImage,
  icon: iconImage,
  name: (
    <Text
      id="blocks.firmata.name"
      defaultMessage="Arduino Firmata"
    />
  ),
  description: (
    <Text
      id="blocks.firmata.description"
      defaultMessage="Communicating Arduino via Firmata protocol."
    />
  ),
  // 过滤条件设置
  tags: ['matrix'],
};
