import { getUserConfig } from '@blockcode/utils';
import { Text } from '@blockcode/core';
import { APIPASSWORD } from './emulator';

export const blocks = [
  {
    id: 'translate',
    text: (
      <Text
        id="blocks.translate.translate"
        defaultMessage="translate [WORDS] to [LANGUAGE]"
      />
    ),
    output: 'string',
    inputs: {
      WORDS: {
        type: 'string',
        defaultValue: (
          <Text
            id="blocks.translate.hello"
            defaultMessage="hello"
          />
        ),
      },
      LANGUAGE: {
        menu: 'languageMenu',
      },
    },
    emu(block) {
      const model = this.quote_(getUserConfig('SparkAI.Model') ?? 'lite');
      const words = this.valueToCode(block, 'WORDS', this.ORDER_NONE);
      const language = this.valueToCode(block, 'LANGUAGE', this.ORDER_NONE);
      const code = `(await runtime.extensions.translate.translate(${words}, ${language}, ${model}))`;
      return [code, this.ORDER_FUNCTION_CALL];
    },
    mpy(block) {
      const model = this.quote_(getUserConfig('SparkAI.Model') ?? 'lite');
      const apiPassword = this.quote_(getUserConfig('SparkAI.APIPassword') ?? APIPASSWORD);
      const words = this.valueToCode(block, 'WORDS', this.ORDER_NONE);
      const language = this.valueToCode(block, 'LANGUAGE', this.ORDER_NONE);
      const code = `(await translate.translate(${words}, ${language}, ${apiPassword}, ${model}))`;
      return [code, this.ORDER_FUNCTION_CALL];
    },
  },
  // {
  //   id: 'language',
  //   text: (
  //     <Text
  //       id="blocks.translate.language"
  //       defaultMessage="language"
  //     />
  //   ),
  //   output: 'string',
  //   emu(block) {
  //     return ['runtime.extensions.translate.language', this.ORDER_MEMBER];
  //   },
  //   mpy(block) {
  //     return ['translate.get_language()', this.ORDER_FUNCTION_CALL];
  //   },
  // },
];

export const menus = {
  languageMenu: {
    inputMode: true,
    type: 'string',
    defaultValue: 'English',
    items: [
      [
        <Text
          id="blocks.translate.english"
          defaultMessage="English"
        />,
        'English',
      ],
      [
        <Text
          id="blocks.translate.chinese"
          defaultMessage="Chinese"
        />,
        '中文',
      ],
      [
        <Text
          id="blocks.translate.japanese"
          defaultMessage="Japanese"
        />,
        '日本語',
      ],
      [
        <Text
          id="blocks.translate.korean"
          defaultMessage="Korean"
        />,
        '한국어',
      ],
    ],
  },
};
