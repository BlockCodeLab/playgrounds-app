import { addLocalesMessages, Text } from '@blockcode/core';
import { blocks, menus } from './lib/blocks';
import wirelesskitPyURI from './lib/wirelesskit.py';
import x16k33PyURI from './lib/x16k33.py';

import translations from './l10n.yaml';
import iconImage from './icon.svg';

addLocalesMessages(translations);

export default {
  icon: iconImage,
  files: [
    {
      name: 'wirelesskit',
      type: 'text/x-python',
      uri: wirelesskitPyURI,
    },
    {
      name: '_x16k33',
      type: 'text/x-python',
      uri: x16k33PyURI,
    },
  ],
  name: (
    <Text
      id="blocks.wirelesscodingkit.name"
      defaultMessage="Wireless Coding Kit"
    />
  ),
  blocks,
  menus,
};
