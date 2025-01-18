import { addLocalesMessages, Text } from '@blockcode/core';
import featureImage from './feature.png';
import iconImage from './icon.png';

export default {
  eegg: 'nes',
  image: featureImage,
  icon: iconImage,
  name: (
    <Text
      id="blocks.nes.name"
      defaultMessage="NES emulator"
    />
  ),
  description: (
    <Text
      id="blocks.nes.description"
      defaultMessage="Emulates the NES game console."
    />
  ),
  tags: ['arcade'],
};

addLocalesMessages({
  en: {
    'blocks.nes.name': 'NES emulator',
    'blocks.nes.description': 'Emulates the NES game console.',
    'blocks.nes.collaborator': 'Yeqin Gong',
  },
  'zh-Hans': {
    'blocks.nes.name': 'NES 模拟器',
    'blocks.nes.description': 'NES 游戏模拟器。',
    'blocks.nes.collaborator': '龚业勤',
  },
  'zh-Hant': {
    'blocks.nes.name': 'NES 模擬器',
    'blocks.nes.description': 'NES 遊戲模擬器。',
    'blocks.nes.collaborator': '龔業勤',
  },
});
