import { Alert } from './alert';
import styles from './alerts.module.css';

export function Alerts({ items }) {
  return (
    <div className={styles.alertsWrapper}>
      {items.map((item) => (
        <Alert
          mode={item.mode ?? 'success'}
          icon={item.icon}
          message={item.message}
          button={item.button}
          onClose={item.onClose}
        />
      ))}
    </div>
  );
}
