import { getUserConfig } from '@blockcode/utils';
import { Text } from '@blockcode/core';
import { APIPASSWORD } from './emulator';

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
      const prompt = this.valueToCode(block, 'PROMPT', this.ORDER_NONE) || '';
      const code = `runtime.extensions.brain.addPrompt(target, ${prompt});\n`;
      return code;
    },
    mpy(block) {
      const prompt = this.valueToCode(block, 'PROMPT', this.ORDER_NONE) || '';
      const code = `brain.set_prompt((target.id if 'target' in dir() else 'default'), ${prompt})\n`;
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
      const question = this.valueToCode(block, 'QUESTION', this.ORDER_NONE) || '""';
      const code = `await runtime.extensions.brain.askSpark(target, ${question})\n`;
      return code;
    },
    mpy(block) {
      const model = this.quote_(getUserConfig('SparkAI.Model') ?? 'lite');
      const apiPassword = this.quote_(getUserConfig('SparkAI.APIPassword') ?? APIPASSWORD);
      const question = this.valueToCode(block, 'QUESTION', this.ORDER_NONE) || '""';
      const code = `await brain.ask_spark((target.id if 'target' in dir() else 'default'), ${question}, ${apiPassword}, ${model})\n`;
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
    emu(block) {
      const code = `runtime.extensions.brain.getAnswer(target)`;
      return [code, this.ORDER_FUNCTION_CALL];
    },
    mpy(block) {
      const code = `brain.get_answer(target.id if 'target' in dir() else 'default')`;
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
      const code = `runtime.extensions.brain.clear(target);\n`;
      return code;
    },
    mpy(block) {
      const code = `brain.clear(target.id if 'target' in dir() else 'default')\n`;
      return code;
    },
  },
];
