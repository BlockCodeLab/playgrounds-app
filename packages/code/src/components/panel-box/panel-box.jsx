import { useRef, useCallback } from 'preact/hooks';
import { useComputed } from '@preact/signals';
import { keyMirror, classNames } from '@blockcode/utils';
import { useAppContext, setAppState, setAlert, logger, Button, Text } from '@blockcode/core';
import { LogsPanel } from './logs-panel';
import { SerialPanel } from './serial-panel';
import styles from './panel-box.module.css';

import logsIcon from './icons/icon-logs.svg';
import serialIcon from './icons/icon-serial.svg';
import filesIcon from './icons/icon-files.svg';
import copyIcon from './icons/icon-copy.svg';
import cleanIcon from './icons/icon-clean.svg';
import closeIcon from './icons/icon-close.svg';

export const PanelBoxes = keyMirror({
  Logs: null,
  Serial: null,
  Files: null,
});

export function PanelBox({ compactMode }) {
  const boxRef = useRef();

  const { menuItems, appState } = useAppContext();

  const viewMenu = useComputed(() => menuItems.value?.find((item) => item.id === 'view'));

  const panelId = useComputed(() => appState.value?.panelBoxId);

  const handleCopy = useCallback(async () => {
    let logs = logger.logs.join('\r\n');
    try {
      logs = logs.replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, '');
      await navigator.clipboard.writeText(logs);
      setAlert(
        {
          type: 'success',
          message: (
            <Text
              id="code.alert.logsCopied"
              defaultMessage="Logs copied to clipboard"
            />
          ),
        },
        2000,
      );
    } catch (err) {
      setAlert(
        {
          type: 'warn',
          message: (
            <Text
              id="code.alert.logsCopyFailed"
              defaultMessage="Failed to copy logs to clipboard"
            />
          ),
        },
        2000,
      );
    }
  }, []);

  return (
    <div
      ref={boxRef}
      className={styles.boxWrapper}
    >
      <div className={styles.boxHeader}>
        <div className={styles.headerContent}>
          <Button
            className={classNames(styles.button, {
              [styles.buttonActived]: panelId.value === PanelBoxes.Logs,
            })}
            onClick={useCallback(() => setAppState('panelBoxId', PanelBoxes.Logs), [])}
          >
            <img
              className={styles.icon}
              src={logsIcon}
            />
            {(!compactMode || panelId.value === PanelBoxes.Logs) && (
              <Text
                id="code.panelBox.logs"
                defaultMessage="Logs"
              />
            )}
          </Button>

          <Button
            className={classNames(styles.button, {
              [styles.buttonActived]: panelId.value === PanelBoxes.Serial,
            })}
            onClick={useCallback(() => setAppState('panelBoxId', PanelBoxes.Serial), [])}
          >
            <img
              className={styles.icon}
              src={serialIcon}
            />
            {(!compactMode || panelId.value === PanelBoxes.Serial) && (
              <Text
                id="code.panelBox.serial"
                defaultMessage="Serial"
              />
            )}
          </Button>

          {viewMenu.value?.options?.disabledFiles !== true && (
            <Button
              disabled
              className={classNames(styles.button, {
                [styles.buttonActived]: panelId.value === PanelBoxes.Files,
              })}
              onClick={useCallback(() => setAppState('panelBoxId', PanelBoxes.Files), [])}
            >
              <img
                className={styles.icon}
                src={filesIcon}
              />
              {(!compactMode || panelId.value === PanelBoxes.Files) && (
                <Text
                  id="code.panelBox.files"
                  defaultMessage="Files"
                />
              )}
            </Button>
          )}
        </div>

        <div className={styles.headerButtonGroup}>
          {panelId.value === PanelBoxes.Logs && (
            <div
              className={styles.headerButton}
              onClick={handleCopy}
            >
              <img
                className={styles.buttonIcon}
                src={copyIcon}
              />

              <Text
                id="code.panelBox.logsCopy"
                defaultMessage="Copy"
              />
            </div>
          )}
          {panelId.value === PanelBoxes.Serial && (
            <div
              className={styles.headerButton}
              onClick={useCallback(() => setAppState('terminalCache', null), [])}
            >
              <img
                className={styles.buttonIcon}
                src={cleanIcon}
              />
              <Text
                id="code.panelBox.serialClean"
                defaultMessage="Clean"
              />
            </div>
          )}
          <div
            className={styles.headerButton}
            onClick={useCallback(() => setAppState('panelBoxId', null), [])}
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

      <div className={styles.boxContent}>
        {panelId.value === PanelBoxes.Logs && <LogsPanel />}

        {panelId.value === PanelBoxes.Serial && <SerialPanel />}
      </div>
    </div>
  );
}
