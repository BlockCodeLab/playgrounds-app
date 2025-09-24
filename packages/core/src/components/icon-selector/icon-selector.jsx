import { useId } from 'preact/hooks';
import { classNames } from '@blockcode/utils';

import { IconSelectorItem } from './icon-selector-item';
import styles from './icon-selector.module.css';

const wrapOnEvent = (i, item, handler) => (e) => {
  // e.stopPropagation();
  if (handler) {
    handler(i, item);
  }
};

export function IconSelector({
  className,
  id,
  displayOrder,
  items,
  selectedIndex,
  selectedId,
  onDelete,
  onSelect,
  onMouseDown,
  onMouseUp,
}) {
  const selectorId = useId();

  return (
    <div className={classNames(styles.iconSelectorWrapper, className)}>
      <div className={styles.itemsWrapper}>
        {items?.map((item, i) =>
          item.__hidden__ ? null : (
            <IconSelectorItem
              checked={i === selectedIndex || item.id === selectedId}
              displayOrder={displayOrder}
              className={classNames(styles.iconItem, item.className)}
              contextMenu={item.contextMenu}
              details={item.details}
              icon={item.icon}
              id={id ?? selectorId}
              key={item.title}
              name={i}
              order={item.order}
              title={item.name}
              onSelect={onSelect && wrapOnEvent(i, item, onSelect)}
              onMouseDown={onMouseDown && wrapOnEvent(i, item, onMouseDown)}
              onMouseUp={onMouseUp && wrapOnEvent(i, item, onMouseUp)}
              onDelete={onDelete && wrapOnEvent(i, item, onDelete)}
            />
          ),
        )}
      </div>
    </div>
  );
}
