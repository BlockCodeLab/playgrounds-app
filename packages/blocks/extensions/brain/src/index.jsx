import { getUserConfig, setUserConfig } from '@blockcode/utils';
import { addLocalesMessages, openPromptModal, Text } from '@blockcode/core';
import { emulator } from './lib/emulator';
import { blocks } from './lib/blocks';
import brainFile from './lib/brain.py';
import aiohttpFile from './lib/aiohttp.py';
import aiohttpWsFile from './lib/aiohttp_ws.py';
import sparkaiFile from './lib/sparkai.py';

import translations from './l10n.yaml';
import iconImage from './icon.svg';

addLocalesMessages(translations);

export default {
  icon: iconImage,
  name: (
    <Text
      id="blocks.brain.name"
      defaultMessage="Brain"
    />
  ),
  files: [
    {
      name: 'brain',
      type: 'text/x-python',
      uri: brainFile,
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
  // statusButton: {
  //   onClick() {
  //     return new Promise((resolve) => {
  //       openPromptModal({
  //         title: (
  //           <Text
  //             id="blocks.brain.name"
  //             defaultMessage="Brain"
  //           />
  //         ),
  //         label: (
  //           <Text
  //             id="blocks.brain.name"
  //             defaultMessage="Brain"
  //           />
  //         ),

  //         inputItems: [
  //           {
  //             name: 'apipassword',
  //             label: (
  //               <Text
  //                 id="blocks.brain.openplatform.APIPassword"
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
  //                 id="blocks.brain.openplatform.APPID"
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
  //                 id="blocks.brain.openplatform.APISecret"
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
  //                 id="blocks.brain.openplatform.APIKey"
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
  //               id="blocks.brain.openplatform.description1"
  //               defaultMessage="Please register your own "
  //             />
  //             <a
  //               href="https://xinghuo.xfyun.cn/sparkapi"
  //               target="_blank"
  //             >
  //               <Text
  //                 id="blocks.brain.openplatform.description2"
  //                 defaultMessage="iFLYTEK Open Platform (Chinese)"
  //               />
  //             </a>
  //             <Text
  //               id="blocks.brain.openplatform.description3"
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
