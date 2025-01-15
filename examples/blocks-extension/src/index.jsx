import { addLocalesMessages, Text } from '@blockcode/core';

import translations from './l10n.yaml';
import iconImage from './icon.png';

addLocalesMessages(translations);

export default {
  icon: iconImage,
  name: (
    <Text
      id="blocks.example.name"
      defaultMessage="Example"
    />
  ),
  blocks: [
    {
      id: 'blockA',
      text: (
        <Text
          id="blocks.example.blockA"
          defaultMessage="block [KEY]"
        />
      ),
      inputs: {
        KEY: {
          type: 'string',
          defaultValue: 'a',
        },
      },
    },
  ],
};
