import { useRef, useCallback } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { classNames } from '@blockcode/utils';
import { Text } from '@blockcode/core';
import styles from './box.module.css';

import shrinkIcon from './icons/icon-shrink.svg';
import expandIcon from './icons/icon-expand.svg';
import closeIcon from './icons/icon-close.svg';

export function Box({ header, resizeable, buttons, children, onClose }) {
  const boxRef = useRef();

  const expanded = useSignal(true);

  const handleResize = useCallback((e) => {
    const box = boxRef.current;
    if (!box) return;

    const direction = e.target.dataset.resize;
    if (!direction) return;

    const boxRect = box.getBoundingClientRect();
    let posX = e.clientX;
    let posY = e.clientY;

    const resize = (e) => {
      let x = e.clientX - posX;
      let y = e.clientY - posY;
      switch (direction) {
        case 'left-top':
          if (boxRect.width - x < 468) {
            x = boxRect.width - 468;
          }
          if (boxRect.height - y < 348) {
            y = boxRect.height - 348;
          }
          box.style.left = `${boxRect.left + x}px`;
          box.style.width = `${boxRect.width - x}px`;
          box.style.top = `${boxRect.top + y}px`;
          box.style.height = `${boxRect.height - y}px`;
          return;
        case 'top':
          if (boxRect.height - y < 348) {
            y = boxRect.height - 348;
          }
          box.style.top = `${boxRect.top + y}px`;
          box.style.height = `${boxRect.height - y}px`;
          return;
        case 'right-top':
          if (boxRect.height - y < 348) {
            y = boxRect.height - 348;
          }
          if (boxRect.width + x < 468) {
            x = 468 - boxRect.width;
          }
          box.style.top = `${boxRect.top + y}px`;
          box.style.height = `${boxRect.height - y}px`;
          box.style.width = `${boxRect.width + x}px`;
          return;
        case 'left':
          if (boxRect.width - x < 468) {
            x = boxRect.width - 468;
          }
          box.style.left = `${boxRect.left + x}px`;
          box.style.width = `${boxRect.width - x}px`;
          return;
        case 'right':
          if (boxRect.width + x < 468) {
            x = 468 - boxRect.width;
          }
          box.style.width = `${boxRect.width + x}px`;
          return;
        case 'left-bottom':
          if (boxRect.width - x < 468) {
            x = boxRect.width - 468;
          }
          if (boxRect.height + y < 348) {
            y = 348 - boxRect.height;
          }
          box.style.left = `${boxRect.left + x}px`;
          box.style.width = `${boxRect.width - x}px`;
          box.style.height = `${boxRect.height + y}px`;
          return;
        case 'bottom':
          if (boxRect.height + y < 348) {
            y = 348 - boxRect.height;
          }
          box.style.height = `${boxRect.height + y}px`;
          return;
        case 'right-bottom':
          if (boxRect.width + x < 468) {
            x = 468 - boxRect.width;
          }
          if (boxRect.height + y < 348) {
            y = 348 - boxRect.height;
          }
          box.style.width = `${boxRect.width + x}px`;
          box.style.height = `${boxRect.height + y}px`;
          return;
      }
    };

    const endResize = () => {
      document.removeEventListener('pointerup', endResize);
      document.removeEventListener('pointermove', resize);
    };

    resize(e);
    document.addEventListener('pointerup', endResize);
    document.addEventListener('pointermove', resize);
  }, []);

  const handleMove = useCallback((e) => {
    const box = boxRef.current;
    if (!box) return;

    let posX = e.clientX;
    let posY = e.clientY;

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

    drag(e);
    document.addEventListener('pointerup', endDrag);
    document.addEventListener('pointermove', drag);
  }, []);

  return (
    <div
      ref={boxRef}
      className={styles.boxWrapper}
    >
      <div className={styles.boxWrapperRow}>
        <div
          data-resize="left-top"
          style="width:4px;height:4px;cursor:nwse-resize;"
          className={classNames(styles.resize, { [styles.disabled]: !resizeable })}
          onPointerDown={handleResize}
        ></div>
        <div
          data-resize="top"
          style="flex:1;height:4px;cursor:ns-resize;"
          className={classNames(styles.resize, { [styles.disabled]: !resizeable })}
          onPointerDown={handleResize}
        ></div>
        <div
          data-resize="right-top"
          style="width:4px;height:4px;cursor:nesw-resize;"
          className={classNames(styles.resize, { [styles.disabled]: !resizeable })}
          onPointerDown={handleResize}
        ></div>
      </div>

      <div className={styles.boxWrapperCenter}>
        <div
          data-resize="left"
          style="width:4px;cursor:ew-resize;"
          className={classNames(styles.resize, { [styles.disabled]: !resizeable })}
          onPointerDown={handleResize}
        ></div>

        <div className={styles.box}>
          <div
            className={styles.boxHeader}
            onPointerDown={handleMove}
          >
            <div className={styles.headerContent}>{header}</div>

            <div className={styles.headerButtonGroup}>
              {buttons &&
                buttons.map((button) => (
                  <div
                    className={styles.headerButton}
                    onClick={button.onClick}
                  >
                    <img
                      className={styles.buttonIcon}
                      src={button.icon}
                    />
                    {button.label}
                  </div>
                ))}
              {!resizeable && (
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
              )}
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

        <div
          data-resize="right"
          style="width:4px;cursor:ew-resize;"
          className={classNames(styles.resize, { [styles.disabled]: !resizeable })}
          onPointerDown={handleResize}
        ></div>
      </div>

      <div className={styles.boxWrapperRow}>
        <div
          data-resize="left-bottom"
          style="width:4px;height:4px;cursor:nesw-resize;"
          className={classNames(styles.resize, { [styles.disabled]: !resizeable })}
          onPointerDown={handleResize}
        ></div>
        <div
          data-resize="bottom"
          style="flex:1;height:4px;cursor:ns-resize;"
          className={classNames(styles.resize, { [styles.disabled]: !resizeable })}
          onPointerDown={handleResize}
        ></div>
        <div
          data-resize="right-bottom"
          style="width:4px;height:4px;cursor:nwse-resize;"
          className={classNames(styles.resize, { [styles.disabled]: !resizeable })}
          onPointerDown={handleResize}
        ></div>
      </div>
    </div>
  );
}
