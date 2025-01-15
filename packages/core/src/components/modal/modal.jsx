import { classNames } from '@blockcode/utils';
import { useAppContext } from '../../contexts/app-context';

import { Text } from '@eo-locale/preact';
import { Button } from '../button/button';
import styles from './modal.module.css';

import backIcon from './icons/icon-back.svg';
import closeIcon from './icons/icon-close.svg';
import helpIcon from './icons/icon-help.svg';

export function Modal({ title, fullScreen: isFullScreen, onClose, className, headerClassName, children }) {
  const { macosMenuBarStyled } = useAppContext();

  return (
    <div className={styles.modalOverlay}>
      <div
        className={classNames(styles.modalContent, className, {
          [styles.fullScreen]: isFullScreen,
        })}
      >
        <div
          className={classNames(styles.modalHeader, headerClassName, {
            [styles.electron]: isFullScreen && macosMenuBarStyled.value,
          })}
        >
          <div className={classNames(styles.headerItem, styles.headerItemTitle)}>{title}</div>
          <div
            className={classNames(styles.headerItem, styles.headerItemClose, { [styles.headerItemBack]: isFullScreen })}
          >
            {isFullScreen ? (
              <Button
                className={styles.backButton}
                onClick={onClose}
              >
                <img src={backIcon} />
                <Text
                  id="core.modal.back"
                  defaultMessage="Back"
                />
              </Button>
            ) : (
              <Button
                className={styles.closeButton}
                onClick={onClose}
              >
                <img src={closeIcon} />
              </Button>
            )}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
