import { Text } from '@blockcode/core';

export const blocks = [
  {
    id: 'whenReceived',
    text: (
      <Text
        id="blocks.broadcast.whenReceived"
        defaultMessage="when I receive message"
      />
    ),
    hat: true,
    mpy() {
      const eventCode = this.eventToCode('broadcast_received', 'False', 'target');
      return `@broadcast.when_received("default", target)\n${eventCode}`;
    },
  },
  {
    id: 'send',
    text: (
      <Text
        id="blocks.broadcast.send"
        defaultMessage="broadcast message [MESSAGE]"
      />
    ),
    inputs: {
      MESSAGE: {
        type: 'text',
        defaultValue: (
          <Text
            id="blocks.broadcast.message"
            defaultMessage="hello"
          />
        ),
      },
    },
    mpy(block) {
      let code = '';
      if (this.STATEMENT_PREFIX) {
        code += this.injectId(this.STATEMENT_PREFIX, block);
      }
      const message = this.valueToCode(block, 'MESSAGE', this.ORDER_NONE) || '""';
      code += `broadcast.send(str(${message.replace(':', '_')}))\n`;
      return code;
    },
  },
  {
    id: 'received',
    text: (
      <Text
        id="blocks.broadcast.received"
        defaultMessage="received message"
      />
    ),
    output: 'string',
    mpy() {
      const code = 'broadcast.get_message()\n';
      return [code, this.ORDER_FUNCTION_CALL];
    },
  },
  '---',
  {
    id: 'whenReceivedNamed',
    text: (
      <Text
        id="blocks.broadcast.whenReceivedNamed"
        defaultMessage="when I receive named [NAME] message"
      />
    ),
    hat: true,
    inputs: {
      NAME: {
        type: 'text',
        defaultValue: (
          <Text
            id="blocks.broadcast.messageName"
            defaultMessage="my"
          />
        ),
      },
    },
    mpy(block) {
      const eventCode = this.eventToCode('broadcast_received', 'False', 'target');
      const name = this.valueToCode(block, 'NAME', this.ORDER_NONE) || '"default"';
      return `@broadcast.when_received(str(${name}), target)\n${eventCode}`;
    },
  },
  {
    id: 'sendName',
    text: (
      <Text
        id="blocks.broadcast.sendName"
        defaultMessage="broadcast named [NAME] message [MESSAGE]"
      />
    ),
    inputs: {
      NAME: {
        type: 'text',
        defaultValue: (
          <Text
            id="blocks.broadcast.messageName"
            defaultMessage="say"
          />
        ),
      },
      MESSAGE: {
        type: 'text',
        defaultValue: (
          <Text
            id="blocks.broadcast.message"
            defaultMessage="hello"
          />
        ),
      },
    },
    mpy(block) {
      let code = '';
      if (this.STATEMENT_PREFIX) {
        code += this.injectId(this.STATEMENT_PREFIX, block);
      }
      const name = this.valueToCode(block, 'NAME', this.ORDER_NONE) || '"default"';
      const message = this.valueToCode(block, 'MESSAGE', this.ORDER_NONE) || '""';
      code += `broadcast.send(str(${message}), name=str(${name}))\n`;
      return code;
    },
  },
  {
    id: 'receivedNamed',
    text: (
      <Text
        id="blocks.broadcast.receivedNamed"
        defaultMessage="received named [NAME] message"
      />
    ),
    output: 'string',
    inputs: {
      NAME: {
        type: 'text',
        defaultValue: (
          <Text
            id="blocks.broadcast.messageName"
            defaultMessage="say"
          />
        ),
      },
    },
    mpy(block) {
      const name = this.valueToCode(block, 'NAME', this.ORDER_NONE) || '"default"';
      const code = `broadcast.get_message(str(${name}))\n`;
      return [code, this.ORDER_FUNCTION_CALL];
    },
  },
  '---',
  {
    id: 'receivedIndex',
    text: (
      <Text
        id="blocks.broadcast.receivedIndex"
        defaultMessage="received message [INDEX]"
      />
    ),
    inputs: {
      INDEX: {
        menu: 'receivedParam',
      },
    },
    output: 'string',
    mpy(block) {
      const index = this.quote_(block.getFieldValue('INDEX')) || '"timestamp"';
      const code = `broadcast.get_message_info(str(${index}))\n`;
      return [code, this.ORDER_FUNCTION_CALL];
    },
  },
  {
    id: 'receivedNamedIndex',
    text: (
      <Text
        id="blocks.broadcast.receivedNameIndex"
        defaultMessage="received named [NAME] message [INDEX]"
      />
    ),
    inputs: {
      NAME: {
        type: 'text',
        defaultValue: (
          <Text
            id="blocks.broadcast.messageName"
            defaultMessage="say"
          />
        ),
      },
      INDEX: {
        menu: 'receivedParam',
      },
    },
    output: 'string',
    mpy(block) {
      const name = this.valueToCode(block, 'NAME', this.ORDER_NONE) || '"default"';
      const index = this.quote_(block.getFieldValue('INDEX')) || '"timestamp"';
      const code = `broadcast.get_message_info(str(${index}), name=str(${name}))\n`;
      return [code, this.ORDER_FUNCTION_CALL];
    },
  },
  '---',
  {
    id: 'setGroup',
    text: (
      <Text
        id="blocks.broadcast.setGroup"
        defaultMessage="set broadcast group [ID]"
      />
    ),
    inputs: {
      ID: {
        type: 'string',
        defaultValue: '1',
      },
    },
    mpy(block) {
      let code = '';
      if (this.STATEMENT_PREFIX) {
        code += this.injectId(this.STATEMENT_PREFIX, block);
      }
      const id = this.valueToCode(block, 'ID', this.ORDER_NONE) || '1';
      code += `broadcast.set_group(str(${id}))\n`;
      return code;
    },
  },
];

export const menus = {
  receivedParam: {
    type: 'string',
    items: [
      [
        <Text
          id="blocks.broadcast.receivedTime"
          defaultMessage="timestamp"
        />,
        'timestamp',
      ],
      [
        <Text
          id="blocks.broadcast.receivedSerial"
          defaultMessage="serial number"
        />,
        'serialnumber',
      ],
      [
        <Text
          id="blocks.broadcast.receivedMac"
          defaultMessage="mac"
        />,
        'mac',
      ],
    ],
  },
};
