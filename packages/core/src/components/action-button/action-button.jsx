import { useSignal } from '@preact/signals';
import { classNames, sleepMs } from '@blockcode/utils';

import { Tooltip } from '../tooltip/tooltip';
import styles from './action-button.module.css';
import { useCallback } from 'preact/hooks';

export function ActionButton({
  className,
  disabled,
  icon: mainIcon,
  tooltip: mainTooltip,
  tooltipPlacement,
  moreButtons,
  onClick,
}) {
  const isOpen = useSignal(false);

  const forceHide = useSignal(false);

  const wrapItemClick = useCallback(
    (item) => async (e) => {
      forceHide.value = true;
      isOpen.value = false;
      item.onClick(e);
      await sleepMs(1);
      forceHide.value = false;
    },
    [],
  );

  return (
    <div
      className={classNames(styles.actionButtonWrapper, className, {
        [styles.expanded]: isOpen.value,
        [styles.forceHidden]: forceHide.value,
      })}
      disabled={disabled}
      onPointerEnter={useCallback(() => (isOpen.value = true), [])}
      onPointerLeave={useCallback(() => (isOpen.value = false), [])}
      onClick={onClick}
    >
      <div className={styles.moreButtonsOuter}>
        <div
          className={styles.moreButtons}
          onClick={useCallback((e) => e.stopPropagation(), [])}
        >
          {moreButtons &&
            moreButtons.map((item, index) => (
              <Tooltip
                className={styles.tooltip}
                content={item.tooltip}
                key={index}
                placement={tooltipPlacement || 'left'}
                offset={[0, 12]}
              >
                <button
                  className={classNames(styles.button, styles.moreButton)}
                  disabled={disabled}
                  onClick={wrapItemClick(item)}
                >
                  <img
                    className={styles.moreIcon}
                    draggable={false}
                    src={item.icon}
                  />
                </button>
              </Tooltip>
            ))}
        </div>
      </div>
      <Tooltip
        className={styles.tooltip}
        content={mainTooltip}
        placement={tooltipPlacement || 'left'}
        offset={[0, 14]}
      >
        <button
          disabled={disabled}
          className={classNames(styles.button, styles.mainButton)}
        >
          <img
            className={styles.mainIcon}
            draggable={false}
            src={mainIcon}
          />
        </button>
      </Tooltip>
    </div>
  );
}
