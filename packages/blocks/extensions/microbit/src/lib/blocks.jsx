import { Text } from '@blockcode/core';
import mbitmoreFile from './mbit-more-0.2.5.hex';

export const blocks = [
  {
    button: 'DOWNLOAD_HEX',
    text: (
      <Text
        id="blocks.microbit.download"
        defaultMessage="Download mbit-more program"
      />
    ),
    onClick() {
      const link = document.createElement('a');
      link.setAttribute('href', mbitmoreFile);
      link.setAttribute('download', 'mbit-more-0.2.5.hex');
      link.click();
    },
  },
  '---',
  {
    id: 'displayText',
    text: (
      <Text
        id="blocks.microbit.displayText"
        defaultMessage="display text [TEXT] delay [DELAY] ms"
      />
    ),
    inputs: {
      TEXT: {
        type: 'string',
        defaultValue: 'Hello!',
      },
      DELAY: {
        type: 'number',
        defaultValue: 120,
      },
    },
    emu(block) {
      let code = '';
      if (this.STATEMENT_PREFIX) {
        code += this.injectId(this.STATEMENT_PREFIX, block);
      }
      const text = this.valueToCode(block, 'TEXT', this.ORDER_NONE) || '""';
      const delay = this.valueToCode(block, 'DELAY', this.ORDER_NONE) || '0';
      code += `runtime.extensions.microbit.displayText(${text}, ${delay});\n`;
      return code;
    },
  },
  {
    id: 'displayClear',
    text: (
      <Text
        id="blocks.microbit.clearDisplay"
        defaultMessage="clear display"
      />
    ),
    emu(block) {
      let code = '';
      if (this.STATEMENT_PREFIX) {
        code += this.injectId(this.STATEMENT_PREFIX, block);
      }
      return code;
    },
  },
];
