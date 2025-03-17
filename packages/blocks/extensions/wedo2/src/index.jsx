import { addLocalesMessages, Text } from '@blockcode/core';
import { BLEService } from './lib/wedo2';
// import { emulator } from './lib/emulator';
import { blocks, menus } from './lib/blocks';
import wedo2PyURI from './lib/wedo2.py';

import translations from './l10n.yaml';
import iconImage from './icon.svg';

addLocalesMessages(translations);

export default {
  icon: iconImage,
  name: (
    <Text
      id="blocks.wedo2.name"
      defaultMessage="LEGO WeDo 2.0"
    />
  ),
  files: [
    {
      name: 'wedo2',
      type: 'text/x-python',
      uri: wedo2PyURI,
    },
  ],
  statusButton: {
    connectionOptions: {
      bluetooth: {
        filters: [{ services: [BLEService.DEVICE_SERVICE] }],
        optionalServices: [BLEService.IO_SERVICE],
      },
    },
  },
  // emulator,
  blocks,
  menus,
};
