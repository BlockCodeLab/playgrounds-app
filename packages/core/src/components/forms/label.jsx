import { classNames } from '@blockcode/utils';
import styles from './label.module.css';

export function Label(props) {
  return (
    <label
      className={classNames(
        {
          [styles.inputGroupColumn]: props.above,
          [styles.inputGroup]: !props.above,
        },
        props.className,
      )}
    >
      <span
        className={classNames({
          [styles.inputLabelSecondary]: props.secondary,
          [styles.inputLabel]: !props.secondary,
        })}
      >
        {' '}
        {props.text}
      </span>
      {props.children}
    </label>
  );
}
