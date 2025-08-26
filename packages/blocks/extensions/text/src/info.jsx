import { addLocalesMessages, Text } from '@blockcode/core';
import featureImage from './feature.png';
import iconImage from './icon.svg';

// 多语言信息，只包含信息显示需要的多语言，积木的多语言另外添加
addLocalesMessages({
  en: {
    'blocks.text.name': 'Animated Text',
    'blocks.text.description': 'Bring words to life.',
  },
  'zh-Hans': {
    'blocks.text.name': '动画文字',
    'blocks.text.description': '让文字鲜活起来。',
  },
  'zh-Hant': {
    'blocks.text.name': '動畫文字',
    'blocks.text.description': '讓文字鮮活起來。',
  },
});

export default {
  disabled: true,
  image: featureImage,
  icon: iconImage,
  name: (
    <Text
      id="blocks.text.name"
      defaultMessage="Animated Text"
    />
  ),
  description: (
    <Text
      id="blocks.text.description"
      defaultMessage="Bring words to life."
    />
  ),
  tags: ['scratch'],
};
