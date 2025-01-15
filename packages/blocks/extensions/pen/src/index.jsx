import { addLocalesMessages, Text } from '@blockcode/core';
import { emulator } from './emulator';
import { blocks, menus } from './blocks';

import translations from './l10n.yaml';
import iconImage from './icon.svg';
import penFile from './pen.py';

addLocalesMessages(translations);

export default {
  icon: iconImage,
  name: (
    <Text
      id="blocks.pen.name"
      defaultMessage="Pen"
    />
  ),
  files: [
    {
      name: 'pen',
      type: 'text/x-python',
      uri: penFile,
    },
  ],
  emulator,
  blocks,
  menus,
};
