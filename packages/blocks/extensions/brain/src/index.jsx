import { getUserConfig, setUserConfig } from '@blockcode/utils';
import { addLocalesMessages, openPromptModal, Text } from '@blockcode/core';
import { emulator } from './emulator';
import { blocks } from './blocks';

import translations from './l10n.yaml';
import iconImage from './icon.svg';
import brainFile from './brain.py';

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
  ],
  statusButton: {
    onClick() {
      return new Promise((resolve) => {
        openPromptModal({
          title: (
            <Text
              id="blocks.brain.name"
              defaultMessage="Brain"
            />
          ),
          label: (
            <Text
              id="blocks.brain.name"
              defaultMessage="Brain"
            />
          ),
          inputItems: [
            {
              name: 'apipassword',
              label: 'HTTP 服务鉴权 APIPassword',
              placeholder: 'APIPassword',
              defaultValue: getUserConfig('SparkAI.APIPassword') ?? '',
            },
            {
              name: 'appid',
              label: 'WebSocket 服务鉴权 APPID',
              placeholder: 'APPID',
              defaultValue: getUserConfig('SparkAI.APPID') ?? '',
            },
            {
              name: 'apisecret',
              label: 'WebSocket 服务鉴权 APISecret',
              placeholder: 'APISecret',
              defaultValue: getUserConfig('SparkAI.APISecret') ?? '',
            },
            {
              name: 'apikey',
              label: 'WebSocket 服务鉴权 APIKey',
              placeholder: 'APIKey',
              defaultValue: getUserConfig('SparkAI.APIKey') ?? '',
            },
          ],
          body: (
            <>
              <Text
                id="blocks.brain.openplatform.description1"
                defaultMessage="Please register your own "
              />
              <a
                href="https://xinghuo.xfyun.cn/sparkapi"
                target="_blank"
              >
                <Text
                  id="blocks.brain.openplatform.description2"
                  defaultMessage="iFLYTEK Open Platform (Chinese)"
                />
              </a>
              <Text
                id="blocks.brain.openplatform.description3"
                defaultMessage=" account, the test account we provide does not guarantee that every request will be successful."
              />
            </>
          ),
          onSubmit: (value) => {
            setUserConfig('SparkAI.APIPassword', value.apipassword ?? '');
            setUserConfig('SparkAI.APPID', value.appid ?? '');
            setUserConfig('SparkAI.APISecret', value.apisecret ?? '');
            setUserConfig('SparkAI.APIKey', value.apikey ?? '');
            resolve();
          },
        });
      });
    },
    onStatusUpdate() {
      const authPass = getUserConfig('SparkAI.APIPassword');
      const appId = getUserConfig('SparkAI.APPID');
      const apiSecret = getUserConfig('SparkAI.APISecret');
      const apiKey = getUserConfig('SparkAI.APIKey');
      return authPass || (appId && apiSecret && apiKey);
    },
  },
  emulator,
  blocks,
};
