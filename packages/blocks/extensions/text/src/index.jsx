import { addLocalesMessages, Text } from '@blockcode/core';

import translations from './l10n.yaml';
import iconImage from './icon.svg';

addLocalesMessages(translations);

export default {
  icon: iconImage,
  name: (
    <Text
      id="blocks.text.name"
      defaultMessage="Example"
    />
  ),
  blocks: [
    {
      id: 'blockA',
      text: (
        <Text
          id="blocks.text.blockA"
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
