import { addLocalesMessages, Text } from '@blockcode/core';
import featureImage from './feature.png';
import iconImage from './icon.png';

export default {
  image: featureImage,
  icon: iconImage,
  name: (
    <Text
      id="blocks.servo.name"
      defaultMessage="Servo"
    />
  ),
  description: (
    <Text
      id="blocks.servo.description"
      defaultMessage="Standard servo module."
    />
  ),
  tags: ['device', 'actuator'],
};

addLocalesMessages({
  en: {
    'blocks.servo.name': 'Servo',
    'blocks.servo.description': 'Standard servo module.',
  },
  'zh-Hans': {
    'blocks.servo.name': '舵机',
    'blocks.servo.description': '通用舵机模块。',
  },
  'zh-Hant': {
    'blocks.servo.name': '舵機',
    'blocks.servo.description': '通用舵機模塊。',
  },
});
