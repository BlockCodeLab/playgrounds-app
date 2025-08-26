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
      const url = this.valueToCode(block, 'URL', this.ORDER_NONE);
      const code = `await websocket.connect(${url})\n`;
      return code;
    },
    emu(block) {
      const url = this.valueToCode(block, 'URL', this.ORDER_NONE);
      const code = `await runtime.extensions.websocket.connect(${url});\n`;
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
      const message = this.valueToCode(block, 'MESSAGE', this.ORDER_NONE);
      const code = `websocket.send(${message})\n`;
      return code;
    },
    emu(block) {
      const message = this.valueToCode(block, 'MESSAGE', this.ORDER_NONE);
      const code = `runtime.extensions.websocket.send(${message});\n`;
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
      let branchCode = this.statementToCode(block);
      branchCode = this.addEventTrap(branchCode, block.id);

      let code = '';
      code += `@when(websocket.WEBSOCKET_RECEIVED)\n`;
      code += branchCode;
      return code;
    },
    emu(block) {
      let branchCode = this.statementToCode(block);
      branchCode = this.addEventTrap(branchCode, block.id);

      const code = `runtime.when('websocket.received', ${branchCode});\n`;
      return code;
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
      let branchCode = this.statementToCode(block);
      branchCode = this.addEventTrap(branchCode, block.id);

      let code = '';
      code += `@when(websocket.WEBSOCKET_CONNECTED)\n`;
      code += branchCode;
      return code;
    },
    emu(block) {
      let branchCode = this.statementToCode(block);
      branchCode = this.addEventTrap(branchCode, block.id);

      const code = `runtime.when('websocket.connected', ${branchCode});\n`;
      return code;
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
      let branchCode = this.statementToCode(block);
      branchCode = this.addEventTrap(branchCode, block.id);

      let code = '';
      code += `@when(websocket.WEBSOCKET_ERRORS)\n`;
      code += branchCode;
      return code;
    },
    emu(block) {
      let branchCode = this.statementToCode(block);
      branchCode = this.addEventTrap(branchCode, block.id);

      const code = `runtime.when('websocket.errors', ${branchCode});\n`;
      return code;
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
      let branchCode = this.statementToCode(block);
      branchCode = this.addEventTrap(branchCode, block.id);

      let code = '';
      code += `@when(websocket.WEBSOCKET_DISCONNECTED)\n`;
      code += branchCode;
      return code;
    },
    emu(block) {
      let branchCode = this.statementToCode(block);
      branchCode = this.addEventTrap(branchCode, block.id);

      const code = `runtime.when('websocket.disconnected', ${branchCode});\n`;
      return code;
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
      const code = 'websocket.disconnect()\n';
      return code;
    },
    emu(block) {
      const code = 'runtime.extensions.websocket.disconnect();\n';
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
