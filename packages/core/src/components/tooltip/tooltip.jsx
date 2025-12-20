import { useEffect, useId, useRef } from 'preact/hooks';
import { classNames } from '@blockcode/utils';
import { createPopper } from '@popperjs/core/lib/popper-lite';
import offsetModifier from '@popperjs/core/lib/modifiers/offset';
import arrowModifier from '@popperjs/core/lib/modifiers/arrow';
import styles from './tooltip.module.css';

export function Tooltip({ content, className, placement, offset, clickable, children, onShow, onHide }) {
  const ref = useRef(null);

  const tooltipId = useId();

  useEffect(() => {
    if (ref.current) {
      const tooltipForElement = ref.current.previousElementSibling;
      tooltipForElement.setAttribute('aria-describedby', tooltipId);

      const popper = createPopper(tooltipForElement, ref.current, {
        placement: placement || 'auto',
        modifiers: [
          arrowModifier,
          offsetModifier,
          {
            name: 'offset',
            options: {
              offset: offset || [0, 8],
            },
          },
        ],
      });
      ref.popper = popper;

      const hide = () => {
        delete ref.current.dataset.show;
        popper.setOptions((options) => ({
          ...options,
          modifiers: [...options.modifiers, { name: 'eventListeners', enabled: false }],
        }));
        if (onHide) onHide();
      };

      const show = () => {
        ref.current.dataset.show = true;
        popper.setOptions((options) => ({
          ...options,
          modifiers: [...options.modifiers, { name: 'eventListeners', enabled: true }],
        }));
        popper.update();
        if (onShow) onShow();

        const clickHide = () => {
          hide();
          document.removeEventListener('pointerdown', clickHide);
        };
        document.addEventListener('pointerdown', clickHide);
      };

      const stopPropagation = (e) => e.stopPropagation();

      if (clickable) {
        tooltipForElement.addEventListener('pointerup', show);
        ref.current.addEventListener('pointerdown', stopPropagation);
      } else {
        tooltipForElement.addEventListener('mouseenter', show);
        tooltipForElement.addEventListener('mouseleave', hide);
      }

      return () => {
        if (clickable) {
          tooltipForElement.removeEventListener('pointerup', show);
          ref.current.removeEventListener('pointerdown', stopPropagation);
        } else {
          tooltipForElement.removeEventListener('mouseenter', show);
          tooltipForElement.removeEventListener('mouseleave', hide);
        }
      };
    }
  }, []);

  return (
    <>
      {children}
      <div
        ref={ref}
        id={tooltipId}
        className={classNames(styles.tooltip, className)}
        role="tooltip"
      >
        {content}
        <div
          className={styles.arrow}
          data-popper-arrow
        />
      </div>
    </>
  );
}
