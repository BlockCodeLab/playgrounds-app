import { Text } from '@blockcode/core';

export const blocks = [
  {
    id: 'erase',
    text: (
      <Text
        id="blocks.pen.erase"
        defaultMessage="erase all"
      />
    ),
    emu(block) {
      const code = `runtime.extensions.pen.erase();\n`;
      return code;
    },
    mpy(block) {
      const code = `pen.clear()\n`;
      return code;
    },
  },
  {
    id: 'stamp',
    text: (
      <Text
        id="blocks.pen.stamp"
        defaultMessage="stamp"
      />
    ),
    forStage: false,
    emu(block) {
      const code = `await runtime.extensions.pen.stamp(target);\n`;
      return code;
    },
    mpy(block) {
      const code = `pen.stamp(target)\n`;
      return code;
    },
  },
  {
    id: 'down',
    text: (
      <Text
        id="blocks.pen.down"
        defaultMessage="pen down"
      />
    ),
    forStage: false,
    emu(block) {
      const code = `runtime.extensions.pen.down(target);\n`;
      return code;
    },
    mpy(block) {
      const code = `pen.down(target)\n`;
      return code;
    },
  },
  {
    id: 'up',
    text: (
      <Text
        id="blocks.pen.up"
        defaultMessage="pen up"
      />
    ),
    forStage: false,
    emu(block) {
      const code = `runtime.extensions.pen.up(target);\n`;
      return code;
    },
    mpy(block) {
      const code = `pen.up(target)\n`;
      return code;
    },
  },
  {
    id: 'penColor',
    text: (
      <Text
        id="blocks.pen.penColor"
        defaultMessage="set pen color to [COLOR]"
      />
    ),
    forStage: false,
    inputs: {
      COLOR: {
        type: 'color',
      },
    },
    emu(block) {
      const color = this.valueToCode(block, 'COLOR', this.ORDER_NONE) || '"#ff0000"';
      const code = `runtime.extensions.pen.setColor(target, ${color});\n`;
      return code;
    },
    mpy(block) {
      const color = this.valueToCode(block, 'COLOR', this.ORDER_NONE) || '(255, 0, 0)';
      const code = `pen.set_color(target, ${color})\n`;
      return code;
    },
  },
  {
    id: 'changePen',
    text: (
      <Text
        id="blocks.pen.changePen"
        defaultMessage="change pen [OPTION] by [VALUE]"
      />
    ),
    forStage: false,
    inputs: {
      OPTION: {
        menu: 'colorParam',
      },
      VALUE: {
        type: 'number',
        defaultValue: 10,
      },
    },
    emu(block) {
      const option = this.valueToCode(block, 'OPTION', this.ORDER_NONE);
      const value = this.valueToCode(block, 'VALUE', this.ORDER_NONE) || 10;
      const code = `runtime.extensions.pen.addColorParam(target, '${option}', ${value});\n`;
      return code;
    },
    mpy(block) {
      const option = this.valueToCode(block, 'OPTION', this.ORDER_NONE);
      const value = this.valueToCode(block, 'VALUE', this.ORDER_NONE) || 10;
      const code = `pen.change_color(target, ${option}=${value})\n`;
      return code;
    },
  },
  {
    id: 'setPen',
    text: (
      <Text
        id="blocks.pen.setPen"
        defaultMessage="set pen [OPTION] to [VALUE]"
      />
    ),
    forStage: false,
    inputs: {
      OPTION: {
        menu: 'colorParam',
      },
      VALUE: {
        type: 'number',
        defaultValue: 50,
      },
    },
    emu(block) {
      const option = this.valueToCode(block, 'OPTION', this.ORDER_NONE);
      const value = this.valueToCode(block, 'VALUE', this.ORDER_NONE) || '0';
      const code = `runtime.extensions.pen.setColorParam(target, '${option}', ${value});\n`;
      return code;
    },
    mpy(block) {
      const option = this.valueToCode(block, 'OPTION', this.ORDER_NONE);
      const value = this.valueToCode(block, 'VALUE', this.ORDER_NONE) || '0';
      const code = `pen.set_color(target, ${option}=${value})\n`;
      return code;
    },
  },
  {
    id: 'changeSize',
    text: (
      <Text
        id="blocks.pen.changeSize"
        defaultMessage="change pen size by [SIZE]"
      />
    ),
    forStage: false,
    inputs: {
      SIZE: {
        type: 'number',
        defaultValue: 1,
      },
    },
    emu(block) {
      const size = this.valueToCode(block, 'SIZE', this.ORDER_NONE) || '1';
      const code = `runtime.extensions.pen.addSize(target, ${size});\n`;
      return code;
    },
    mpy(block) {
      const size = this.valueToCode(block, 'SIZE', this.ORDER_NONE) || '1';
      const code = `pen.change_size(target, ${size})\n`;
      return code;
    },
  },
  {
    id: 'setSize',
    text: (
      <Text
        id="blocks.pen.setSize"
        defaultMessage="set pen size to [SIZE]"
      />
    ),
    forStage: false,
    inputs: {
      SIZE: {
        type: 'number',
        defaultValue: 1,
      },
    },
    emu(block) {
      const size = this.valueToCode(block, 'SIZE', this.ORDER_NONE) || '1';
      const code = `runtime.extensions.pen.setSize(target, ${size});\n`;
      return code;
    },
    mpy(block) {
      const size = this.valueToCode(block, 'SIZE', this.ORDER_NONE) || '1';
      const code = `pen.set_size(target, ${size})\n`;
      return code;
    },
  },
];

export const menus = {
  colorParam: {
    inputMode: true,
    defaultValue: 'hue',
    items: [
      [
        <Text
          id="blocks.pen.color"
          defaultMessage="color"
        />,
        'hue',
      ],
      [
        <Text
          id="blocks.pen.saturation"
          defaultMessage="saturation"
        />,
        'saturation',
      ],
      [
        <Text
          id="blocks.pen.brightness"
          defaultMessage="brightness"
        />,
        'brightness',
      ],
    ],
  },
};
