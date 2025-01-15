import { classNames } from '@blockcode/utils';
import styles from './tabs.module.css';

export function TabLabel({ id, className, checked, children, name, onSelect }) {
  return (
    <>
      <input
        checked={checked}
        className={styles.tab}
        id={`${id}-tab-${name}`}
        name={`${id}-tab`}
        type="radio"
        value={name}
      />
      <label
        className={classNames(styles.tabLabel, className)}
        for={`${id}-tab-${name}`}
        onClick={onSelect}
      >
        {children}
      </label>
    </>
  );
}
