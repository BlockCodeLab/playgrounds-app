import { addLocalesMessages, Text } from '@blockcode/core';
import featureImage from './feature.png';
import iconImage from './icon.svg';

addLocalesMessages({
  en: {
    'blocks.wedo2.name': 'LEGO WeDo 2.0',
    'blocks.wedo2.description': 'Build with motors and sensors.',
    'blocks.wedo2.collaborator': 'LEGO',
  },
  'zh-Hans': {
    'blocks.wedo2.name': 'LEGO WeDo 2.0',
    'blocks.wedo2.description': '支持马达和传感器。',
    'blocks.wedo2.collaborator': 'LEGO',
  },
  'zh-Hant': {
    'blocks.wedo2.name': 'LEGO WeDo 2.0',
    'blocks.wedo2.description': '運用馬達與感測器進行創作。',
    'blocks.wedo2.collaborator': 'LEGO',
  },
});

export default {
  beta: true,
  image: featureImage,
  icon: iconImage,
  name: (
    <Text
      id="blocks.wedo2.name"
      defaultMessage="LEGO WeDo 2.0"
    />
  ),
  description: (
    <Text
      id="blocks.wedo2.description"
      defaultMessage="Build with motors and sensors."
    />
  ),
  collaborator: (
    <Text
      id="blocks.wedo2.collaborator"
      defaultMessage="iFLYTEK Spark"
    />
  ),
  tags: ['scratch'],
  bluetoothRequired: true,
};
