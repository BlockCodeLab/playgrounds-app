import { Text } from '@blockcode/core';

export const blocks = [
  {
    id: 'connect',
    text: (
      <Text
        id="blocks.websocket.connect"
        defaultMessage="connect to [URL]"
      />
    ),
    inputs: {
      URL: {
        type: 'text',
        defaultValue: 'wss://echo.websocket.org/',
      },
    },
    mpy(block) {
      let code = '';
      if (this.STATEMENT_PREFIX) {
        code += this.injectId(this.STATEMENT_PREFIX, block);
      }
      const url = this.valueToCode(block, 'URL', this.ORDER_NONE);
      code += `await websocket.connect(${url})\n`;
      return code;
    },
    emu(block) {
      let code = '';
      if (this.STATEMENT_PREFIX) {
        code += this.injectId(this.STATEMENT_PREFIX, block);
      }
      const url = this.valueToCode(block, 'URL', this.ORDER_NONE);
      code += `await runtime.extensions.websocket.connect(${url});\n`;
      return code;
    },
  },
  '---',
  {
    id: 'send',
    text: (
      <Text
        id="blocks.websocket.send"
        defaultMessage="send message [MESSAGE]"
      />
    ),
    inputs: {
      MESSAGE: {
        type: 'text',
        defaultValue: 'hello',
      },
    },
    mpy(block) {
      let code = '';
      if (this.STATEMENT_PREFIX) {
        code += this.injectId(this.STATEMENT_PREFIX, block);
      }
      const message = this.valueToCode(block, 'MESSAGE', this.ORDER_NONE);
      code += `websocket.send(${message})\n`;
      return code;
    },
    emu(block) {
      let code = '';
      if (this.STATEMENT_PREFIX) {
        code += this.injectId(this.STATEMENT_PREFIX, block);
      }
      const message = this.valueToCode(block, 'MESSAGE', this.ORDER_NONE);
      code += `runtime.extensions.websocket.send(${message});\n`;
      return code;
    },
  },
  '---',
  {
    id: 'whenMessageReceived',
    text: (
      <Text
        id="blocks.websocket.whenMessageReceived"
        defaultMessage="when message received"
      />
    ),
    hat: true,
    mpy(block) {
      const eventCode = this.eventToCode('websocket_received', 'False', 'target');
      return `@when(websocket.WEBSOCKET_RECEIVED, target)\n${eventCode}`;
    },
    emu(block) {
      return `runtime.when('websocket.received', ${this.HAT_CALLBACK});\n`;
    },
  },
  {
    id: 'receivedJSON',
    text: (
      <Text
        id="blocks.websocket.receivedJSON"
        defaultMessage="item [PATH] of received JSON data"
      />
    ),
    output: 'text',
    inputs: {
      PATH: {
        type: 'text',
        defaultValue: 'path.2.item',
      },
    },
    mpy(block) {
      const path = this.valueToCode(block, 'PATH', this.ORDER_NONE);
      const code = `websocket.get_data(${path})`;
      return [code, this.ORDER_FUNCTION_CALL];
    },
    emu(block) {
      const path = this.valueToCode(block, 'PATH', this.ORDER_NONE);
      const code = `runtime.extensions.websocket.getData(${path})`;
      return [code, this.ORDER_FUNCTION_CALL];
    },
  },
  {
    id: 'receivedText',
    text: (
      <Text
        id="blocks.websocket.receivedText"
        defaultMessage="received text message"
      />
    ),
    output: 'text',
    mpy(block) {
      const code = 'websocket.get_text()';
      return [code, this.ORDER_FUNCTION_CALL];
    },
    emu(block) {
      const code = 'runtime.extensions.websocket.getText()';
      return [code, this.ORDER_FUNCTION_CALL];
    },
  },
  '---',
  {
    id: 'whenConnected',
    text: (
      <Text
        id="blocks.websocket.whenConnected"
        defaultMessage="when connected"
      />
    ),
    hat: true,
    mpy(block) {
      const eventCode = this.eventToCode('websocket_connected', 'False', 'target');
      return `@when(websocket.WEBSOCKET_CONNECTED, target)\n${eventCode}`;
    },
    emu(block) {
      return `runtime.when('websocket.connected', ${this.HAT_CALLBACK});\n`;
    },
  },
  {
    id: 'whenConnectionErrors',
    text: (
      <Text
        id="blocks.websocket.whenConnectionErrors"
        defaultMessage="when connection errors"
      />
    ),
    hat: true,
    mpy(block) {
      const eventCode = this.eventToCode('websocket_errors', 'False', 'target');
      return `@when(websocket.WEBSOCKET_ERRORS, target)\n${eventCode}`;
    },
    emu(block) {
      return `runtime.when('websocket.errors', ${this.HAT_CALLBACK});\n`;
    },
  },
  {
    id: 'whenConnectionCloses',
    text: (
      <Text
        id="blocks.websocket.whenConnectionCloses"
        defaultMessage="when connection closes"
      />
    ),
    hat: true,
    mpy(block) {
      const eventCode = this.eventToCode('websocket_disconnected', 'False', 'target');
      return `@when(websocket.WEBSOCKET_DISCONNECTED, target)\n${eventCode}`;
    },
    emu(block) {
      return `runtime.when('websocket.disconnected', ${this.HAT_CALLBACK});\n`;
    },
  },
  {
    id: 'closeConnection',
    text: (
      <Text
        id="blocks.websocket.closeConnection"
        defaultMessage="close connection"
      />
    ),
    mpy(block) {
      let code = '';
      if (this.STATEMENT_PREFIX) {
        code += this.injectId(this.STATEMENT_PREFIX, block);
      }
      code += 'websocket.disconnect()\n';
      return code;
    },
    emu(block) {
      let code = '';
      if (this.STATEMENT_PREFIX) {
        code += this.injectId(this.STATEMENT_PREFIX, block);
      }
      code += 'runtime.extensions.websocket.disconnect();\n';
      return code;
    },
  },
  '---',
  {
    id: 'isConnected',
    text: (
      <Text
        id="blocks.websocket.isConnected"
        defaultMessage="is connected?"
      />
    ),
    output: 'boolean',
    mpy(block) {
      const code = 'websocket.is_connected()';
      return [code, this.ORDER_FUNCTION_CALL];
    },
    emu(block) {
      const code = 'runtime.extensions.websocket.isConnected()';
      return [code, this.ORDER_FUNCTION_CALL];
    },
  },
  {
    id: 'isConnectionErrored',
    text: (
      <Text
        id="blocks.websocket.isConnectionErrored"
        defaultMessage="is connection errored?"
      />
    ),
    output: 'boolean',
    mpy(block) {
      const code = 'websocket.is_errors()';
      return [code, this.ORDER_FUNCTION_CALL];
    },
    emu(block) {
      const code = 'runtime.extensions.websocket.isErrors()';
      return [code, this.ORDER_FUNCTION_CALL];
    },
  },
  {
    id: 'isConnectionClosed',
    text: (
      <Text
        id="blocks.websocket.isConnectionClosed"
        defaultMessage="is connection cloased?"
      />
    ),
    output: 'boolean',
    mpy(block) {
      const code = 'websocket.is_disonnected()';
      return [code, this.ORDER_FUNCTION_CALL];
    },
    emu(block) {
      const code = 'runtime.extensions.websocket.isDisonnected()';
      return [code, this.ORDER_FUNCTION_CALL];
    },
  },
];
