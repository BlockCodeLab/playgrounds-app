import { useEffect, useMemo } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { useProjectContext, Dropdown } from '@blockcode/core';
import styles from './code-review.module.css';

export function CodeReview() {
  const { file, modified } = useProjectContext();

  const type = useSignal('content');

  const typeItems = useMemo(
    () =>
      ['content', 'script'].map((label) => ({
        label: label === 'content' ? 'Device' : 'Emulator',
        onClick: () => (type.value = label),
      })),
    [],
  );

  useEffect(() => {
    if (!file.value.content && type.value === 'content') {
      type.value = 'script';
    }
    if (!file.value.script && type.value === 'script') {
      type.value = 'content';
    }
  }, [file.value]);

  const lines = useMemo(() => file.value?.[type]?.split?.('\n'), [type.value, file.value, modified.value]);

  return (
    <div className={styles.codeReview}>
      <pre>
        {lines?.map?.((line) => (
          <span>{line}</span>
        ))}
      </pre>
      <div className={styles.changer}>
        <Dropdown items={typeItems}>{type.value === 'content' ? 'Device' : 'Emulator'}</Dropdown>
      </div>
    </div>
  );
}
