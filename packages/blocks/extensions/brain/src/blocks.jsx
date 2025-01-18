import { getUserConfig } from '@blockcode/utils';
import { Text } from '@blockcode/core';
import { AUTH_PASS } from './emulator';

export const blocks = [
  {
    id: 'addPrompt',
    text: (
      <Text
        id="blocks.brain.addPrompt"
        defaultMessage="add [PROMPT] prompt to Brain"
      />
    ),
    inputs: {
      PROMPT: {
        type: 'string',
        defaultValue: (
          <Text
            id="blocks.brain.prompt"
            defaultMessage="your role is a cat"
          />
        ),
      },
    },
    emu(block) {
      let code = '';
      if (this.STATEMENT_PREFIX) {
        code += this.injectId(this.STATEMENT_PREFIX, block);
      }
      const prompt = this.valueToCode(block, 'PROMPT', this.ORDER_NONE) || '';
      code += `runtime.extensions.brain.addPrompt(target, ${prompt});\n`;
      return code;
    },
    mpy(block) {
      let code = '';
      if (this.STATEMENT_PREFIX) {
        code += this.injectId(this.STATEMENT_PREFIX, block);
      }
      const prompt = this.valueToCode(block, 'PROMPT', this.ORDER_NONE) || '';
      code += `brain.set_prompt(target, ${prompt})\n`;
      return code;
    },
  },
  {
    id: 'askQuestion',
    text: (
      <Text
        id="blocks.brain.askQuestion"
        defaultMessage="ask Brain [QUESTION] and wait"
      />
    ),
    inputs: {
      QUESTION: {
        type: 'string',
        defaultValue: (
          <Text
            id="blocks.brain.question"
            defaultMessage="Who are you?"
          />
        ),
      },
    },
    emu(block) {
      let code = '';
      if (this.STATEMENT_PREFIX) {
        code += this.injectId(this.STATEMENT_PREFIX, block);
      }
      const question = this.valueToCode(block, 'QUESTION', this.ORDER_NONE) || '""';
      code += `await runtime.extensions.brain.askSpark(target, ${question})\n`;
      return code;
    },
    mpy(block) {
      const model = getUserConfig('SparkAI.Model') ?? 'lite';
      const authPass = getUserConfig('SparkAI.AuthPass') ?? AUTH_PASS;
      let code = '';
      if (this.STATEMENT_PREFIX) {
        code += this.injectId(this.STATEMENT_PREFIX, block);
      }
      const question = this.valueToCode(block, 'QUESTION', this.ORDER_NONE) || '""';
      code += `await brain.ask_spark(target, ${question}, '${authPass}', '${model}')\n`;
      return code;
    },
  },
  {
    id: 'answer',
    text: (
      <Text
        id="blocks.brain.answer"
        defaultMessage="answer"
      />
    ),
    output: 'string',
    emu() {
      const code = `runtime.extensions.brain.getAnswer(target)`;
      return [code, this.ORDER_FUNCTION_CALL];
    },
    mpy() {
      const code = `brain.get_answer(target)`;
      return [code, this.ORDER_FUNCTION_CALL];
    },
  },
  '---',
  {
    id: 'clearPrompt',
    text: (
      <Text
        id="blocks.brain.clearHistory"
        defaultMessage="delete all history"
      />
    ),
    emu(block) {
      let code = '';
      if (this.STATEMENT_PREFIX) {
        code += this.injectId(this.STATEMENT_PREFIX, block);
      }
      code += `runtime.extensions.brain.clear(target);\n`;
      return code;
    },
    mpy(block) {
      let code = '';
      if (this.STATEMENT_PREFIX) {
        code += this.injectId(this.STATEMENT_PREFIX, block);
      }
      code += `brain.clear(target)\n`;
      return code;
    },
  },
];
