import { classNames } from '@blockcode/utils';
import { Button } from '@blockcode/core';
import styles from './alerts.module.css';

import closeIcon from './icon-close.svg';

export function Alert({ mode, icon, message, button, onClose }) {
  return (
    <div
      className={classNames(styles.alertWrapper, {
        [styles.success]: mode === 'success',
        [styles.warn]: mode === 'warn',
      })}
    >
      <div className={styles.icon}>{typeof icon === 'string' ? <img src={icon} /> : icon}</div>
      <div className={styles.message}>{message}</div>
      {button && (
        <Button
          className={styles.button}
          onClick={button.onClick}
        >
          {button.label}
        </Button>
      )}
      {onClose && (
        <Button
          className={styles.closeButton}
          onClick={onClose}
        >
          <img src={closeIcon} />
        </Button>
      )}
    </div>
  );
}
