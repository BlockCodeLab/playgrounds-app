import { useCallback } from 'preact/hooks';
import { classNames } from '@blockcode/utils';
import { maybeTranslate } from '../../contexts/locales-context';
import { Button } from '../button/button';
import styles from './toggle-buttons.module.css';

export function ToggleButtons({ disabled, items, value, onChange }) {
  const lastIndex = items.length - 1;

  return (
    <>
      {items.map((item, index) => (
        <Button
          key={index}
          disabled={item.disabled || disabled}
          className={classNames(styles.toggleButton, {
            [styles.autoWidth]: item.title && !item.icon,
            [styles.toggleButtonFirst]: index === 0,
            [styles.toggleButtonMiddle]: index > 0 && index < lastIndex,
            [styles.toggleButtonLast]: index === lastIndex,
            [styles.toggleButtonActived]: !disabled && value === item.value,
          })}
          onClick={useCallback(() => onChange?.(item.value), [onChange])}
        >
          {item.icon ? (
            <img
              src={item.icon}
              className={styles.buttonIcon}
              title={maybeTranslate(item.title)}
            />
          ) : (
            <div className={styles.buttonText}>{maybeTranslate(item.title)}</div>
          )}
        </Button>
      ))}
    </>
  );
}
