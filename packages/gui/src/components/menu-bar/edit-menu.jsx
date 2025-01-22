import { useEffect } from 'preact/hooks';
import { batch, useSignal } from '@preact/signals';
import { isMac } from '@blockcode/utils';
import { useProjectContext, Keys } from '@blockcode/core';

import { Text, MenuSection, MenuItem } from '@blockcode/core';
import styles from './menu-bar.module.css';

export function EditMenu({ onUndo, onRedo, onEnableUndo, onEnableRedo, ExtendedMenu }) {
  const { key, fileId, modified } = useProjectContext();

  const disabledUndo = useSignal(true);

  const disabledRedo = useSignal(true);

  useEffect(() => {
    batch(() => {
      disabledUndo.value = !onEnableUndo();
      disabledRedo.value = !onEnableRedo();
    });
  }, [key.value, fileId.value, modified.value]);

  return (
    <>
      <MenuSection>
        <MenuItem
          disabled={disabledUndo.value}
          className={styles.menuItem}
          label={
            <Text
              id="gui.menubar.edit.undo"
              defaultMessage="Undo"
            />
          }
          hotkey={[isMac ? Keys.COMMAND : Keys.CONTROL, Keys.Z]}
          onClick={onUndo}
        />

        <MenuItem
          disabled={disabledRedo.value}
          className={styles.menuItem}
          label={
            <Text
              id="gui.menubar.edit.redo"
              defaultMessage="Redo"
            />
          }
          hotkey={isMac ? [Keys.SHIFT, Keys.COMMAND, Keys.Z] : [Keys.CONTROL, Keys.Y]}
          onClick={onRedo}
        />
      </MenuSection>

      {ExtendedMenu && <ExtendedMenu itemClassName={styles.menuItem} />}
    </>
  );
}
