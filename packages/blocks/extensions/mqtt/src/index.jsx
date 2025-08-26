import { addLocalesMessages, Text } from '@blockcode/core';
import { emulator } from './lib/emulator';
import { blocks } from './lib/blocks';
import mqttFile from './lib/mqtt.py';

import translations from './l10n.yaml';
import iconImage from './icon.svg';

addLocalesMessages(translations);

export default {
  icon: iconImage,
  name: (
    <Text
      id="blocks.mqtt.name"
      defaultMessage="MQTT"
    />
  ),
  files: [
    {
      name: 'mqtt',
      type: 'text/x-python',
      uri: mqttFile,
    },
  ],
  emulator,
  blocks,
};
