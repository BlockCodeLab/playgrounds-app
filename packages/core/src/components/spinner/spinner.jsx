import { classNames } from '@blockcode/utils';
import styles from './spinner.module.css';

export function Spinner({ className, level, small, large }) {
  return (
    <div
      className={classNames(className, styles.spinner, styles[level || 'info'], {
        [styles.small]: small,
        [styles.large]: large,
      })}
    />
  );
}
