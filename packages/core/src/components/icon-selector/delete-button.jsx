import { classNames } from '@blockcode/utils';
import styles from './delete-button.module.css';

import deleteIcon from './icon-delete.svg';

export function DeleteButton({ className, onClick }) {
  return (
    <button
      className={classNames(styles.deleteButton, className)}
      onClick={onClick}
    >
      <img
        className={styles.deleteIcon}
        src={deleteIcon}
      />
    </button>
  );
}
