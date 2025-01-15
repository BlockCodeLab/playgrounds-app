import { addLocalesMessages, Text } from '@blockcode/core';
import featureImage from './feature.png';
import iconImage from './icon.png';

// 多语言信息，只包含信息显示需要的多语言，积木的多语言另外添加
addLocalesMessages({
  en: {
    'blocks.example.name': 'Example',
    'blocks.example.description': 'Blocks extension example.',
    'blocks.example.collaborator': 'Your Name',
  },
  'zh-Hans': {
    'blocks.example.name': '案例',
    'blocks.example.description': '图形积木扩展案例。',
    'blocks.example.collaborator': '你的名字',
  },
  'zh-Hant': {
    'blocks.example.name': '案例',
    'blocks.example.description': '圖形積木擴展案例。',
    'blocks.example.collaborator': '你的名字',
  },
});

export default {
  image: featureImage,
  icon: iconImage,
  name: (
    <Text
      id="blocks.example.name"
      defaultMessage="Example"
    />
  ),
  description: (
    <Text
      id="blocks.example.description"
      defaultMessage="Blocks extension example."
    />
  ),
  collaborator: (
    <Text
      id="blocks.example.collaborator"
      defaultMessage="Your Name"
    />
  ),
  // 过滤条件设置
  tags: ['example'],
};
