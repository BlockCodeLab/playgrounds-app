import { Text } from '@blockcode/core';

export const blocks = [
  {
    id: 'request',
    text: (
      <Text
        id="blocks.request.request"
        defaultMessage="request content [MOTHOD] to [URL]"
      />
    ),
    inputs: {
      MOTHOD: {
        type: 'string',
        defaultValue: 'GET',
        menu: [
          ['GET', 'GET'],
          ['POST', 'POST'],
          ['PUT', 'PUT'],
          ['PATCH', 'PATCH'],
          ['DELETE', 'DELETE'],
          ['HEAD', 'HEAD'],
          ['OPTIONS', 'OPTIONS'],
        ],
      },
      URL: {
        type: 'string',
        defaultValue: 'https://make.blockcode.fun/hello.txt',
      },
    },
    mpy(block) {
      let code = '';
      if (this.STATEMENT_PREFIX) {
        code += this.injectId(this.STATEMENT_PREFIX, block);
      }
      const method = this.quote_(block.getFieldValue('MOTHOD')) || '"GET"';
      const url = this.valueToCode(block, 'URL', this.ORDER_NONE) || '""';
      code += `await request.afetch(str(${method}), str(${url}))\n`;
      return code;
    },
    emu(block) {
      let code = '';
      if (this.STATEMENT_PREFIX) {
        code += this.injectId(this.STATEMENT_PREFIX, block);
      }
      const method = this.quote_(block.getFieldValue('MOTHOD')) || '"GET"';
      const url = this.valueToCode(block, 'URL', this.ORDER_NONE) || '""';
      code += `await runtime.extensions.request.fetch(${method}, ${url});\n`;
      return code;
    },
  },
  {
    id: 'clear_cache',
    text: (
      <Text
        id="blocks.request.clearCache"
        defaultMessage="clear request cache"
      />
    ),
    mpy() {
      let code = '';
      if (this.STATEMENT_PREFIX) {
        code += this.injectId(this.STATEMENT_PREFIX, block);
      }
      code += 'request.clear_cache()\n';
      return code;
    },
    emu() {
      let code = '';
      if (this.STATEMENT_PREFIX) {
        code += this.injectId(this.STATEMENT_PREFIX, block);
      }
      code += `runtime.extensions.request.clear();\n`;
      return code;
    },
  },
  {
    id: 'get_content',
    text: (
      <Text
        id="blocks.request.getContent"
        defaultMessage="item [PATH] of content"
      />
    ),
    inputs: {
      PATH: {
        type: 'string',
        defaultValue: 'path.2.item',
      },
    },
    output: 'string',
    mpy(block) {
      const path = this.valueToCode(block, 'PATH', this.ORDER_NONE) || '""';
      const code = `request.get_content(${path})`;
      return [code, this.ORDER_FUNCTION_CALL];
    },
    emu(block) {
      const path = this.valueToCode(block, 'PATH', this.ORDER_NONE) || '""';
      const code = `(await runtime.extensions.request.getJson(${path}))`;
      return [code, this.ORDER_FUNCTION_CALL];
    },
  },
  {
    id: 'get_text',
    text: (
      <Text
        id="blocks.request.getText"
        defaultMessage="text content"
      />
    ),
    output: 'string',
    mpy() {
      const code = `request.get_content()`;
      return [code, this.ORDER_FUNCTION_CALL];
    },
    emu() {
      const code = `(await runtime.extensions.request.getText())`;
      return [code, this.ORDER_FUNCTION_CALL];
    },
  },
  '---',
  {
    id: 'when_responds',
    text: (
      <Text
        id="blocks.request.whenResponds"
        defaultMessage="when a site responds"
      />
    ),
    hat: true,
    mpy() {
      const eventCode = this.eventToCode('request_success', 'False', 'target');
      return `@when(request.REQUEST_SUCCESS, target)\n${eventCode}`;
    },
    emu() {
      return `runtime.when('request.success', ${this.HAT_CALLBACK});\n`;
    },
  },
  {
    id: 'when_fails',
    text: (
      <Text
        id="blocks.request.whenFails"
        defaultMessage="when a request fails"
      />
    ),
    hat: true,
    mpy() {
      const eventCode = this.eventToCode('request_fails', 'False');
      return `@when(request.REQUEST_FAILS)\n${eventCode}`;
    },
    emu() {
      return `runtime.when('request.fails', ${this.HAT_CALLBACK});\n`;
    },
  },
  {
    id: 'is_responds',
    text: (
      <Text
        id="blocks.request.isResponds"
        defaultMessage="site responds?"
      />
    ),
    output: 'boolean',
    mpy() {
      const code = `bool(request.response)`;
      return [code, this.ORDER_FUNCTION_CALL];
    },
    emu() {
      const code = `Boolean(runtime.extensions.request.statusCode)`;
      return [code, this.ORDER_FUNCTION_CALL];
    },
  },
  {
    id: 'status_code',
    text: (
      <Text
        id="blocks.request.statusCode"
        defaultMessage="status code"
      />
    ),
    output: 'number',
    mpy() {
      const code = `(request.response.status if request.response else 0)`;
      return [code, this.ORDER_FUNCTION_CALL];
    },
    emu() {
      const code = `runtime.extensions.request.statusCode`;
      return [code, this.ORDER_FUNCTION_CALL];
    },
  },
  '---',
  {
    id: 'set_content_type',
    text: (
      <Text
        id="blocks.request.setContentType"
        defaultMessage="set content type to [CONTENTTYPE]"
      />
    ),
    inputs: {
      CONTENTTYPE: {
        type: 'string',
        defaultValue: 'text/plain',
        menu: [
          ['application/json', 'application/json'],
          ['text/plain', 'text/plain'],
        ],
      },
    },
    mpy(block) {
      let code = '';
      if (this.STATEMENT_PREFIX) {
        code += this.injectId(this.STATEMENT_PREFIX, block);
      }
      const contentType = this.quote_(block.getFieldValue('CONTENTTYPE') || 'text/plain');
      code += `request.set_header('Content-Type', str(${contentType}))\n`;
      return code;
    },
    emu(block) {
      let code = '';
      if (this.STATEMENT_PREFIX) {
        code += this.injectId(this.STATEMENT_PREFIX, block);
      }
      const contentType = this.quote_(block.getFieldValue('CONTENTTYPE')) || '"text/plain"';
      code += `runtime.extensions.request.setHeaders('Content-Type', ${contentType});\n`;
      return code;
    },
  },
  {
    id: 'set_header',
    text: (
      <Text
        id="blocks.request.setHeader"
        defaultMessage="set headers [HEADER] to [VALUE]"
      />
    ),
    inputs: {
      HEADER: {
        type: 'string',
        defaultValue: 'Content-Type',
      },
      VALUE: {
        type: 'string',
        defaultValue: 'text/plain',
      },
    },
    mpy(block) {
      let code = '';
      if (this.STATEMENT_PREFIX) {
        code += this.injectId(this.STATEMENT_PREFIX, block);
      }
      const header = this.valueToCode(block, 'HEADER', this.ORDER_NONE) || '""';
      const value = this.valueToCode(block, 'VALUE', this.ORDER_NONE) || '""';
      code += `request.set_header(str(${header}), str(${value}))\n`;
      return code;
    },
    emu(block) {
      let code = '';
      if (this.STATEMENT_PREFIX) {
        code += this.injectId(this.STATEMENT_PREFIX, block);
      }
      const header = this.valueToCode(block, 'HEADER', this.ORDER_NONE) || '""';
      const value = this.valueToCode(block, 'VALUE', this.ORDER_NONE) || '""';
      code += `runtime.extensions.request.setHeaders(${key}, ${value});\n`;
      return code;
    },
  },
  {
    id: 'set_param',
    text: (
      <Text
        id="blocks.request.setParam"
        defaultMessage="set param [KEY] to [VALUE]"
      />
    ),
    inputs: {
      KEY: {
        type: 'string',
        defaultValue: (
          <Text
            id="blocks.request.key"
            defaultMessage="key"
          />
        ),
      },
      VALUE: {
        type: 'string',
        defaultValue: (
          <Text
            id="blocks.request.value"
            defaultMessage="value"
          />
        ),
      },
    },
    mpy(block) {
      let code = '';
      if (this.STATEMENT_PREFIX) {
        code += this.injectId(this.STATEMENT_PREFIX, block);
      }
      const key = this.valueToCode(block, 'KEY', this.ORDER_NONE) || '""';
      const value = this.valueToCode(block, 'VALUE', this.ORDER_NONE) || '""';
      code += `request.set_param(str(${key}), str(${value}))\n`;
      return code;
    },
    emu(block) {
      let code = '';
      if (this.STATEMENT_PREFIX) {
        code += this.injectId(this.STATEMENT_PREFIX, block);
      }
      const key = this.valueToCode(block, 'KEY', this.ORDER_NONE) || '""';
      const value = this.valueToCode(block, 'VALUE', this.ORDER_NONE) || '""';
      code += `runtime.extensions.request.setParams(${key}, ${value});\n`;
      return code;
    },
  },
  {
    id: 'set_body',
    text: (
      <Text
        id="blocks.request.setBody"
        defaultMessage="set body [KEY] to [VALUE]"
      />
    ),
    inputs: {
      KEY: {
        type: 'string',
        defaultValue: (
          <Text
            id="blocks.request.key"
            defaultMessage="key"
          />
        ),
      },
      VALUE: {
        type: 'string',
        defaultValue: (
          <Text
            id="blocks.request.value"
            defaultMessage="value"
          />
        ),
      },
    },
    mpy(block) {
      let code = '';
      if (this.STATEMENT_PREFIX) {
        code += this.injectId(this.STATEMENT_PREFIX, block);
      }
      const key = this.valueToCode(block, 'KEY', this.ORDER_NONE) || '""';
      const value = this.valueToCode(block, 'VALUE', this.ORDER_NONE) || '""';
      code += `request.set_body(str(${key}), str(${value}))\n`;
      return code;
    },
    emu(block) {
      let code = '';
      if (this.STATEMENT_PREFIX) {
        code += this.injectId(this.STATEMENT_PREFIX, block);
      }
      const key = this.valueToCode(block, 'KEY', this.ORDER_NONE) || '""';
      const value = this.valueToCode(block, 'VALUE', this.ORDER_NONE) || '""';
      code += `runtime.extensions.request.setBody(${key}, ${value});\n`;
      return code;
    },
  },
];
