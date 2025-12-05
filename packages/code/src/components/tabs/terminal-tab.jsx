import { Text } from '@blockcode/core';
import { Terminal } from '../terminal/terminal';

import terminalIcon from './icon-terminal.svg';

export const terminalTab = {
  icon: terminalIcon,
  label: (
    <Text
      id="code.tabs.terminal"
      defaultMessage="Terminal"
    />
  ),
  Content: Terminal,
};
