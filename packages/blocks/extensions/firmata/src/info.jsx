import { addLocalesMessages, Text } from '@blockcode/core';
import featureImage from './feature.png';
import iconImage from './icon.svg';

addLocalesMessages({
  en: {
    'blocks.firmata.name': 'Arduino Firmata',
    'blocks.firmata.description': 'Communicating with Arduino via Firmata protocol.',
    'blocks.firmata.collaborator': 'Han Haoyu',
  },
  'zh-Hans': {
    'blocks.firmata.name': 'Arduino Firmata',
    'blocks.firmata.description': '通过 Firmata 协议与 Ardunio 交互。',
    'blocks.firmata.collaborator': '韩浩宇',
  },
  'zh-Hant': {
    'blocks.firmata.name': 'Arduino Firmata',
    'blocks.firmata.description': '通過 Firmata 協議與 Ardunio 交互。',
    'blocks.firmata.collaborator': '韓浩宇',
  },
});

export default {
  beta: true,
  image: featureImage,
  icon: iconImage,
  name: (
    <Text
      id="blocks.firmata.name"
      defaultMessage="Arduino Firmata"
    />
  ),
  description: (
    <Text
      id="blocks.firmata.description"
      defaultMessage="Communicating Arduino via Firmata protocol."
    />
  ),
  collaborator: (
    <Text
      id="blocks.firmata.collaborator"
      defaultMessage="Han Haoyu"
    />
  ),
  tags: ['scratch', 'firmata'],
  bluetoothRequired: true,
};
