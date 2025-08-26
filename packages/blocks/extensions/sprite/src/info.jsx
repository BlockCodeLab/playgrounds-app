import { addLocalesMessages, Text } from '@blockcode/core';
import featureImage from './feature.png';
import iconImage from './icon.png';

addLocalesMessages({
  en: {
    'blocks.sprite.name': 'Sprite Action',
    'blocks.sprite.description': 'Make the sprite come alive.',
  },
  'zh-Hans': {
    'blocks.sprite.name': '动作精灵',
    'blocks.sprite.description': '让角色活灵活现。',
  },
  'zh-Hant': {
    'blocks.sprite.name': '動作精靈',
    'blocks.sprite.description': '讓角色活靈活現。',
  },
});

export default {
  disabled: true,
  image: featureImage,
  icon: iconImage,
  name: (
    <Text
      id="blocks.sprite.name"
      defaultMessage="Sprite Action"
    />
  ),
  description: (
    <Text
      id="blocks.sprite.description"
      defaultMessage="Make the sprite come alive."
    />
  ),
  tags: ['scratch'],
};
