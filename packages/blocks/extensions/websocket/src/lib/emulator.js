export function emulator(runtime) {
  const lastReceived = {};

  let socket;
  let errors;

  runtime.on('stop', () => {
    runtime.extensions.websocket?.disconnect?.();
  });

  return {
    get key() {
      return 'websocket';
    },

    connect(url) {
      this.disconnect();
      return new Promise((resolve) => {
        try {
          const ws = new WebSocket(`${url}`);
          ws.addEventListener('open', () => {
            socket = ws;
            runtime.run('websocket.connected');
            resolve();
          });
          ws.addEventListener('message', (event) => {
            errors = null;
            if (lastReceived.text !== event.data) {
              delete lastReceived.json;
            }
            lastReceived.text = event.data;
            runtime.run('websocket.received');
          });
          ws.addEventListener('close', () => {
            runtime.run('websocket.disconnected');
            errors = null;
            socket = null;
          });
          ws.addEventListener('error', (e) => {
            errors = e;
            runtime.run('websocket.errors');
            resolve();
          });
        } catch (e) {
          errors = e;
          runtime.run('websocket.errors');
          resolve();
        }
      });
    },

    disconnect() {
      if (socket) {
        socket.close();
        runtime.run('websocket.disconnected');
        errors = null;
        socket = null;
      }
    },

    isConnected() {
      return socket?.readyState === WebSocket.OPEN;
    },

    isDisconnected() {
      return !socket || socket.readyState === WebSocket.CLOSED || socket.readyState === WebSocket.CLOSING;
    },

    isErrors() {
      return errors != null;
    },

    send(message) {
      if (this.isConnected()) {
        errors = null;
        try {
          if (typeof message === 'object') {
            message = JSON.stringify(message);
          }
          socket.send(message);
        } catch (e) {
          errors = e;
          runtime.run('websocket.errors');
        }
      }
    },

    getText() {
      return lastReceived.text ?? '';
    },

    getData(indexPath) {
      if (!lastReceived.text) {
        return '';
      }
      if (!lastReceived.json) {
        try {
          lastReceived.json = JSON.parse(lastReceived.text);
        } catch (e) {
          lastReceived.json = {};
        }
      }

      let result = lastReceived;
      indexPath = `${indexPath}`.split('.');
      for (const i of indexPath) {
        result = Array.isArray(result) ? result.at(MathUtils.serialToIndex(i, result.length)) : result[i];
        // 如果所指路径不达则返回空白
        if (result !== 0 && !result) {
          return '';
        }
      }
      return result;
    },
  };
}
