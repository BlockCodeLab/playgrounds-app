import { cloneElement } from 'preact';
import { useMemo } from 'preact/hooks';
import { flatChildren } from '@blockcode/utils';
import { injectStyle } from '../../lib/inject-style';

import { Menu } from '@blockcode/core';
import { MenuLabel } from './menu-label';

export function MainMenu({ id, children }) {
  const menus = useMemo(
    () => flatChildren(children).map((child) => child && cloneElement(child, { id })),
    [id, children],
  );

  return (
    <>
      {menus.filter((child) => child.type === MenuLabel)}
      {menus
        .filter((child) => child.type === Menu)
        .map((child) => {
          const labelId = `${id}-label-${child.props.name}`;
          const menuId = `${id}-menu-${child.props.name}`;
          injectStyle({
            [`#${labelId}:checked~#${menuId}`]: {
              display: 'block',
            },
          });
          return child;
        })}
    </>
  );
}
