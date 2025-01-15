import { addLocalesMessages, Text } from '@blockcode/core';
import { version } from '../package.json';
import featureImage from './feature.png';

// 多语种信息
addLocalesMessages({
  en: {
    'example.name': 'Example',
    'example.description': 'Example editor.',
  },
  'zh-Hans': {
    'example.name': '案例',
    'example.description': '案例编辑器。',
  },
  'zh-Hant': {
    'example.name': '案例',
    'example.description': '案例编辑器。',
  },
});

export default {
  version,
  // sortIndex: 1xxxx, // 社区组 10000～19999
  image: featureImage, // 主题图片
  name: (
    <Text
      id="example.name"
      defaultMessage="Example"
    />
  ),
  description: (
    <Text
      id="example.description"
      defaultMessage="Example editor."
    />
  ),
  blocksRequired: true, // 图形积木（仅供显示）
};
