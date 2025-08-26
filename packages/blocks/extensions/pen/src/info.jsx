import { addLocalesMessages, Text } from '@blockcode/core';
import featureImage from './feature.png';
import iconImage from './icon.svg';

export default {
  image: featureImage,
  icon: iconImage,
  name: (
    <Text
      id="blocks.pen.name"
      defaultMessage="Pen"
    />
  ),
  description: (
    <Text
      id="blocks.pen.description"
      defaultMessage="Draw with your sprites."
    />
  ),
  tags: ['scratch', 'stage'],
};

addLocalesMessages({
  en: {
    'blocks.pen.name': 'Pen',
    'blocks.pen.description': 'Draw with your sprites.',
  },
  'zh-Hans': {
    'blocks.pen.name': '画笔',
    'blocks.pen.description': '绘制角色。',
  },
  'zh-Hant': {
    'blocks.pen.name': '畫筆',
    'blocks.pen.description': '繪製角色。',
  },
});
