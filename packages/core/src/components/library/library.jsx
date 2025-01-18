import { useEffect, useCallback } from 'preact/hooks';
import { batch, useSignal } from '@preact/signals';
import { useTranslator } from '@eo-locale/preact';
import { classNames } from '@blockcode/utils';
import { maybeTranslate } from '../../contexts/locales-context';

import { Text } from '@eo-locale/preact';
import { ContextMenu } from '../context-menu/context-menu';
import { Modal } from '../modal/modal';
import { Filter } from './filter';
import { LibraryItem } from './library-item';
import { TagButton } from './tag-button';
import styles from './library.module.css';

export function Library({ items, title, filterable, filterPlaceholder, emptyMessage, tags, large, featured, onClose }) {
  const translator = useTranslator();

  const tag = useSignal('all');

  const query = useSignal('');

  const filteredItems = useSignal([]);

  useEffect(() => {
    if (!items) return;

    filteredItems.value = items.filter((item) => {
      if (item.hidden) {
        return false;
      }

      // 隐藏彩蛋，只有搜索全称才显示
      const queryStr = query.value.toLowerCase();
      const nameStr = maybeTranslate(item.name, translator).toLowerCase();
      if (item.eegg) {
        return item.eegg === queryStr || nameStr === queryStr;
      }

      if (!item.tags) {
        return true;
      }

      if (tag.value !== 'all') {
        return item.tags.includes(tag.value);
      }

      // 无搜索关键词
      if (query.length === 0) {
        return true;
      }

      if (item.id && item.id.toLowerCase().includes(queryStr)) {
        return true;
      }
      if (nameStr.includes(queryStr)) {
        return true;
      }
      if (item.author) {
        const authorStr = maybeTranslate(item.author, translator).toLowerCase();
        if (authorStr.includes(queryStr)) {
          return true;
        }
      }
      if (item.copyright) {
        const copyrightStr = maybeTranslate(item.copyright, translator).toLowerCase();
        if (copyrightStr.includes(queryStr)) {
          return true;
        }
      }
      if (item.collaborator) {
        const collaboratorStr = maybeTranslate(item.collaborator, translator).toLowerCase();
        if (collaboratorStr.includes(queryStr)) {
          return true;
        }
      }

      return false;
    });
  }, [items, tag.value, query.value]);

  const handleFilterChange = useCallback((e) => {
    batch(() => {
      tag.value = 'all';
      query.value = e.target.value;
    });
  }, []);

  const handleFilterClear = useCallback(() => {
    batch(() => {
      tag.value = 'all';
      query.value = '';
    });
  }, []);

  const wrapTagClick = useCallback(
    (val) => () => {
      batch(() => {
        tag.value = val;
        query.value = '';
      });
    },
    [],
  );

  return (
    <Modal
      fullScreen
      title={title}
      onClose={onClose}
    >
      {(filterable || tags) && (
        <div className={styles.filterBar}>
          {filterable && (
            <Filter
              className={classNames(styles.filterBarItem, styles.filter)}
              inputClassName={styles.filterInput}
              query={query.value}
              placeholder={filterPlaceholder}
              onChange={handleFilterChange}
              onClear={handleFilterClear}
            />
          )}
          {filterable && tags && <div className={styles.divider} />}
          {tags && (
            <div className={styles.tagWrapper}>
              <TagButton
                active={tag === 'all'}
                className={classNames(styles.filterBarItem, styles.tagButton)}
                onClick={wrapTagClick('all')}
              >
                <Text
                  id="core.library.all"
                  defaultMessage="All"
                />
              </TagButton>
              {tags.map((tagItem, index) => (
                <TagButton
                  key={index}
                  active={tag === tagItem.tag.toLowerCase()}
                  className={classNames(styles.filterBarItem, styles.tagButton)}
                  onClick={wrapTagClick(tagItem.tag.toLowerCase())}
                >
                  {tagItem.label}
                </TagButton>
              ))}
            </div>
          )}
        </div>
      )}
      <div
        className={classNames(styles.libraryScrollGrid, {
          [styles.withFilterBar]: filterable || tags,
        })}
      >
        {filteredItems.value?.length ? (
          filteredItems.value.map((item, index) => (
            <ContextMenu
              menuItems={item.contextMenu}
              key={item.id ?? index}
            >
              <LibraryItem
                id={item.id ?? index}
                large={large}
                featured={featured}
                disabled={item.disabled}
                beta={item.beta}
                icon={item.icon}
                image={item.image}
                name={item.name}
                title={item.title}
                description={item.description}
                author={item.author}
                copyright={item.copyright}
                bluetoothRequired={item.bluetoothRequired}
                internetRequired={item.internetRequired}
                collaborator={item.collaborator}
                onMouseEnter={item.onMouseEnter}
                onMouseLeave={item.onMouseLeave}
                onSelect={item.onSelect}
              />
            </ContextMenu>
          ))
        ) : (
          <div className={styles.spinnerWrapper}>{emptyMessage ?? ''}</div>
        )}
      </div>
    </Modal>
  );
}
