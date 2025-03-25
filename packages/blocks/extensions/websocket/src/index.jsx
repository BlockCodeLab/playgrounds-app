import { addLocalesMessages, Text } from '@blockcode/core';
import { emulator } from './emulator';
import { blocks } from './blocks';

import translations from './l10n.yaml';
import iconImage from './icon.svg';
import websocketFile from './websocket.py';

addLocalesMessages(translations);

export default {
  icon: iconImage,
  name: (
    <Text
      id="blocks.websockte.name"
      defaultMessage="WebSocket"
    />
  ),
  files: [
    {
      name: 'request',
      type: 'text/x-python',
      uri: websocketFile,
    },
  ],
  emulator,
  blocks,
};
