import { fetchSpark, getUserConfig, getUserLanguage } from '@blockcode/utils';

const SPARK_URL = 'https://spark-api-open.xf-yun.com/v1/chat/completions';

// 仅供免费测试使用，不能保证每次请求的稳定和成功
// HTTP 请求鉴权信息
export const APIPASSWORD = 'qQIJHdBFkpbHDoMnPqnW:oeanHZdXCBHIHTOYvVim';

// WebSocket 请求鉴权信息
const APPID = 'db45f79e';
const APISecret = 'MWFiNjVmNDA4YjNhODFkZGE0MGQ1YWRj';
const APIKey = '6a3dfe79b9e9ec588ca65bf3b9d9c847';

const getHeaders = (apiPassword = APIPASSWORD) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${apiPassword}`,
});

// HTTP 请求参数
const getBody = (messages, options = {}) => ({
  // 选择模型
  model: options.model ?? 'lite',
  // 消息
  user: options.user ?? 'default',
  messages: messages,
  // 配置
  temperature: 0.4, // 核采样阈值，取值越大，生成的随机性越高；取值越低，生成的确定性越高 (0, 1]
  top_k: 3, // 从k个中随机选择一个 [1,6]
  // presence_penalty: 0, // 重复词的惩罚值 [-2.0,2.0]
  // frequency_penalty: 0, // 频率惩罚值 [-2.0,2.0]
  max_tokens: 70, // 最大回答的 Tokens 长度，1 Token 约等于 1.5 个中文汉字或者 0.8 个英文单词
  stream: false, // 流式返回
});

const LANGUAGES = {
  en: 'English',
  zh: '中文',
  jp: '日本語',
  ko: '한국어',
};

export function emulator(runtime) {
  return {
    get key() {
      return 'translate';
    },

    get language() {
      const lang = getUserLanguage();
      return LANGUAGES[lang.slice(0, 2)];
    },

    async translate(text, language, model = 'lite') {
      const apiPassword = getUserConfig('SparkAI.APIPassword') || APIPASSWORD;
      const appId = getUserConfig('SparkAI.APPID') || APPID;
      const apiSecret = getUserConfig('SparkAI.APISecret') || APISecret;
      const apiKey = getUserConfig('SparkAI.APIKey') || APIKey;

      if (!Object.values(LANGUAGES).includes(language)) {
        return text;
      }

      let res;
      try {
        res = await fetchSpark(SPARK_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: getHeaders(apiPassword),
          body: JSON.stringify(
            getBody(
              [
                {
                  role: 'system',
                  content: 'You are an excellent translator.',
                },
                {
                  role: 'user',
                  content: `Translate the following text to ${language}:\n\n ${text}`,
                },
              ],
              { model },
            ),
          ),
          auth: {
            appId,
            apiSecret,
            apiKey,
          },
        });
        res = await res.json();
      } catch (err) {
        console.error(err);
      }

      return res?.choices?.[0]?.message?.content ?? text;
    },
  };
}
