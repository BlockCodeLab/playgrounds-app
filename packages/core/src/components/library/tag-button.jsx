import { classNames } from '@blockcode/utils';
import { Button } from '../button/button.jsx';
import styles from './tag-button.module.css';

export function TagButton({ active, className, onClick, children }) {
  return (
    <Button
      className={classNames(className, styles.tagButton, {
        [styles.active]: active,
      })}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
