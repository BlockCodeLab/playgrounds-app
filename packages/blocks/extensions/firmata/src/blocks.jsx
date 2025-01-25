import { Text } from '@blockcode/core';

export const blocks = [
  {
    id: 'blockA',
    text: (
      <Text
        id="blocks.firmata.blockA"
        defaultMessage="block [KEY]"
      />
    ),
    inputs: {
      KEY: {
        type: 'string',
        defaultValue: 'a',
      },
    },
    emu(block) {
      let code = '';
      if (this.STATEMENT_PREFIX) {
        code += this.injectId(this.STATEMENT_PREFIX, block);
      }
      const keyValue = this.valueToCode(block, 'KEY', this.ORDER_NONE) || '""';
      code += `console.log(${keyValue});\n`;
      return code;
    },
  },

  {
    id: 'connect',
    text: (
      <Text
        id="blocks.firmata.connect"
        defaultMessage="connect"
      />
    ),
    emu(block) {
      let code = '';
      if (this.STATEMENT_PREFIX) {
        code += this.injectId(this.STATEMENT_PREFIX, block);
      }
      code += `runtime.extensions.firmata.testConnect();\n`;
      return code;
    },
  },
  {
    id: 'flash',
    text: (
      <Text
        id="blocks.firmata.flash"
        defaultMessage="flash"
      />
    ),
    emu(block) {
      let code = '';
      if (this.STATEMENT_PREFIX) {
        code += this.injectId(this.STATEMENT_PREFIX, block);
      }
      code += `runtime.extensions.firmata.flash();\n`;
      return code;
    },
  },
];
