import { addLocalesMessages, Text } from '@blockcode/core';
import { emulator } from './emulator';
import { blocks } from './blocks';

import translations from './l10n.yaml';
import iconImage from './icon.svg';
import mqttFile from './mqtt.py';

addLocalesMessages(translations);

export default {
  icon: iconImage,
  name: (
    <Text
      id="extension.mqtt.name"
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
