import { MathUtils } from '@blockcode/utils';

const SupportedMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

export function emulator(runtime) {
  return {
    getOptions() {
      let options = runtime.getData('request.options');
      if (!options) {
        options = {
          headers: Object.create(null),
          params: Object.create(null),
          body: Object.create(null),
        };
      }
      return options;
    },

    async fetch(method, url) {
      const { headers, params, body } = this.getOptions();

      const option = {
        method: SupportedMethods.includes(method) ? method : 'GET',
        headers,
      };

      if (params) {
        url += `?${Object.entries(params)
          .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
          .join('&')}`;
      }

      if (option.method !== 'GET' && option.method !== 'HEAD' && body) {
        option.body = JSON.stringify(body);
      }

      await fetch(`${url}`, option)
        .then((res) => {
          runtime.setData('request.response', res);
          runtime.run('request.success');
        })
        .catch((e) => {
          runtime.run('request.fails');
        })
        .finally(() => {
          // 清除单次请求的配置
          runtime.setData('request.options', null);
        });
    },

    async getData() {
      let res = runtime.getData('request.response');
      // 如果是原始 Response 数据，则进行转换
      if (res instanceof Response) {
        // 获取 text 数据同时尝试并转换为 json 数据
        res = { text: await res.text(), json: {}, status: res.status };
        try {
          res.json = JSON.parse(res.text);
        } catch (_) {}
        runtime.setData('request.response', res);
      }
      return res;
    },

    async getText() {
      const data = await this.getData();
      return data?.text ?? '';
    },

    async getJson(indexPath) {
      const data = await this.getData();
      if (!data?.json) return '';

      let result = data.json;

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

    get statusCode() {
      const res = runtime.getData('request.response');
      return res?.status ?? 0;
    },

    setHeaders(key, value) {
      const options = this.getOptions();
      options.headers[key] = value;
      runtime.setData('request.options', options);
    },

    setParams(key, value) {
      const options = this.getOptions();
      options.params[key] = value;
      runtime.setData('request.options', options);
    },

    setBody(key, value) {
      const options = this.getOptions();
      options.body[key] = value;
      runtime.setData('request.options', options);
    },

    clear() {
      runtime.setData('request.options', null);
      runtime.setData('request.response', null);
    },
  };
}
