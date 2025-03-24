import { addLocalesMessages, Text } from '@blockcode/core';

import translations from './l10n.yaml';
import iconImage from './icon.png';

addLocalesMessages(translations);

export default {
  icon: iconImage,
  name: (
    <Text
      id="blocks.sprite.name"
      defaultMessage="Sprite Action"
    />
  ),
  blocks: [
    {
      id: 'blockA',
      text: (
        <Text
          id="blocks.sprite.blockA"
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
