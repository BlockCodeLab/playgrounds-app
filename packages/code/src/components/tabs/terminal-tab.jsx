import { useEffect } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { useAppContext, setAppState, Text } from '@blockcode/core';
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
  Content: (props) => {
    const { appState } = useAppContext();
    const panelBoxId = useSignal(null);

    // 强制关闭 Serial
    if (appState.value?.panelBoxId === 'Serial') {
      panelBoxId.value = 'Serial';
      setAppState('panelBoxId', null);
    } else if (appState.value?.panelBoxId) {
      panelBoxId.value = appState.value?.panelBoxId;
    }

    // 恢复关闭的 Serial
    useEffect(() => {
      return () => {
        if (panelBoxId.value === 'Serial') {
          setAppState('panelBoxId', 'Serial');
        }
      };
    }, []);
    return <Terminal {...props} />;
  },
};
