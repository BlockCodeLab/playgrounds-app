import { addLocalesMessages, Text } from '@blockcode/core';

import translations from './l10n.yaml';
import iconImage from './icon.png';
import lightFile from './light.py';

addLocalesMessages(translations);

export default {
  icon: iconImage,
  name: (
    <Text
      id="blocks.light.name"
      defaultMessage="Light"
    />
  ),
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
      text: (
        <Text
          id="blocks.light.led"
          defaultMessage="set PIN [PIN] LED [STATE]"
        />
      ),
      inputs: {
        PIN: {
          type: 'number',
          defaultValue: 1,
        },
        STATE: {
          inputMode: true,
          type: 'string',
          defaultValue: '1',
          menu: [
            [
              <Text
                id="blocks.light.led.on"
                defaultMessage="on"
              />,
              '1',
            ],
            [
              <Text
                id="blocks.light.led.off"
                defaultMessage="off"
              />,
              '0',
            ],
          ],
        },
      },
      mpy(block) {
        let code = '';
        if (this.STATEMENT_PREFIX) {
          code += this.injectId(this.STATEMENT_PREFIX, block);
        }
        const pinCode = this.valueToCode(block, 'PIN', this.ORDER_NONE) || '1';
        const stateCode = this.valueToCode(block, 'STATE', this.ORDER_NONE) || '1';
        code += `light.set_led(num(${pinCode}), num(${stateCode}))\n`;
        return code;
      },
    },
    {
      id: 'toggleLED',
      text: (
        <Text
          id="blocks.light.ledToggle"
          defaultMessage="toggle PIN [PIN] LED"
        />
      ),
      inputs: {
        PIN: {
          type: 'number',
          defaultValue: 1,
        },
      },
      mpy(block) {
        let code = '';
        if (this.STATEMENT_PREFIX) {
          code += this.injectId(this.STATEMENT_PREFIX, block);
        }
        const pinCode = this.valueToCode(block, 'PIN', this.ORDER_NONE) || '7';
        code += `light.toggle_led(num(${pinCode}))\n`;
        return code;
      },
    },
    {
      id: 'isLEDOn',
      text: (
        <Text
          id="blocks.light.ledIsOn"
          defaultMessage="PIN [PIN] LED is on?"
        />
      ),
      inputs: {
        PIN: {
          type: 'number',
          defaultValue: 1,
        },
      },
      output: 'boolean',
      mpy(block) {
        const pinCode = this.valueToCode(block, 'PIN', this.ORDER_NONE) || '7';
        const code = `light.is_led_on(num(${pinCode}))`;
        return [code, this.ORDER_FUNCTION_CALL];
      },
    },
    '---',
    {
      id: 'getBrightness',
      text: (
        <Text
          id="blocks.light.brightness"
          defaultMessage="PIN [PIN] ambient light brightness"
        />
      ),
      inputs: {
        PIN: {
          type: 'number',
          defaultValue: 1,
        },
      },
      output: 'number',
      mpy(block) {
        const pinCode = this.valueToCode(block, 'PIN', this.ORDER_NONE) || '2';
        const code = `light.get_brightness(num(${pinCode}))`;
        return [code, this.ORDER_FUNCTION_CALL];
      },
    },
  ],
};
