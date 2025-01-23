import { useCallback, useEffect } from 'preact/hooks';
import { batch, useSignal } from '@preact/signals';
import { Text, Library } from '@blockcode/core';

import getExtensions from '../../lib/get-extensions';

export function ExtensionsLibrary({ onSelect, onClose, onFilter }) {
  const data = useSignal([]);

  const filter = useCallback(
    (info) => {
      if (info.hidden) {
        return false;
      }

      // Electron 桌面版本不显示禁用或beta
      if (window.electron && (info.beta || info.disabled)) {
        return false;
      }

      // 没有标签的不过滤
      const tags = info.tags;
      if (!tags) {
        return true;
      }

      let result = true; // 不过滤
      if (onFilter) {
        result = onFilter(tags);
      }
      if (Array.isArray(result)) {
        // [some-tag, [every-tag, every-tag], some-tag]
        return result.some((subfilter) => {
          if (Array.isArray(subfilter)) {
            return subfilter.every((item) => (item[0] === '!' ? !tags.includes(item.slice(1)) : tags.includes(item)));
          }
          return tags.includes(subfilter);
        });
      }
      return result;
    },
    [onFilter],
  );

  useEffect(async () => {
    let result = await getExtensions();
    result = result.filter(filter);
    result = result.map((info) =>
      Object.assign(info, {
        disabled: info.disabled || (!DEBUG && info.preview),
        onSelect: () => {
          onSelect(info.id);
          onClose();
        },
      }),
    );
    data.value = result;
  }, []);

  return (
    <Library
      featured
      filterable
      items={data.value}
      filterPlaceholder={
        <Text
          id="gui.library.search"
          defaultMessage="Search"
        />
      }
      title={
        <Text
          id="blocks.extensions.addExtension"
          defaultMessage="Add Extension"
        />
      }
      emptyMessage={
        <Text
          id="blocks.extensions.empty"
          defaultMessage="No extension!"
        />
      }
      onClose={onClose}
    />
  );
}
