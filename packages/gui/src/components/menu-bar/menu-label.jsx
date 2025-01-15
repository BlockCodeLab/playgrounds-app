import { useCallback } from 'preact/hooks';
import { classNames } from '@blockcode/utils';
import { injectStyle } from '../../lib/inject-style';
import styles from './menu-bar.module.css';

export function MenuLabel({ id, className, checked, children, name }) {
  const handleChange = useCallback((e) => {
    const handler = () => {
      e.target.checked = false;
      document.removeEventListener('click', handler);
    };
    document.addEventListener('click', handler);
  }, []);

  const setStyle = useCallback(
    (target) => {
      const left = target.getBoundingClientRect().left;
      injectStyle({
        [`#${id}-menu-${name}`]: {
          left: `${left}px`,
        },
      });
    },
    [id, name],
  );

  const handleClick = useCallback((e) => {
    if (e.target.classList.contains(styles.menuLabel)) {
      setStyle(e.target);
    } else {
      setStyle(e.target.parentElement);
    }
  }, []);

  return (
    <>
      <input
        checked={checked}
        className={styles.menuLabel}
        id={`${id}-label-${name}`}
        name={`${id}-menu`}
        type="radio"
        value={name}
        onChange={handleChange}
      />
      <label
        className={classNames(styles.menuLabel, className)}
        for={`${id}-label-${name}`}
        onClick={handleClick}
      >
        {children}
      </label>
    </>
  );
}
