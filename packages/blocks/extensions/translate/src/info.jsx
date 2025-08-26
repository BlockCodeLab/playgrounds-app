import { addLocalesMessages, Text } from '@blockcode/core';
import featureImage from './feature.png';
import iconImage from './icon.png';

addLocalesMessages({
  en: {
    'blocks.translate.name': 'Translate',
    'blocks.translate.description': 'Translate Text into many languages.',
    'blocks.translate.collaborator': 'iFLYTEK Spark',
  },
  'zh-Hans': {
    'blocks.translate.name': '翻译',
    'blocks.translate.description': '把文字翻译成多种语言。',
    'blocks.translate.collaborator': '讯飞星火',
  },
  'zh-Hant': {
    'blocks.translate.name': '翻譯',
    'blocks.translate.description': '把文字翻譯成多種語言。',
    'blocks.translate.collaborator': '訊飛星火',
  },
});

export default {
  image: featureImage,
  icon: iconImage,
  name: (
    <Text
      id="blocks.translate.name"
      defaultMessage="Translate"
    />
  ),
  description: (
    <Text
      id="blocks.translate.description"
      defaultMessage="Translate Text into many languages."
    />
  ),
  collaborator: (
    <Text
      id="blocks.translate.collaborator"
      defaultMessage="iFLYTEK Spark"
    />
  ),
  tags: ['data', 'ai', 'llm'],
  internetRequired: true,
};
