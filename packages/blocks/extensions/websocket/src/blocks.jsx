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
    mpy(block) {},
    emu(block) {},
  },
  '---',
  {
    id: 'send',
    text: (
      <Text
        id="blocks.websocket.send"
        defaultMessage="send message [MESSAGE] with [ENCODE]"
      />
    ),
    inputs: {
      MESSAGE: {
        type: 'text',
        defaultValue: 'hello',
      },
      ENCODE: {
        type: 'text',
        menu: [
          [
            <Text
              id="blocks.websocket.encodeText"
              defaultMessage="text"
            />,
            'text',
          ],
          [
            <Text
              id="blocks.websocket.encodeBase64"
              defaultMessage="base64"
            />,
            'base64',
          ],
        ],
      },
    },
    mpy(block) {},
    emu(block) {},
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
    mpy(block) {},
    emu(block) {},
  },
  {
    id: 'receivedDecode',
    text: (
      <Text
        id="blocks.websocket.receivedDecode"
        defaultMessage="decode received message via [DECODE]"
      />
    ),
    inputs: {
      DECODE: {
        type: 'text',
        menu: [
          [
            <Text
              id="blocks.websocket.decodeJSON"
              defaultMessage="json"
            />,
            'json',
          ],
          [
            <Text
              id="blocks.websocket.decodeBase64"
              defaultMessage="base64"
            />,
            'base64',
          ],
        ],
      },
    },
    mpy(block) {},
    emu(block) {},
  },
  {
    id: 'receivedObject',
    text: (
      <Text
        id="blocks.websocket.receivedObject"
        defaultMessage="item [PATH] of received data"
      />
    ),
    output: 'text',
    inputs: {
      PATH: {
        type: 'text',
        defaultValue: 'path.2.item',
      },
    },
    mpy(block) {},
    emu(block) {},
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
    mpy(block) {},
    emu(block) {},
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
    mpy(block) {},
    emu(block) {},
  },
  {
    id: 'isConnected',
    text: (
      <Text
        id="blocks.websocket.isConnected"
        defaultMessage="is connected?"
      />
    ),
    output: 'boolean',
    mpy(block) {},
    emu(block) {},
  },
  '---',
  {
    id: 'whenConnectionErrors',
    text: (
      <Text
        id="blocks.websocket.whenConnectionErrors"
        defaultMessage="when connection errors"
      />
    ),
    hat: true,
    mpy(block) {},
    emu(block) {},
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
    mpy(block) {},
    emu(block) {},
  },
  '---',
  {
    id: 'whenConnectionCloses',
    text: (
      <Text
        id="blocks.websocket.whenConnectionCloses"
        defaultMessage="when connection closes"
      />
    ),
    hat: true,
    mpy(block) {},
    emu(block) {},
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
    mpy(block) {},
    emu(block) {},
  },
  {
    id: 'closeConnection',
    text: (
      <Text
        id="blocks.websocket.closeConnection"
        defaultMessage="close connection"
      />
    ),
    mpy(block) {},
    emu(block) {},
  },
];
