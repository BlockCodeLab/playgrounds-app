import { Text } from '@blockcode/core';
import { CodeEditor } from '../code-editor/code-editor';

import codeIcon from './icon-code.svg';

export const codeTab = {
  icon: codeIcon,
  label: (
    <Text
      id="code.tabs.code"
      defaultMessage="Code"
    />
  ),
  Content: CodeEditor,
};
