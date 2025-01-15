import { classNames } from '@blockcode/utils';
import { useAppContext } from '@blockcode/core';
import { MonitorTypes } from '../../lib/monitor-types';

import { MonitorValue } from './monitor-value';
import styles from './data-monitor.module.css';

export function DataMonitor({ className }) {
  const { appState } = useAppContext();
  return (
    <div className={classNames(styles.dataMonitorWrapper, className)}>
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
