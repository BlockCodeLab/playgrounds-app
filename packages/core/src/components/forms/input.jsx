import { classNames } from '@blockcode/utils';
import styles from './input.module.css';

export function Input(props) {
  const { small, ...componentProps } = props;
  return (
    <input
      {...componentProps}
      className={classNames(styles.inputForm, props.className, {
        [styles.inputSmall]: small,
      })}
    />
  );
}
