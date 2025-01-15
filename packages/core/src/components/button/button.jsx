import { classNames } from '@blockcode/utils';
import styles from './button.module.css';

export function Button({ className, vertical, disabled, title, onClick, onMouseDown, onMouseUp, children }) {
  return (
    <button
      className={classNames(styles.outlined, className, {
        [styles.disabled]: disabled,
      })}
      title={title}
      disabled={disabled}
      onClick={onClick}
      onPointerUp={onMouseUp}
      onPointerDown={onMouseDown}
    >
      <div
        className={classNames(styles.content, {
          [styles.verticalContent]: vertical,
        })}
      >
        {children}
      </div>
    </button>
  );
}
