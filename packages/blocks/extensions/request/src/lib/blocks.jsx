import { Text } from '@blockcode/core';

export const blocks = (meta) => [
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
      const method = this.quote_(block.getFieldValue('MOTHOD')) || '"GET"';
      const url = this.valueToCode(block, 'URL', this.ORDER_NONE) || '""';
      let code = '';
      code += `await request.fetch(str(${method}), str(${url})`;

      // Scratch Arcade 的事件
      if (meta.editor === '@blockcode/gui-arcade') {
        code += ', lambda: runtime.fire("REQUEST_SUCCESS"), lambda: runtime.fire("REQUEST_FAILS")';
      }

      code += ')\n';
      return code;
    },
    emu(block) {
      const method = this.quote_(block.getFieldValue('MOTHOD')) || '"GET"';
      const url = this.valueToCode(block, 'URL', this.ORDER_NONE) || '""';
      const code = `await runtime.extensions.request.fetch(target, ${method}, ${url});\n`;
      return code;
    },
  },
  '---',
  {
    id: 'clear_cache',
    text: (
      <Text
        id="blocks.request.clearCache"
        defaultMessage="clear request cache"
      />
    ),
    mpy(block) {
      const code = 'request.clear_cache()\n';
      return code;
    },
    emu(block) {
      const code = `runtime.extensions.request.clear(target);\n`;
      return code;
    },
  },
  '---',
  {
    id: 'get_content',
    text: (
      <Text
        id="blocks.request.getContent"
        defaultMessage="item [PATH] of responded JSON data"
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
      const code = `(await runtime.extensions.request.getJson(target, ${path}))`;
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
    mpy(block) {
      const code = `request.get_text()`;
      return [code, this.ORDER_FUNCTION_CALL];
    },
    emu(block) {
      const code = `(await runtime.extensions.request.getText(target))`;
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
    mpy(block) {
      let branchCode = this.statementToCode(block);
      branchCode = this.addEventTrap(branchCode, block.id);
      branchCode = branchCode.replace('():\n', '(target):\n');

      let code = '';
      code += `@when(request.REQUEST_SUCCESS, target)\n`;
      code += branchCode;
      return code;
    },
    emu(block) {
      let branchCode = this.statementToCode(block);
      branchCode = this.addEventTrap(branchCode, block.id);
      branchCode = branchCode.replace('(done) => {\n', '(target, done) => {\n');

      const code = `runtime.when('request.success', ${branchCode}, target);\n`;
      return code;
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
    mpy(block) {
      let branchCode = this.statementToCode(block);
      branchCode = this.addEventTrap(branchCode, block.id);
      branchCode = branchCode.replace('():\n', '(target):\n');

      let code = '';
      code += `@when(request.REQUEST_FAILS, target)\n`;
      code += branchCode;
      return code;
    },
    emu(block) {
      let branchCode = this.statementToCode(block);
      branchCode = this.addEventTrap(branchCode, block.id);
      branchCode = branchCode.replace('(done) => {\n', '(target, done) => {\n');

      const code = `runtime.when('request.fails', ${branchCode}, target);\n`;
      return code;
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
    mpy(block) {
      const code = `(request.response.status if request.response else 0)`;
      return [code, this.ORDER_FUNCTION_CALL];
    },
    emu(block) {
      const code = `runtime.extensions.request.getStatusCode(target)`;
      return [code, this.ORDER_FUNCTION_CALL];
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
    mpy(block) {
      const code = `bool(request.response)`;
      return [code, this.ORDER_FUNCTION_CALL];
    },
    emu(block) {
      const code = `Boolean(runtime.extensions.request.getStatusCode(target))`;
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
      const contentType = this.quote_(block.getFieldValue('CONTENTTYPE') || 'text/plain');
      const code = `request.set_header('Content-Type', str(${contentType}))\n`;
      return code;
    },
    emu(block) {
      const contentType = this.quote_(block.getFieldValue('CONTENTTYPE')) || '"text/plain"';
      const code = `runtime.extensions.request.setHeaders(target, 'Content-Type', ${contentType});\n`;
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
      const header = this.valueToCode(block, 'HEADER', this.ORDER_NONE) || '""';
      const value = this.valueToCode(block, 'VALUE', this.ORDER_NONE) || '""';
      const code = `request.set_header(str(${header}), str(${value}))\n`;
      return code;
    },
    emu(block) {
      const header = this.valueToCode(block, 'HEADER', this.ORDER_NONE) || '""';
      const value = this.valueToCode(block, 'VALUE', this.ORDER_NONE) || '""';
      const code = `runtime.extensions.request.setHeaders(target, ${key}, ${value});\n`;
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
      const key = this.valueToCode(block, 'KEY', this.ORDER_NONE) || '""';
      const value = this.valueToCode(block, 'VALUE', this.ORDER_NONE) || '""';
      const code = `request.set_param(str(${key}), str(${value}))\n`;
      return code;
    },
    emu(block) {
      const key = this.valueToCode(block, 'KEY', this.ORDER_NONE) || '""';
      const value = this.valueToCode(block, 'VALUE', this.ORDER_NONE) || '""';
      const code = `runtime.extensions.request.setParams(target, ${key}, ${value});\n`;
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
      const key = this.valueToCode(block, 'KEY', this.ORDER_NONE) || '""';
      const value = this.valueToCode(block, 'VALUE', this.ORDER_NONE) || '""';
      const code = `request.set_body(str(${key}), str(${value}))\n`;
      return code;
    },
    emu(block) {
      const key = this.valueToCode(block, 'KEY', this.ORDER_NONE) || '""';
      const value = this.valueToCode(block, 'VALUE', this.ORDER_NONE) || '""';
      const code = `runtime.extensions.request.setBody(target, ${key}, ${value});\n`;
      return code;
    },
  },
];
