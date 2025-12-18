import { useRef, useEffect, useCallback } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { Text } from '@blockcode/core';
import styles from './box.module.css';

import shrinkIcon from './icons/icon-shrink.svg';
import expandIcon from './icons/icon-expand.svg';
import closeIcon from './icons/icon-close.svg';

export function Box({ header, children, onClose }) {
  const ref = useRef();

  const expanded = useSignal(true);

  useEffect(() => {
    if (ref.current) {
      const box = ref.current.parentElement;
      let posX;
      let posY;

      const drag = (e) => {
        const x = posX - e.clientX;
        const y = posY - e.clientY;
        posX = e.clientX;
        posY = e.clientY;
        box.style.top = `${box.offsetTop - y}px`;
        box.style.left = `${box.offsetLeft - x}px`;
        box.style.right = 'unset';
        box.style.bottom = 'unset';
      };

      const endDrag = () => {
        document.removeEventListener('pointerup', endDrag);
        document.removeEventListener('pointermove', drag);
      };

      ref.current.addEventListener('pointerdown', (e) => {
        posX = e.clientX;
        posY = e.clientY;
        drag(e);
        document.addEventListener('pointerup', endDrag);
        document.addEventListener('pointermove', drag);
      });
    }
  }, [ref]);

  return (
    <div className={styles.boxWrapper}>
      <div
        ref={ref}
        className={styles.box}
      >
        <div className={styles.boxHeader}>
          <div className={styles.headerContent}>{header}</div>

          <div className={styles.headerButtonGroup}>
            <div
              className={styles.headerButton}
              onClick={useCallback(() => (expanded.value = !expanded.value), [])}
            >
              {expanded.value ? (
                <>
                  <img
                    className={styles.buttonIcon}
                    src={shrinkIcon}
                  />
                  <Text
                    id="core.box.shrink"
                    defaultMessage="Shrink"
                  />
                </>
              ) : (
                <>
                  <img
                    className={styles.buttonIcon}
                    src={expandIcon}
                  />
                  <Text
                    id="core.box.expand"
                    defaultMessage="Expand"
                  />
                </>
              )}
            </div>
            <div
              className={styles.headerButton}
              onClick={onClose}
            >
              <img
                className={styles.buttonIcon}
                src={closeIcon}
              />
              <Text
                id="core.box.close"
                defaultMessage="Close"
              />
            </div>
          </div>
        </div>

        {expanded.value && <div className={styles.boxContent}>{children}</div>}
      </div>
    </div>
  );
}
