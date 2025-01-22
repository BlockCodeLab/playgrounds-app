// 当前讯飞星火 HTTP 调用不支持浏览器跨域，
// 而在单片机上使用 WebSocket 调用鉴权不方便获取时间戳，
// 所以在浏览器端用 WebSocket 模拟 fetch 通过 HTTP 调用，
// 尽可能的与单片机上一致。

import hmacSHA256 from 'crypto-js/hmac-sha256';
import Base64 from 'crypto-js/enc-base64';

const SPARK_HOST = 'spark-api.xf-yun.com';

const getPathname = (domain) => {
  switch (domain) {
    case 'lite':
      return '/v1.1/chat';
    case 'generalv3':
      return '/v3.1/chat';
    case 'pro-128k':
      return '/chat/pro-128k';
    case 'generalv3.5':
      return '/v3.5/chat';
    case 'max-32k':
      return '/chat/max-32k';
    case '4.0Ultra':
      return '/v4.0/chat';
  }
};

const getWebSocketUrl = (domain, apiSecret, apiKey) => {
  const date = new Date().toGMTString();

  const pathname = getPathname(domain);

  const signatureRaw = `host: ${SPARK_HOST}\ndate: ${date}\nGET ${pathname} HTTP/1.1`;
  const signature = Base64.stringify(hmacSHA256(signatureRaw, apiSecret));

  const authorizationRaw = `api_key="${apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
  const authorization = btoa(authorizationRaw);

  return `wss://${SPARK_HOST}${pathname}?authorization=${authorization}&date=${date}&host=${SPARK_HOST}`;
};

export function fetchSpark(url, options) {
  const auth = options.auth;
  const body = JSON.parse(options.body);

  const data = {
    header: {
      app_id: auth.appId,
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

  url = getWebSocketUrl(body.model, auth.apiSecret, auth.apiKey);

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
