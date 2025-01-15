import { useEffect, useRef, useId } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { classNames } from '@blockcode/utils';
import { createPopper } from '@popperjs/core/lib/popper-lite';

import { Menu, MenuItem, MenuSection } from '../menu/menu';
import styles from './dropdown.module.css';

import dropdownIcon from './icon-dropdown-caret.svg';

const mapMenuItems = (menuItems) =>
  menuItems.map((item, index) =>
    Array.isArray(item) ? (
      <MenuSection key={index}>{mapMenuItems(item)}</MenuSection>
    ) : (
      <MenuItem
        key={index}
        disabled={item.disabled}
        className={item.className}
        style={item.style}
        onClick={item.onClick}
      >
        {item.label}
      </MenuItem>
    ),
  );

export function Dropdown({ className, items, children }) {
  const ref = useRef(null);

  const ctxRef = useRef(null);

  const dropdownId = useId();

  const isOpen = useSignal(false);

  useEffect(() => {
    if (ref.current && ctxRef.current) {
      const dropdownForElement = ctxRef.current.previousElementSibling;

      const popper = createPopper(ref.current, ctxRef.current, {
        placement: 'bottom-start',
      });

      const hide = (e) => {
        isOpen.value = false;

        if (ctxRef.current) {
          delete ctxRef.current.dataset.show;
          popper.setOptions((options) => ({
            ...options,
            modifiers: [...options.modifiers, { name: 'eventListeners', enabled: false }],
          }));
        }
        document.removeEventListener('click', hide);
        document.removeEventListener('pointerdown', hide);
      };

      const show = (e) => {
        isOpen.value = true;

        ctxRef.current.dataset.show = true;
        popper.setOptions((options) => ({
          ...options,
          modifiers: [...options.modifiers, { name: 'eventListeners', enabled: true }],
        }));
        popper.update();
        setTimeout(() => {
          document.addEventListener('click', hide);
          document.addEventListener('pointerdown', hide);
        });
      };
      dropdownForElement.addEventListener('pointerup', show);
    }
  }, [ref, ctxRef]);

  return (
    <>
      <div
        ref={ref}
        className={classNames(styles.dropdown, className, {
          [styles.open]: isOpen.value,
        })}
      >
        {children}
        <img
          className={classNames(styles.dropdownIcon, {
            [styles.aretUp]: isOpen.value,
          })}
          draggable={false}
          src={dropdownIcon}
        />
      </div>
      <div
        ref={ctxRef}
        id={dropdownId}
        className={styles.dropdownMenuWrapper}
        role="context"
      >
        {items && (
          <Menu
            name={dropdownId}
            className={classNames(styles.dropdownMenu, className)}
          >
            {mapMenuItems(items)}
          </Menu>
        )}
      </div>
    </>
  );
}
