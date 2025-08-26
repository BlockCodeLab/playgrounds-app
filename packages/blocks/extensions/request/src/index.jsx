import { addLocalesMessages, Text } from '@blockcode/core';
import { emulator } from './lib/emulator';
import { blocks } from './lib/blocks';
import requestFile from './lib/request.py';
import aiohttpFile from './lib/aiohttp.py';
import aiohttpWsFile from './lib/aiohttp_ws.py';

import translations from './l10n.yaml';
import iconImage from './icon.svg';

addLocalesMessages(translations);

export default {
  icon: iconImage,
  name: (
    <Text
      id="blocks.request.name"
      defaultMessage="Request"
    />
  ),
  files: [
    {
      name: 'request',
      type: 'text/x-python',
      uri: requestFile,
    },
    {
      name: '_aiohttp/__init__',
      type: 'text/x-python',
      uri: aiohttpFile,
    },
    {
      name: '_aiohttp/aiohttp_ws',
      type: 'text/x-python',
      uri: aiohttpWsFile,
    },
  ],
  emulator,
  blocks,
};
