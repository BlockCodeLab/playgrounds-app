import { classNames } from '@blockcode/utils';
import styles from './tabs.module.css';

export function TabPanel({ id, className, name, children }) {
  return (
    <div
      className={classNames(styles.tabPanel, className)}
      id={`${id}-panel-${name}`}
    >
      {children}
    </div>
  );
}
