import { useCallback } from 'preact/hooks';
import { maybeTranslate, LibraryItem, Tooltip } from '@blockcode/core';
import { blocks } from './blocks';
import styles from './toolbox.module.css';

export function Toolbox() {
  const wrapHandleSelect = useCallback(
    (block) => () => {
      if (!window.currentVditor) return;
      const vditor = window.currentVditor;
      if (!block.inline) {
        vditor.insertEmptyBlock('afterend');
      }
      vditor.insertValue(block.content);
      vditor.focus();
    },
    [],
  );

  return blocks.map((block) => (
    <Tooltip
      placement="left"
      content={block.title}
    >
      <LibraryItem
        className={styles.tool}
        image={block.image}
        onSelect={wrapHandleSelect(block)}
      />
    </Tooltip>
  ));
}
