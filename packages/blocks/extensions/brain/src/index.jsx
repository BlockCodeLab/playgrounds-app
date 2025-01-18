import { addLocalesMessages, Text } from '@blockcode/core';
import { emulator } from './emulator';
import { blocks } from './blocks';

import translations from './l10n.yaml';
import iconImage from './icon.svg';
import brainFile from './brain.py';

addLocalesMessages(translations);

export default {
  icon: iconImage,
  name: (
    <Text
      id="blocks.brain.name"
      defaultMessage="Brain"
    />
  ),
  files: [
    {
      name: 'brain',
      type: 'text/x-python',
      uri: brainFile,
    },
  ],
  emulator,
  blocks,
};
