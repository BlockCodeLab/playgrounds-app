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
  {
    id: 'disconnect',
    text: (
      <Text
        id="blocks.firmata.disconnect"
        defaultMessage="disconnect"
      />
    ),
    emu(block) {
      let code = '';
      if (this.STATEMENT_PREFIX) {
        code += this.injectId(this.STATEMENT_PREFIX, block);
      }
      code += `runtime.extensions.firmata.disconnect();\n`;
      return code;
    },
  },
  {
    id: 'readAnalog',
    text: (
      <Text
        id="blocks.firmata.readAnalog"
        defaultMessage="read analog [PIN] value"
      />
    ),
    inputs: {
      PIN: {
        menu: 'analogPin',
      },
    },
    output: 'number',
    emu(block) {
      const pin = this.quote_(this.valueToCode(block, 'PIN', this.ORDER_NONE)) || '0';
      const code = `runtime.extensions.firmata.getAnalogValue(${pin})`;
      return [code, this.ORDER_FUNCTION_CALL];
    },
  },
  {
    id: 'readDigital',
    text: (
      <Text
        id="blocks.firmata.readDigital"
        defaultMessage="read digital [PIN] value"
      />
    ),
    inputs: {
      PIN: {
        menu: 'digitalPin',
      },
    },
    output: 'number',
    emu(block) {
      const pin = this.quote_(this.valueToCode(block, 'PIN', this.ORDER_NONE)) || 0;
      const code = `runtime.extensions.firmata.getDigitalValue(${pin})`;
      return [code, this.ORDER_FUNCTION_CALL];
    },
  },
  {
    id: 'readDistance',
    text: (
      <Text
        id="blocks.firmata.readDistance"
        defaultMessage="read Distance [PIN] value"
      />
    ),
    inputs: {
      PIN: {
        menu: 'digitalPin',
      },
    },
    output: 'number',
    emu(block) {
      const pin = this.quote_(this.valueToCode(block, 'PIN', this.ORDER_NONE)) || 0;
      const code = `runtime.extensions.firmata.getRUS04Distance(${pin})`;
      return [code, this.ORDER_FUNCTION_CALL];
    },
  },
  {
    id: 'readTemp',
    text: (
      <Text
        id="blocks.firmata.readTemp"
        defaultMessage="read temperature [PIN] value"
      />
    ),
    inputs: {
      PIN: {
        menu: 'analogPin',
      },
    },
    output: 'number',
    emu(block) {
      const pin = this.quote_(this.valueToCode(block, 'PIN', this.ORDER_NONE)) || 0;
      const code = `runtime.extensions.firmata.getDHTTemp(${pin})`;
      return [code, this.ORDER_FUNCTION_CALL];
    },
  },
  {
    id: 'readHum',
    text: (
      <Text
        id="blocks.firmata.readHum"
        defaultMessage="read humidity [PIN] value"
      />
    ),
    inputs: {
      PIN: {
        menu: 'analogPin',
      },
    },
    output: 'number',
    emu(block) {
      const pin = this.quote_(this.valueToCode(block, 'PIN', this.ORDER_NONE)) || 0;
      const code = `runtime.extensions.firmata.getDHTHum(${pin})`;
      return [code, this.ORDER_FUNCTION_CALL];
    },
  },
  {
    id: 'setPWM',
    text: (
      <Text
        id="blocks.firmata.setPWM"
        defaultMessage="set PWM  [PIN] value [VALUE]"
      />
    ),
    inputs: {
      PIN: {
        menu: 'digitalPin',
      },
      VALUE: {
        type: 'number',
        defaultValue: 50,
      }
    },
    emu(block) {
      const pin = this.quote_(this.valueToCode(block, 'PIN', this.ORDER_NONE)) || 0;
      const value = this.quote_(this.valueToCode(block, 'VALUE', this.ORDER_NONE)) || 50;
      let code = '';
      if (this.STATEMENT_PREFIX) {
        code += this.injectId(this.STATEMENT_PREFIX, block);
      }
      code += `runtime.extensions.firmata.writePWM(${pin}, ${value});\n`;
      return code;
    },
  },
  {
    id: 'setDigital',
    text: (
      <Text
        id="blocks.firmata.setDigital"
        defaultMessage="set digital  [PIN] value [VALUE]"
      />
    ),
    inputs: {
      PIN: {
        menu: 'digitalPin',
      },
      VALUE: {
        menu: 'highLow',
      }
    },
    emu(block) {
      const pin = this.quote_(this.valueToCode(block, 'PIN', this.ORDER_NONE)) || 0;
      const value = this.quote_(this.valueToCode(block, 'VALUE', this.ORDER_NONE)) || 50;
      let code = '';
      if (this.STATEMENT_PREFIX) {
        code += this.injectId(this.STATEMENT_PREFIX, block);
      }
      code += `runtime.extensions.firmata.writeDigital(${pin}, ${value});\n`;
      return code;
    },
  },
];

export const menus = {
  analogPin:{
    inputMode: true,
    type: 'string',
    defaultValue: '0',
    items: [
      [
        'A0',
        '0',
      ],
      [
        'A1',
        '1',
      ],
      [
        'A2',
        '2',
      ],
      [
        'A3',
        '3',
      ],
      [
        'A4',
        '4',
      ],
      [
        'A5',
        '5',
      ],
    ]
  },
  digitalPin:{
    inputMode: true,
    type: 'string',
    defaultValue: '0',
    items: [
      [
        'D0',
        '0',
      ],
      [
        'D1',
        '1',
      ],
      [
        'D2',
        '2',
      ],
      [
        'D3',
       '3',
      ],
      [
        'D4',
        '4',
      ],
      [
        'D5',
        '5',
      ],
      [
        'D6',
        '6',
      ],
      [
        "D7",
        '7',
      ],
      
      [
        'D8',
        '8',
      ],
      [
        'D9',
        '9',
      ],
      [
        'D10',
        '10',
      ],
      [
        'D11',
        '11',
      ],
      [
        'D12',
        '12',
      ],
      [
        'D13',
        '13',
      ],
    ]
  },
  pwmPin:{
    inputMode: true,
    type: 'string',
    defaultValue: '3',
    items: [
      [
        'D3',
        '3',
      ],
      [
        'D5',
        '5',
      ],
      [
        'D6',
        '6',
      ],
      [
        'D9',
        '9',
      ],
      [
        'D10',
        '10',
      ],
      [
        'D11',
        '11',
      ],
    ]
  },
  highLow:{
    inputMode: true,
    type: 'string',
    defaultValue: '0',
    items: [
      [
        <Text
          id="blocks.firmata.high"
          defaultMessage="high"
        />,
        '1',
      ],
      [
        <Text
          id="blocks.firmata.low"
          defaultMessage="low"
        />,
        '0',
      ],
    ]
  },
};
