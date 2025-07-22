import { addLocalesMessages, translate } from '@blockcode/core';

import translations from './l10n.yaml';
import iconImage from './icon.png';
import lightFile from './light.py';

addLocalesMessages(translations);

export default {
  icon: iconImage,
  name: translate('blocks.light.name', 'Light'),
  files: [
    {
      name: 'light',
      type: 'text/x-python',
      uri: lightFile,
    },
  ],
  blocks: [
    {
      id: 'setLED',
      text: translate('blocks.light.led', 'set PIN [PIN] LED [STATE]'),
      inputs: {
        PIN: {
          type: 'integer',
          defaultValue: '1',
        },
        STATE: {
          inputMode: true,
          type: 'integer',
          defaultValue: '1',
          menu: [
            [translate('blocks.light.led.on', 'on'), '1'],
            [translate('blocks.light.led.off', 'off'), '0'],
          ],
        },
      },
      mpy(block) {
        const pin = this.valueToCode(block, 'PIN', this.ORDER_NONE) || '1';
        const stateCode = this.valueToCode(block, 'STATE', this.ORDER_NONE) || '1';
        const code = `light.set_led(${pin}, ${stateCode})\n`;
        return code;
      },
    },
    {
      id: 'toggleLED',
      text: translate('blocks.light.ledToggle', 'toggle PIN [PIN] LED'),
      inputs: {
        PIN: {
          type: 'integer',
          defaultValue: '1',
        },
      },
      mpy(block) {
        const pin = this.valueToCode(block, 'PIN', this.ORDER_NONE) || '7';
        const code = `light.toggle_led(${pin})\n`;
        return code;
      },
    },
    {
      id: 'isLEDOn',
      text: translate('blocks.light.ledIsOn', 'PIN [PIN] LED is on?'),
      inputs: {
        PIN: {
          type: 'integer',
          defaultValue: '1',
        },
      },
      output: 'boolean',
      mpy(block) {
        const pin = this.valueToCode(block, 'PIN', this.ORDER_NONE) || '7';
        const code = `light.is_led_on(${pin})`;
        return [code, this.ORDER_FUNCTION_CALL];
      },
    },
    '---',
    {
      id: 'getBrightness',
      text: translate('blocks.light.brightness', 'PIN [PIN] ambient light brightness'),
      inputs: {
        PIN: {
          type: 'integer',
          defaultValue: '1',
        },
      },
      output: 'number',
      mpy(block) {
        const pin = this.valueToCode(block, 'PIN', this.ORDER_NONE) || '2';
        const code = `light.get_brightness(${pin})`;
        return [code, this.ORDER_FUNCTION_CALL];
      },
    },
  ],
};
