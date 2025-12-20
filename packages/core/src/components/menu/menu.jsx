import { cloneElement } from 'preact';
import { useId, useCallback } from 'preact/hooks';
import { classNames, isDesktop, flatChildren } from '@blockcode/utils';
import { Dropdown } from '../dropdown/dropdown';
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

export function MenuItem({ className, menuClassName, style, disabled, label, items, href, hotkey, onClick, children }) {
  const handleClick = useCallback(
    (e = {}) => {
      if (disabled || items) return;
      if (onClick) {
        onClick(e);
        return;
      }
      if (href) {
        window.open(href, '_blank');
      }
    },
    [disabled, href, onClick],
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
      {items ? (
        <Dropdown
          hoverable
          placement="right-start"
          items={items}
          className={styles.dropdownItem}
          iconClassName={styles.dropdownIcon}
          menuClassName={menuClassName}
          itemClassName={className}
        >
          <div className={styles.content}>{label || children}</div>
        </Dropdown>
      ) : (
        <>
          <div className={styles.content}>{label || children}</div>
          {isDesktop && hotkey && <div className={styles.hotkey}>{showHotkey(hotkey)}</div>}
        </>
      )}
    </li>
  );
}

export function MenuSection({ disabled, title, titleClassName, children }) {
  return (
    <>
      {title && (
        <li className={classNames(styles.menuSection, styles.menuSectionTitle, titleClassName)}>
          <div className={styles.content}>{title}</div>
        </li>
      )}
      {flatChildren(children).map(
        (child, index) =>
          child &&
          cloneElement(child, {
            className: classNames(child.props.className, { [styles.menuSection]: !title && index === 0 }),
            disabled: child.props.disabled || disabled,
            key: index,
          }),
      )}
    </>
  );
}
