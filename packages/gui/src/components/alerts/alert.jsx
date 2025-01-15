import { classNames } from '@blockcode/utils';
import { Button } from '@blockcode/core';
import styles from './alerts.module.css';

export function Alert({ mode, icon, message, button }) {
  return (
    <div className={classNames(styles.alertWrapper, styles[mode])}>
      <div className={styles.icon}>{icon}</div>
      <div className={styles.message}>{message}</div>
      {button && (
        <Button
          className={classNames(styles.button, {
            [styles.error]: button.mode === 'error',
          })}
          onClick={button.onClick}
        >
          {button.label}
        </Button>
      )}
    </div>
  );
}
