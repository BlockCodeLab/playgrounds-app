import { addLocalesMessages, Text } from '@blockcode/core';
import featureImage from './feature.svg';
import iconImage from './icon.svg';

addLocalesMessages({
  en: {
    'blocks.request.name': 'HTTP Request',
    'blocks.request.description': 'Request network data via HTTP.',
  },
  'zh-Hans': {
    'blocks.request.name': 'HTTP 请求',
    'blocks.request.description': '通过 HTTP 请求网络数据。',
  },
  'zh-Hant': {
    'blocks.request.name': 'HTTP 請求',
    'blocks.request.description': '通過 HTTP 請求網絡數據。',
  },
});

export default {
  image: featureImage,
  icon: iconImage,
  name: (
    <Text
      id="blocks.request.name"
      defaultMessage="HTTP Request"
    />
  ),
  description: (
    <Text
      id="blocks.request.description"
      defaultMessage="Request network data via HTTP."
    />
  ),
  tags: ['data', 'communication'],
  internetRequired: true,
};
