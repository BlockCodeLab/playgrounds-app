import { addLocalesMessages, Text } from '@blockcode/core';
import featureImage from './feature.svg';
import iconImage from './icon.svg';

addLocalesMessages({
  en: {
    'blocks.brain.name': 'Brain',
    'blocks.brain.description': 'Make your projects smarter.',
    'blocks.brain.collaborator': 'iFLYTEK Spark',
  },
  'zh-Hans': {
    'blocks.brain.name': '智脑',
    'blocks.brain.description': '让你的作品变得聪明起来。',
    'blocks.brain.collaborator': '讯飞星火',
  },
  'zh-Hant': {
    'blocks.brain.name': '智腦',
    'blocks.brain.description': '讓你的作品變得聰明起來。',
    'blocks.brain.collaborator': '訊飛星火',
  },
});

export default {
  image: featureImage,
  icon: iconImage,
  name: (
    <Text
      id="blocks.brain.name"
      defaultMessage="Brain"
    />
  ),
  description: (
    <Text
      id="blocks.brain.description"
      defaultMessage="Make your projects smarter."
    />
  ),
  collaborator: (
    <Text
      id="blocks.brain.collaborator"
      defaultMessage="iFLYTEK Spark"
    />
  ),
  tags: ['data', 'ai'],
  internetRequired: true,
};
