import { useEffect, useRef, useId } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { classNames } from '@blockcode/utils';
import { createPopper } from '@popperjs/core/lib/popper-lite';
import offsetModifier from '@popperjs/core/lib/modifiers/offset';

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
        hotkey={item.hotkey}
        onClick={item.onClick}
      >
        {item.label}
      </MenuItem>
    ),
  );

export function Dropdown({ className, iconClassName, items, placement, children }) {
  const ref = useRef(null);

  const ctxRef = useRef(null);

  const dropdownId = useId();

  const isOpen = useSignal(false);

  useEffect(() => {
    if (ref.current && ctxRef.current) {
      const popper = createPopper(ref.current, ctxRef.current, {
        placement: placement || 'bottom-start',
        modifiers: [
          offsetModifier,
          {
            name: 'offset',
            options: {
              offset({ placement }) {
                const rect = ctxRef.current?.firstChild?.getBoundingClientRect();
                switch (placement) {
                  case 'bottom-start':
                    return [0, 0];
                  case 'top-end':
                    return rect ? [-rect.width, rect.height] : [];
                  default:
                    return [];
                }
              },
            },
          },
        ],
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
      ctxRef.current.previousElementSibling.addEventListener('pointerup', show);
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
          className={classNames(styles.dropdownIcon, iconClassName, {
            [styles.caretUp]: isOpen.value,
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
            className={classNames(styles.dropdownMenu)}
          >
            {mapMenuItems(items)}
          </Menu>
        )}
      </div>
    </>
  );
}
