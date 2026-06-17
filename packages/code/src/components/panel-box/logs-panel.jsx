import { useComputed } from '@preact/signals';
import { logger, themeColors } from '@blockcode/core';
import { Terminal } from '@blockcode/code';

export function LogsPanel() {
  const logs = useComputed(() => logger.logs.join('\r\n'));
  return (
    <Terminal
      textValue={logs.value}
      options={{
        theme: {
          cursor: '#fff',
          foreground: themeColors.ui.text.primary,
          background: '#fff',
          selection: themeColors.ui.text.primary,
        },
      }}
    />
  );
}
