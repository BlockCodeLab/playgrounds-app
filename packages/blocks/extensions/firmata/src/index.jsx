import { addLocalesMessages, Text } from '@blockcode/core';
import { emulator } from './emulator';
import { blocks } from './blocks';

import translations from './l10n.yaml';
import iconImage from './icon.png';

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
      // serial: {
      //   filters: [],
      // },
      bluetooth: {
        filters: [],
      },
    },
  },
  emulator,
  blocks,
};
