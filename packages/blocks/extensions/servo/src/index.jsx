import { addLocalesMessages, Text } from '@blockcode/core';

import translations from './l10n.yaml';
import iconImage from './icon.png';
import servoFile from './servo.py';

addLocalesMessages(translations);

export default {
  icon: iconImage,
  name: (
    <Text
      id="blocks.servo.name"
      defaultMessage="Servo"
    />
  ),
  files: [
    {
      name: 'servo',
      type: 'text/x-python',
      uri: servoFile,
    },
  ],
  blocks: [
    {
      id: 'setServo180',
      text: (
        <Text
          id="blocks.servo.180servo"
          defaultMessage="set PIN [PIN] 180° servo angle to [ANGLE]°"
        />
      ),
      inputs: {
        PIN: {
          type: 'integer',
          defaultValue: 1,
        },
        ANGLE: {
          shadow: 'angle180',
          defaultValue: 90,
        },
      },
      mpy(block) {
        const pin = this.valueToCode(block, 'PIN', this.ORDER_NONE) || 0;
        const angleCode = this.valueToCode(block, 'ANGLE', this.ORDER_NONE) || 90;
        const code = `servo.set_angle(${pin}, ${angleCode})\n`;
        return code;
      },
    },
    {
      id: 'setServo90',
      text: (
        <Text
          id="blocks.servo.90servo"
          defaultMessage="set PIN [PIN] 90° servo angle to [ANGLE]°"
        />
      ),
      inputs: {
        PIN: {
          type: 'integer',
          defaultValue: 1,
        },
        ANGLE: {
          shadow: 'angle90',
          defaultValue: 0,
        },
      },
      mpy(block) {
        const pin = this.valueToCode(block, 'PIN', this.ORDER_NONE) || 0;
        const angleCode = this.valueToCode(block, 'ANGLE', this.ORDER_NONE) || 0;
        const code = `servo.set_angle(${pin}, ${angleCode}, angle=90)\n`;
        return code;
      },
    },
    '---',
    {
      id: 'setMotor',
      text: (
        <Text
          id="blocks.servo.motor"
          defaultMessage="set PIN [PIN] 360° servo rotate [ROTATE]"
        />
      ),
      inputs: {
        PIN: {
          type: 'integer',
          defaultValue: 1,
        },
        ROTATE: {
          menu: [
            [
              <Text
                id="blocks.servo.motorClockwise"
                defaultMessage="clockwise"
              />,
              '1',
            ],
            [
              <Text
                id="blocks.servo.motorAnticlockwise"
                defaultMessage="anticlockwise"
              />,
              '-1',
            ],
            [
              <Text
                id="blocks.servo.motorStop"
                defaultMessage="stop"
              />,
              '0',
            ],
          ],
        },
      },
      mpy(block) {
        const pin = this.valueToCode(block, 'PIN', this.ORDER_NONE) || 0;
        const rotate = block.getFieldValue('ROTATE') || '1';
        const code = `servo.set_motor(${pin}, ${rotate})\n`;
        return code;
      },
    },
    // 内连输入积木，不显示
    {
      id: 'angle180',
      inline: true,
      output: 'number',
      inputs: {
        ANGLE: {
          type: 'slider',
          defaultValue: 0,
          min: 0,
          max: 180,
        },
      },
      mpy(block) {
        const angleCode = block.getFieldValue('ANGLE') || 0;
        return [angleCode, this.ORDER_NONE];
      },
    },
    {
      id: 'angle90',
      inline: true,
      output: 'number',
      inputs: {
        ANGLE: {
          type: 'slider',
          defaultValue: 0,
          min: 0,
          max: 90,
        },
      },
      mpy(block) {
        const angleCode = block.getFieldValue('ANGLE') || 0;
        return [angleCode, this.ORDER_NONE];
      },
    },
  ],
};
