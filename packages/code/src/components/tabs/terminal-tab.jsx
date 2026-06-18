import { useEffect } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { useAppContext, setAppState, Text } from '@blockcode/core';
import { Terminal } from '../terminal/terminal';
import { PanelBoxes } from '../panel-box/panel-box';

import terminalIcon from './icon-terminal.svg';

export const terminalTab = {
  icon: terminalIcon,
  label: (
    <Text
      id="code.tabs.terminal"
      defaultMessage="Serial Terminal"
    />
  ),
  Content: (props) => {
    const { appState } = useAppContext();
    const panelBoxId = useSignal(
      appState.value?.panelBoxId === PanelBoxes.Serial ? PanelBoxes.Logs : appState.value?.panelBoxId,
    );

    // 强制切换
    if (appState.value?.panelBoxId === PanelBoxes.Serial) {
      setAppState('panelBoxId', panelBoxId.value || PanelBoxes.Logs);
    } else {
      panelBoxId.value = appState.value?.panelBoxId;
    }

    return <Terminal {...props} />;
  },
};
