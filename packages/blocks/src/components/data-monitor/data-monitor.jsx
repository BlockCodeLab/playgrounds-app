import { classNames } from '@blockcode/utils';
import { useAppContext } from '@blockcode/core';
import { MonitorTypes } from '../../lib/monitor-types';

import { MonitorValue } from './monitor-value';
import styles from './data-monitor.module.css';

export function DataMonitor({ offset }) {
  const { appState } = useAppContext();
  return (
    <div
      className={styles.dataMonitorWrapper}
      style={offset}
    >
      {appState.value?.monitors?.map?.((monitor) =>
        monitor.type === MonitorTypes.Value ? (
          <MonitorValue
            className={styles.monitorItem}
            data={monitor}
          />
        ) : null,
      )}
    </div>
  );
}
