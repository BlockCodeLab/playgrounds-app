import { useEffect, useRef, useId } from 'preact/hooks';
import { createPopper } from '@popperjs/core/lib/popper-lite';
import { classNames } from '@blockcode/utils';

import { Menu, MenuItem, MenuSection } from '../menu/menu';
import styles from './context-menu.module.css';

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

const generateGetBoundingClientRect =
  (x = 0, y = 0) =>
  () => ({
    width: 0,
    height: 0,
    top: y,
    right: x,
    bottom: y,
    left: x,
  });

export function ContextMenu({ menuItems, className, children }) {
  const ref = useRef(null);

  const contextId = useId();

  useEffect(() => {
    if (ref.current) {
      const contextForElement = ref.current.previousElementSibling;

      const virtualElement = {
        getBoundingClientRect: generateGetBoundingClientRect(),
      };

      const popper = createPopper(virtualElement, ref.current, {
        placement: 'bottom-end',
      });

      const hide = (e) => {
        if (ref.current) {
          delete ref.current.dataset.show;
          popper.setOptions((options) => ({
            ...options,
            modifiers: [...options.modifiers, { name: 'eventListeners', enabled: false }],
          }));
        }
        document.removeEventListener('click', hide);
        document.removeEventListener('pointerdown', hide);
      };

      const show = (e) => {
        e.preventDefault();

        virtualElement.getBoundingClientRect = generateGetBoundingClientRect(e.clientX, e.clientY);

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
      contextForElement.addEventListener('contextmenu', show);
    }
    return () => {};
  }, [ref]);

  return (
    <>
      {children}
      <div
        ref={ref}
        id={contextId}
        className={styles.contextMenuWrapper}
        role="context"
      >
        {menuItems && (
          <Menu
            name={contextId}
            className={classNames(styles.contextMenu, className)}
          >
            {mapMenuItems(menuItems)}
          </Menu>
        )}
      </div>
    </>
  );
}
