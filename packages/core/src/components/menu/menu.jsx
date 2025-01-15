import { cloneElement } from 'preact';
import { useId, useCallback } from 'preact/hooks';
import { classNames, isDesktop, flatChildren } from '@blockcode/utils';
import { setHotkey, showHotkey } from '../../lib/io/hotkey';
import styles from './menu.module.css';

export function Menu({ id, className, children, name }) {
  return (
    <ul
      className={classNames(styles.menu, className)}
      id={`${id || useId()}-menu-${name}`}
    >
      {children}
    </ul>
  );
}

export function MenuItem({ className, style, disabled, label, href, hotkey, onClick, children }) {
  const handleClick = useCallback(
    (e = {}) => {
      if (disabled) return;
      if (onClick) {
        onClick(e);
        return;
      }
      if (href) {
        window.open(href, '_blank');
      }
    },
    [disabled, href],
  );

  if (isDesktop && hotkey) {
    setHotkey(hotkey, handleClick);
  }

  return (
    <li
      className={classNames(
        styles.menuItem,
        {
          [styles.hoverable]: !disabled,
          [styles.disabled]: disabled,
        },
        className,
      )}
      style={style}
      onClick={handleClick}
      onPointerDown={useCallback((e) => e.stopPropagation(), [])}
    >
      <div className={styles.content}>{label || children}</div>
      {isDesktop && hotkey && <div className={styles.hotkey}>{showHotkey(hotkey)}</div>}
    </li>
  );
}

export function MenuSection({ children }) {
  return (
    <>
      {flatChildren(children).map(
        (child, index) =>
          child &&
          cloneElement(child, {
            className: classNames(child.props.className, { [styles.menuSection]: index === 0 }),
            key: index,
          }),
      )}
    </>
  );
}
