import { classNames } from '@blockcode/utils';
import { translate, Text } from '@blockcode/core';
import styles from './data-monitor.module.css';

export function MonitorValue({ className, data }) {
  let value = data.value;

  // 数值
  if (typeof value === 'number') {
    value = Number.isInteger(value)
      ? parseInt(value)
      : Number(value)
          .toFixed(6)
          .replace(/0{1,3}$/, '');
  }

  // 布尔值
  if (typeof value === 'boolean') {
    value = translate(`blocks.monitor.${value}Value`, `${value}`);
  }

  return (
    <div
      className={classNames(styles.monitorValue, className)}
      style={{
        color: data.color,
      }}
    >
      <div>
        <div
          className={classNames(styles.value, {
            [styles.listLength]: Array.isArray(value),
          })}
        >
          {Array.isArray(value) ? (
            <Text
              id="blocks.monitor.listLength"
              defaultMessage="{length} items"
              length={value.length}
            />
          ) : (
            value
          )}
        </div>
        <div
          className={styles.info}
          style={{
            background: data.color,
          }}
        >
          {data.label && <span className={styles.label}>{data.label}</span>}
          <span className={styles.target}>{data.target}</span>
        </div>
      </div>
      {Array.isArray(value) && (
        <div className={styles.list}>
          {value.map((val) => (
            <span className={styles.value}>{val}</span>
          ))}
        </div>
      )}
    </div>
  );
}
