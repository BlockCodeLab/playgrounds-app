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

export function Dropdown({ className, iconClassName, menuClassName, items, placement, hoverable, children }) {
  const ref = useRef(null);

  const dropdownId = useId();

  const isOpen = useSignal(false);

  useEffect(() => {
    if (ref.current) {
      const contentForElement = ref.current.firstChild;
      const dropdownForElement = ref.current.previousElementSibling;
      dropdownForElement.setAttribute('aria-describedby', dropdownId);

      const popper = createPopper(dropdownForElement, ref.current, {
        placement: placement || 'bottom-start',
        modifiers: [
          offsetModifier,
          {
            name: 'offset',
            options: {
              offset({ placement }) {
                const contentRect = contentForElement?.getBoundingClientRect();
                const dropdownRect = dropdownForElement?.getBoundingClientRect();
                if (contentRect && dropdownRect) {
                  switch (placement) {
                    case 'top-end':
                      return [-contentRect.width, contentRect.height];
                    case 'right-start':
                      return [-dropdownRect.height - 16, -24];
                    case 'bottom-start':
                    default:
                      return [0, 0];
                  }
                }
                return [0, 0];
              },
            },
          },
        ],
      });

      const hide = (e) => {
        isOpen.value = false;

        delete ref.current.dataset.show;
        popper.setOptions((options) => ({
          ...options,
          modifiers: [...options.modifiers, { name: 'eventListeners', enabled: false }],
        }));
        document.removeEventListener('click', hide);
        document.removeEventListener('pointerdown', hide);
      };

      const show = (e) => {
        isOpen.value = true;

        ref.current.dataset.show = true;
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

      if (hoverable) {
        dropdownForElement.addEventListener('mouseenter', show);
        dropdownForElement.addEventListener('mouseleave', hide);
        contentForElement.addEventListener('mouseenter', show);
        contentForElement.addEventListener('mouseleave', hide);
      } else {
        dropdownForElement.addEventListener('pointerup', show);
      }

      return () => {
        if (hoverable) {
          dropdownForElement.removeEventListener('mouseenter', show);
          dropdownForElement.removeEventListener('mouseleave', hide);
          contentForElement.removeEventListener('mouseenter', show);
          contentForElement.removeEventListener('mouseleave', hide);
        } else {
          dropdownForElement.removeEventListener('pointerup', show);
        }
      };
    }
  }, []);

  return (
    <>
      <div
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
        ref={ref}
        id={dropdownId}
        className={styles.dropdownMenuWrapper}
        role="context"
      >
        {items && (
          <Menu
            name={dropdownId}
            className={classNames(menuClassName, styles.dropdownMenu)}
          >
            {mapMenuItems(items)}
          </Menu>
        )}
      </div>
    </>
  );
}
