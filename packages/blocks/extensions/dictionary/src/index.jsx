import { addLocalesMessages, Text } from '@blockcode/core';

import translations from './l10n.yaml';
import iconImage from './icon.svg';

addLocalesMessages(translations);

export default {
  icon: iconImage,
  name: (
    <Text
      id="blocks.dictionary.name"
      defaultMessage="Dictionary"
    />
  ),
  blocks: [
    {
      id: 'blockA',
      text: (
        <Text
          id="blocks.dictionary.blockA"
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
