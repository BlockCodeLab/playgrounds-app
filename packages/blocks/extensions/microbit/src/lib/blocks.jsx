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
    id: 'whenButtonPressed',
    hat: true,
    text: (
      <Text
        id="blocks.microbit.whenButtonEvent"
        defaultMessage="when button [NAME] is [EVENT]"
      />
    ),
    inputs: {
      NAME: {
        menu: 'buttons',
        defaultValue: 'a',
      },
      EVENT: {
        menu: 'buttonEvents',
        defaultValue: 'down',
      },
    },
    emu(block) {},
  },
  '---',
  {
    id: 'displaySymbol',
    text: (
      <Text
        id="blocks.microbit.displayMatrix"
        defaultMessage="display [MATRIX]"
      />
    ),
    inputs: {
      MATRIX: {
        type: 'matrix',
      },
    },
  },
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
      const text = this.valueToCode(block, 'TEXT', this.ORDER_NONE) || '""';
      const delay = this.valueToCode(block, 'DELAY', this.ORDER_NONE) || '0';
      const code = `runtime.extensions.microbit.displayText(${text}, ${delay});\n`;
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
    emu(block) {},
  },
];

export const menus = {
  buttons: {
    inputMode: true,
    type: 'string',
    items: [
      [
        <Text
          id="blocks.microbit.buttonIDMenu.a"
          defaultMessage="A"
        />,
        'a',
      ],
      [
        <Text
          id="blocks.microbit.buttonIDMenu.b"
          defaultMessage="B"
        />,
        'b',
      ],
      [
        <Text
          id="blocks.microbit.buttonIDMenu.any"
          defaultMessage="any"
        />,
        'any',
      ],
    ],
  },
  buttonEvents: {
    type: 'string',
    items: [
      [
        <Text
          id="blocks.microbit.buttonEventMenu.down"
          defaultMessage="down"
        />,
        ,
        'down',
      ],
      [
        <Text
          id="blocks.microbit.buttonEventMenu.up"
          defaultMessage="up"
        />,
        ,
        'up',
      ],
      [
        <Text
          id="blocks.microbit.buttonEventMenu.click"
          defaultMessage="click"
        />,
        'click',
      ],
    ],
  },
};
