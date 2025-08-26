import { addLocalesMessages, Text } from '@blockcode/core';
import featureImage from './feature.png';
import iconImage from './icon.svg';

// 多语言信息，只包含信息显示需要的多语言，积木的多语言另外添加
addLocalesMessages({
  en: {
    'blocks.microbit.name': 'micro:bit',
    'blocks.microbit.description': 'Play with all functions of micro:bit.',
    'blocks.microbit.collaborator': 'Koji Yokokawa',
  },
  'zh-Hans': {
    'blocks.microbit.name': 'micro:bit',
    'blocks.microbit.description': '玩转 micro:bit 所有功能。',
    'blocks.microbit.collaborator': 'Koji Yokokawa',
  },
  'zh-Hant': {
    'blocks.microbit.name': 'micro:bit',
    'blocks.microbit.description': '玩轉 micro:bit 所有功能。',
    'blocks.microbit.collaborator': 'Koji Yokokawa',
  },
});

export default {
  beta: true,
  image: featureImage,
  icon: iconImage,
  name: (
    <Text
      id="blocks.microbit.name"
      defaultMessage="micro:bit"
    />
  ),
  description: (
    <Text
      id="blocks.microbit.description"
      defaultMessage="Play with all functions of micro:bit."
    />
  ),
  collaborator: (
    <Text
      id="blocks.microbit.collaborator"
      defaultMessage="Koji Yokokawa"
    />
  ),
  tags: ['scratch'],
  bluetoothRequired: true,
};
