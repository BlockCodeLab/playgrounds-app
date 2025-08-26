import { addLocalesMessages, Text } from '@blockcode/core';
import featureImage from './feature.png';
import iconImage from './icon.svg';

addLocalesMessages({
  en: {
    'blocks.dictionary.name': 'Dictionary',
    'blocks.dictionary.description': 'Use key-value to manage your data.',
  },
  'zh-Hans': {
    'blocks.dictionary.name': '字典',
    'blocks.dictionary.description': '使用字典管理你的数据。',
  },
  'zh-Hant': {
    'blocks.dictionary.name': '字典',
    'blocks.dictionary.description': '使用字典管理你的數據。',
  },
});

export default {
  disabled: true,
  image: featureImage,
  icon: iconImage,
  name: (
    <Text
      id="blocks.dictionary.name"
      defaultMessage="Dictionary"
    />
  ),
  description: (
    <Text
      id="blocks.dictionary.description"
      defaultMessage="Use key-value to manage your data."
    />
  ),
  tags: ['data'],
};
