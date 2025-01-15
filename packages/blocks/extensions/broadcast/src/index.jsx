import { addLocalesMessages, Text } from '@blockcode/core';
import { blocks, menus } from './blocks';

import translations from './l10n.yaml';
import iconImage from './icon.png';
import broadcastFile from './broadcast.py';

addLocalesMessages(translations);

export default {
  icon: iconImage,
  name: (
    <Text
      id="blocks.broadcast.name"
      defaultMessage="Broadcast"
    />
  ),
  files: [
    {
      name: 'broadcast',
      type: 'text/x-python',
      uri: broadcastFile,
    },
  ],
  blocks,
  menus,
};
