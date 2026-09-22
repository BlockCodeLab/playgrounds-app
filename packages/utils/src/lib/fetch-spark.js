// 当前讯飞星火 HTTP 调用不支持浏览器跨域，
// 而在单片机上使用 WebSocket 调用鉴权不方便获取时间戳，
// 所以在浏览器端用 WebSocket 模拟 fetch 通过 HTTP 调用，
// 尽可能的与单片机上一致。



export function fetchSpark(url, options) {
  const body = JSON.parse(options.body);

  const data = {
    header: {
      app_id: options.appId || body.app_id,
      uid: body.user,
    },
    parameter: {
      chat: {
        domain: body.model,
        temperature: body.temperature,
        top_k: body.top_k,
        max_tokens: body.max_tokens,
      },
    },
    payload: {
      message: {
        text: body.messages,
      },
    },
  };

  return new Promise((resolve, reject) => {
    let message = '';
    const ws = new WebSocket(url);
    ws.onopen = () => ws.send(JSON.stringify(data));
    ws.onerror = (e) => reject(e);
    ws.onmessage = async (e) => {
      const data = JSON.parse(e.data);
      if (data.header.code !== 0) {
        return reject(new Error(`Error code: ${data.header.code}`));
      }
      // 合并信息
      message += data.payload.choices.text.map((text) => text.content).join('');
      // 结束会话并返回信息
      if (data.header.status === 2) {
        ws.close();
        resolve({
          json() {
            return {
              choices: [
                {
                  message: {
                    role: 'assistant',
                    content: message.trim(),
                  },
                  index: 0,
                },
              ],
            };
          },
        });
      }
    };
  });
}
