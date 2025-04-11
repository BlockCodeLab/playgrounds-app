import { Text } from '@blockcode/core';

export const blocks = [
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
      const pin = block.getFieldValue('PIN') || '0';
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
    output: 'boolean',
    emu(block) {
      const pin = block.getFieldValue('PIN') || '0';
      const code = `runtime.extensions.firmata.getDigitalValue(${pin})`;
      return [code, this.ORDER_FUNCTION_CALL];
    },
  },
  {
    id: 'readDistance',
    text: (
      <Text
        id="blocks.firmata.readDistance"
        defaultMessage="Read SONAR trig [PIN_T] echo [PIN_E]"
      />
    ),
    inputs: {
      PIN_T: {
        menu: 'digitalPin',
      },
      PIN_E: {
        menu: 'digitalPin',
      },
    },
    output: 'number',
    emu(block) {
      const pin_t = block.getFieldValue('PIN_T') || '0';
      const pin_e = block.getFieldValue('PIN_E') || '0';
      const code = `runtime.extensions.firmata.getSonarDistance(${pin_t}, ${pin_e})`;
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
        menu: 'digitalPin',
      },
    },
    output: 'number',
    emu(block) {
      const pin = block.getFieldValue('PIN') || '0';
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
        menu: 'digitalPin',
      },
    },
    output: 'number',
    emu(block) {
      const pin = block.getFieldValue('PIN') || '0';
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
        menu: 'pwmPin',
      },
      VALUE: {
        type: 'number',
        defaultValue: '50',
      },
    },
    emu(block) {
      const pin = block.getFieldValue('PIN') || '3';
      const value = this.quote_(this.valueToCode(block, 'VALUE', this.ORDER_NONE)) || '50';
      const code = `runtime.extensions.firmata.writePWM(${pin}, ${value});\n`;
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
      },
    },
    emu(block) {
      const pin = block.getFieldValue('PIN') || '0';
      const value = block.getFieldValue('VALUE') || '0';
      const code = `runtime.extensions.firmata.writeDigital(${pin}, ${value});\n`;
      return code;
    },
  },
  {
    id: 'writeServo',
    text: (
      <Text
        id="blocks.firmata.writeServo"
        defaultMessage="write servo PIN [PIN] [VALUE] deg"
      />
    ),
    inputs: {
      PIN: {
        menu: 'pwmPin',
      },
      VALUE: {
        type: 'number',
        defaultValue: '90',
      },
    },
    emu(block) {
      const pin = block.getFieldValue('PIN') || '3';
      const value = this.quote_(this.valueToCode(block, 'VALUE', this.ORDER_NONE)) || '90';
      const code = `runtime.extensions.firmata.writeServo(${pin}, ${value});\n`;
      return code;
    },
  },
  {
    id: 'playTone',
    text: (
      <Text
        id="blocks.firmata.playTone"
        defaultMessage="tone pin [PIN] [FREQUENCY] HZ [DURATION] ms"
      />
    ),
    inputs: {
      PIN: {
        menu: 'pwmPin',
      },
      FREQUENCY: {
        type: 'number',
        defaultValue: '100',
      },
      DURATION: {
        type: 'number',
        defaultValue: '1000',
      },
    },
    emu(block) {
      const pin = block.getFieldValue('PIN') || '3';
      const frequency = this.quote_(this.valueToCode(block, 'FREQUENCY', this.ORDER_NONE)) || '100';
      const duration = this.quote_(this.valueToCode(block, 'DURATION', this.ORDER_NONE)) || '100';
      const code = `runtime.extensions.firmata.playTone(${pin}, ${frequency}, ${duration});\n`;
      return code;
    },
  },
];

export const menus = {
  analogPin: {
    type: 'string',
    defaultValue: '0',
    items: [
      ['A0', '0'],
      ['A1', '1'],
      ['A2', '2'],
      ['A3', '3'],
      ['A4', '4'],
      ['A5', '5'],
    ],
  },
  digitalPin: {
    type: 'string',
    defaultValue: '0',
    items: [
      ['D0', '0'],
      ['D1', '1'],
      ['D2', '2'],
      ['D3', '3'],
      ['D4', '4'],
      ['D5', '5'],
      ['D6', '6'],
      ['D7', '7'],

      ['D8', '8'],
      ['D9', '9'],
      ['D10', '10'],
      ['D11', '11'],
      ['D12', '12'],
      ['D13', '13'],
    ],
  },
  pwmPin: {
    type: 'string',
    defaultValue: '3',
    items: [
      ['D3', '3'],
      ['D5', '5'],
      ['D6', '6'],
      ['D9', '9'],
      ['D10', '10'],
      ['D11', '11'],
    ],
  },
  highLow: {
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
    ],
  },
};
