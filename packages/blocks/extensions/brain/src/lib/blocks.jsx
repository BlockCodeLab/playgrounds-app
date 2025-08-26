import { getUserConfig } from '@blockcode/utils';
import { Text } from '@blockcode/core';
import { APIPASSWORD } from './emulator';

export const blocks = (meta) => [
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
      const model = this.quote_(getUserConfig('SparkAI.Model') ?? 'lite');
      const apiPassword = this.quote_(getUserConfig('SparkAI.APIPassword') ?? APIPASSWORD);
      this.definitions_['my_brain'] = `my_brain = brain.Brain(${apiPassword}, ${model})`;

      const prompt = this.valueToCode(block, 'PROMPT', this.ORDER_NONE) || '';
      const code = `my_brain.add_prompt(${prompt})\n`;
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
      this.definitions_['my_brain'] = `my_brain = brain.Brain(${apiPassword}, ${model})`;

      const question = this.valueToCode(block, 'QUESTION', this.ORDER_NONE) || '""';
      const code = `await my_brain.ask(${question})\n`;
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
      const model = this.quote_(getUserConfig('SparkAI.Model') ?? 'lite');
      const apiPassword = this.quote_(getUserConfig('SparkAI.APIPassword') ?? APIPASSWORD);
      this.definitions_['my_brain'] = `my_brain = brain.Brain(${apiPassword}, ${model})`;

      return ['my_brain.result', this.ORDER_MEMBER];
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
      const model = this.quote_(getUserConfig('SparkAI.Model') ?? 'lite');
      const apiPassword = this.quote_(getUserConfig('SparkAI.APIPassword') ?? APIPASSWORD);
      this.definitions_['my_brain'] = `my_brain = brain.Brain(${apiPassword}, ${model})`;

      const code = `my_brain.clear()\n`;
      return code;
    },
  },
];
