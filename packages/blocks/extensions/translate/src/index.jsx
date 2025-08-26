import { getUserConfig, setUserConfig } from '@blockcode/utils';
import { addLocalesMessages, openPromptModal, Text } from '@blockcode/core';
import { emulator } from './lib/emulator';
import { blocks, menus } from './lib/blocks';
import translateFile from './lib/translate.py';
import aiohttpFile from './lib/aiohttp.py';
import aiohttpWsFile from './lib/aiohttp_ws.py';
import sparkaiFile from './lib/sparkai.py';

import translations from './l10n.yaml';
import iconImage from './icon.png';

addLocalesMessages(translations);

export default {
  icon: iconImage,
  name: (
    <Text
      id="blocks.translate.name"
      defaultMessage="Translate"
    />
  ),
  files: [
    {
      name: 'translate',
      type: 'text/x-python',
      uri: translateFile,
    },
    {
      name: '_aiohttp/__init__',
      type: 'text/x-python',
      uri: aiohttpFile,
    },
    {
      name: '_aiohttp/aiohttp_ws',
      type: 'text/x-python',
      uri: aiohttpWsFile,
    },
    {
      name: '_sparkai',
      type: 'text/x-python',
      uri: sparkaiFile,
    },
  ],
  emulator,
  blocks,
  menus,
  // statusButton: {
  //   onClick() {
  //     return new Promise((resolve) => {
  //       openPromptModal({
  //         title: (
  //           <Text
  //             id="blocks.translate.name"
  //             defaultMessage="Brain"
  //           />
  //         ),
  //         label: (
  //           <Text
  //             id="blocks.translate.name"
  //             defaultMessage="Brain"
  //           />
  //         ),

  //         inputItems: [
  //           {
  //             name: 'apipassword',
  //             label: (
  //               <Text
  //                 id="blocks.translate.openplatform.APIPassword"
  //                 defaultMessage="HTTP authorization APIPassword"
  //               />
  //             ),
  //             placeholder: 'APIPassword',
  //             defaultValue: getUserConfig('SparkAI.APIPassword') ?? '',
  //           },
  //           {
  //             name: 'appid',
  //             label: (
  //               <Text
  //                 id="blocks.translate.openplatform.APPID"
  //                 defaultMessage="WebSocket authorization APPID"
  //               />
  //             ),
  //             placeholder: 'APPID',
  //             defaultValue: getUserConfig('SparkAI.APPID') ?? '',
  //           },
  //           {
  //             name: 'apisecret',
  //             label: (
  //               <Text
  //                 id="blocks.translate.openplatform.APISecret"
  //                 defaultMessage="WebSocket authorization APISecret"
  //               />
  //             ),
  //             placeholder: 'APISecret',
  //             defaultValue: getUserConfig('SparkAI.APISecret') ?? '',
  //           },
  //           {
  //             name: 'apikey',
  //             label: (
  //               <Text
  //                 id="blocks.translate.openplatform.APIKey"
  //                 defaultMessage="WebSocket authorization APIKey"
  //               />
  //             ),
  //             placeholder: 'APIKey',
  //             defaultValue: getUserConfig('SparkAI.APIKey') ?? '',
  //           },
  //         ],
  //         body: (
  //           <>
  //             <Text
  //               id="blocks.translate.openplatform.description1"
  //               defaultMessage="Please register your own "
  //             />
  //             <a
  //               href="https://xinghuo.xfyun.cn/sparkapi"
  //               target="_blank"
  //             >
  //               <Text
  //                 id="blocks.translate.openplatform.description2"
  //                 defaultMessage="iFLYTEK Open Platform (Chinese)"
  //               />
  //             </a>
  //             <Text
  //               id="blocks.translate.openplatform.description3"
  //               defaultMessage=" account, the test account we provide does not guarantee that every request will be successful."
  //             />
  //           </>
  //         ),
  //         onSubmit: (value) => {
  //           setUserConfig('SparkAI.APIPassword', value.apipassword ?? '');
  //           setUserConfig('SparkAI.APPID', value.appid ?? '');
  //           setUserConfig('SparkAI.APISecret', value.apisecret ?? '');
  //           setUserConfig('SparkAI.APIKey', value.apikey ?? '');
  //           resolve();
  //         },
  //       });
  //     });
  //   },
  //   onStatusUpdate() {
  //     const authPass = getUserConfig('SparkAI.APIPassword');
  //     const appId = getUserConfig('SparkAI.APPID');
  //     const apiSecret = getUserConfig('SparkAI.APISecret');
  //     const apiKey = getUserConfig('SparkAI.APIKey');
  //     return authPass || (appId && apiSecret && apiKey);
  //   },
  // },
};
