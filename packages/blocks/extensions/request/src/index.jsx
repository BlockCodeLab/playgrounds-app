import { addLocalesMessages, Text } from '@blockcode/core';
import { emulator } from './emulator';
import { blocks } from './blocks';

import translations from './l10n.yaml';
import iconImage from './icon.svg';
import requestFile from './request.py';

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
  ],
  emulator,
  blocks,
};
