import { useCallback } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { classNames } from '@blockcode/utils';

import { Text, Button, Modal } from '@blockcode/core';
import styles from './connection-modal.module.css';

import searchingImage from './searching.png';

export function ConnectionModal({ title, icon, devices, onClose, onSearch, onConnect }) {
  const deviceId = useSignal('');

  const handleConnect = useCallback(() => {
    if (!deviceId.value) return;
    onConnect(deviceId.value);
    deviceId.value = '';
  }, [onConnect]);

  return (
    <Modal
      title={
        title ?? (
          <Text
            id="gui.connection.device"
            defaultMessage="Device"
          />
        )
      }
      className={styles.promptModal}
      headerClassName={styles.header}
      onClose={onClose}
    >
      <div className={styles.promptContent}>
        <div className={styles.deviceList}>
          {Array.isArray(devices) && devices.length > 0 ? (
            devices.map((device) => (
              <div
                className={classNames(styles.deviceItem, {
                  [styles.selected]: device.id === deviceId.value,
                })}
                onClick={() => (deviceId.value = device.id)}
              >
                <div className={styles.deviceNameBar}>
                  {icon && <img />}
                  <div className={styles.deviceNameWrapper}>
                    <div className={styles.deviceNameLabel}>
                      <Text
                        id="gui.connection.deviceName"
                        defaultMessage="Device name"
                      />
                    </div>
                    <div className={styles.deviceNameText}>{device.name}</div>
                  </div>
                </div>
                {device.rssi && <div className={styles.deviceSignalBar}></div>}
              </div>
            ))
          ) : (
            <div className={styles.deviceSearch}>
              <img
                className={classNames(styles.deviceSearchIcon, {
                  [styles.deviceSearchingIcon]: Array.isArray(devices),
                })}
                src={searchingImage}
              />
            </div>
          )}
        </div>

        <div className={styles.buttonRow}>
          {devices === true ? (
            <Button
              className={classNames(styles.button, styles.okButton)}
              onClick={() => onSearch()}
            >
              <Text
                id="gui.connection.search"
                defaultMessage="Start Searching"
              />
            </Button>
          ) : (
            <Button
              disabled={!deviceId.value}
              className={classNames(styles.button, styles.okButton)}
              onClick={handleConnect}
            >
              {!deviceId.value ? (
                <Text
                  id="gui.connection.searching"
                  defaultMessage="Searching"
                />
              ) : (
                <Text
                  id="gui.connection.connect"
                  defaultMessage="Start Connecting"
                />
              )}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
