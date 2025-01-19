import { fetchSpark, getUserConfig } from '@blockcode/utils';

const MAX_HISTORY = 4;

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
  max_tokens: 30, // 最大回答的 Tokens 长度，1 Token 约等于 1.5 个中文汉字或者 0.8 个英文单词
  stream: false, // 流式返回
});

export function emulator(runtime) {
  return {
    get key() {
      return 'brain';
    },

    getHistory(target) {
      return runtime.getData(`brain.${target.id()}.history`) ?? [];
    },

    addHistory(target, message) {
      const history = this.getHistory(target);
      history.push(message);
      if (history.length > MAX_HISTORY) {
        history.shift();
      }
      runtime.setData(`brain.${target.id()}.history`, history);
    },

    getPrompts(target) {
      return runtime.getData(`brain.${target.id()}.prompts`) ?? [];
    },

    addPrompt(target, prompt) {
      const prompts = this.getPrompts(target);
      prompts.push(prompt);
      runtime.setData(`brain.${target.id()}.prompts`, prompts);
    },

    clear(target) {
      runtime.setData(`brain.${target.id()}.history`, null);
      runtime.setData(`brain.${target.id()}.prompts`, null);
      runtime.setData(`brain.${target.id()}.result`, null);
    },

    getAnswer(target) {
      return runtime.getData(`brain.${target.id()}.result`) ?? '';
    },

    async askSpark(target, message, model = 'lite') {
      const apiPassword = getUserConfig('SparkAI.APIPassword') ?? APIPASSWORD;
      const appId = getUserConfig('SparkAI.APPID') ?? APPID;
      const apiSecret = getUserConfig('SparkAI.APISecret') ?? APISecret;
      const apiKey = getUserConfig('SparkAI.APIKey') ?? APIKey;

      const user = target.id();

      // 将当前对话加入历史记录
      this.addHistory(target, {
        role: 'user',
        content: message,
      });

      const prompts = this.getPrompts(target);
      const messages = [].concat(
        // 初始提示词设置
        {
          role: 'system',
          content: `${prompts.join('；')}，只用一句话完成对话。`,
        },
        // 历史记录
        this.getHistory(target),
      );

      let res;
      try {
        res = await fetchSpark(SPARK_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: getHeaders(apiPassword),
          body: JSON.stringify(getBody(messages, { model, user })),
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

      if (res?.choices?.[0]?.message?.content) {
        // 加入回答内容
        this.addHistory(target, res.choices[0].message);
        runtime.setData(`brain.${user}.result`, res.choices[0].message.content);
      }
    },
  };
}
