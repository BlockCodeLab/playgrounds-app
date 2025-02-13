import { addLocalesMessages, Text } from '@blockcode/core';
import { MM_SERVICE } from './lib/microbit-more';
import { emulator } from './lib/emulator';
import { blocks, menus } from './lib/blocks';

import translations from './l10n.yaml';
import iconImage from './icon.svg';

addLocalesMessages(translations);

export default {
  icon: iconImage,
  name: (
    <Text
      id="blocks.microbit.name"
      defaultMessage="micro:bit"
    />
  ),
  statusButton: {
    connectionOptions: {
      bluetooth: {
        filters: [{ namePrefix: 'BBC micro:bit' }, { services: [MM_SERVICE.ID] }],
      },
    },
  },
  emulator,
  blocks,
  menus,
};
