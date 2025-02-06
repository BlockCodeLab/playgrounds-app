import { classNames } from '@blockcode/utils';
import { Button } from '@blockcode/core';
import styles from './alerts.module.css';

export function Alert({ mode, icon, message, button }) {
  return (
    <div
      className={classNames(styles.alertWrapper, {
        [styles.success]: mode === 'success',
        [styles.warn]: mode === 'warn',
      })}
    >
      <div className={styles.icon}>{icon}</div>
      <div className={styles.message}>{message}</div>
      {button && (
        <Button
          className={styles.button}
          onClick={button.onClick}
        >
          {button.label}
        </Button>
      )}
    </div>
  );
}
