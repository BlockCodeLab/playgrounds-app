import { classNames } from '@blockcode/utils';
import styles from './data-monitor.module.css';

export function MonitorValue({ className, data }) {
  return (
    <div
      className={classNames(styles.monitorLine, className)}
      style={{
        color: data.color,
      }}
    >
      <div className={styles.value}>{data.value}</div>
      <div
        className={styles.label}
        style={{
          background: data.color,
        }}
      >
        {data.label}
      </div>
    </div>
  );
}
