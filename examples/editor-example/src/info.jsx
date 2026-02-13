import { addLocalesMessages, Text } from '@blockcode/core';
import { version } from '../package.json';
import featureImage from './feature.png';

export default {
  version,
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
  collaborator: (
    <Text
      id="example.collaborator"
      defaultMessage="Your Name"
    />
  ),
  blocksRequired: true, // 图形积木编程（仅供显示）
};

// 多语言信息，只包含信息显示需要的多语言，编辑器更多的多语言另外添加
addLocalesMessages({
  en: {
    'example.name': 'Example',
    'example.description': 'Editor example.',
    'example.collaborator': 'Your Name',
  },
  'zh-Hans': {
    'example.name': '案例',
    'example.description': '编辑器案例。',
    'example.collaborator': '你的名字',
  },
  'zh-Hant': {
    'example.name': '案例',
    'example.description': '編輯器案例。',
    'example.collaborator': '你的名字',
  },
});
