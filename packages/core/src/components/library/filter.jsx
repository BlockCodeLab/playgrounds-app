import { classNames } from '@blockcode/utils';
import { maybeTranslate } from '../../contexts/locales-context';
import styles from './filter.module.css';

import filterIcon from './icons/icon-filter.svg';
import closeIcon from './icons/icon-close.svg';

export function Filter({ className, onChange, onClear, placeholder, query, inputClassName }) {
  return (
    <div
      className={classNames(className, styles.filter, {
        [styles.isActive]: query.length > 0,
      })}
    >
      <img
        className={styles.filterIcon}
        src={filterIcon}
      />
      <input
        type="text"
        className={classNames(styles.filterInput, inputClassName)}
        placeholder={maybeTranslate(placeholder)}
        data-value={query}
        value={query}
        onInput={onChange}
      />
      <div
        className={styles.closeIconWrapper}
        onClick={onClear}
      >
        <img
          className={styles.closeIcon}
          src={closeIcon}
        />
      </div>
    </div>
  );
}
