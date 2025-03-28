import { addLocalesMessages, Text } from '@blockcode/core';
import { emulator } from './emulator';
import { blocks, menus } from './blocks';

import translations from './l10n.yaml';
import iconImage from './icon.svg';

addLocalesMessages(translations);

export default {
  icon: iconImage,
  name: (
    <Text
      id="blocks.firmata.name"
      defaultMessage="Arduino Firmata"
    />
  ),
  statusButton: {
    connectionOptions: {
      serial: {
        filters: [],
      },
      bluetooth: {
        filters: [{ services: ['0000ffe0-0000-1000-8000-00805f9b34fb'] }],
      },
    },
  },
  emulator,
  blocks,
  menus,
};
