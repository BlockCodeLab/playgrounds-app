import { nanoid } from '@blockcode/utils';
import { addLocalesMessages, setAlert, delAlert, Text, Spinner } from '@blockcode/core';
import { MPYUtils } from '@blockcode/board';

import translations from './l10n.yaml';
import iconImage from './icon.png';

addLocalesMessages(translations);

let downloadingAlertId;

const deviceFilters = [
  {
    usbVendorId: 0x303a, // Espressif Vendor ID
    usbProductId: 0x8001, // Arcade Product ID
  },
];

const removeDownloading = () => {
  delAlert(downloadingAlertId);
  downloadingAlertId = null;
};

const downloadingAlert = (progress) => {
  if (!downloadingAlertId) {
    downloadingAlertId = nanoid();
  }
  if (progress < 100) {
    setAlert({
      id: downloadingAlertId,
      icon: <Spinner level="success" />,
      message: (
        <Text
          id="gui.alert.downloadingProgress"
          defaultMessage="Downloading...{progress}%"
          progress={progress}
        />
      ),
    });
  } else {
    setAlert('downloadCompleted', { id: downloadingAlertId });
    setTimeout(removeDownloading, 2000);
  }
};

const errorAlert = (err) => {
  if (err === 'NotFoundError') return;
  setAlert('connectionError', 1000);
};

export default {
  icon: iconImage,
  name: (
    <Text
      id="blocks.nes.name"
      defaultMessage="NES emulator"
    />
  ),
  blocks: [
    {
      button: 'DOWNLOAD_ROM',
      text: (
        <Text
          id="blocks.nes.download"
          defaultMessage="Download ROM to Arcade"
        />
      ),
      async onClick() {
        if (downloadingAlertId) return;

        let currentDevice;
        try {
          currentDevice = await MPYUtils.connect(deviceFilters);
          await MPYUtils.enterDownloadMode(currentDevice);
        } catch (err) {
          errorAlert(err.name);
        }
        if (!currentDevice) return;

        const checker = MPYUtils.check(currentDevice).catch(() => {
          errorAlert();
          removeDownloading();
        });

        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.nes';
        fileInput.multiple = true;
        fileInput.click();
        fileInput.addEventListener('change', async ({ target }) => {
          const files = [];
          let gameKey = '';
          for (const file of target.files) {
            files.push({
              id: `nes/${file.name}`,
              content: await file.arrayBuffer(),
            });
            gameKey = file.name;
          }

          try {
            await MPYUtils.write(currentDevice, files, downloadingAlert);
            await MPYUtils.config(currentDevice, { 'latest-game': gameKey });
            currentDevice.hardReset();
          } catch (err) {
            errorAlert(err.name);
            removeDownloading();
          }

          checker.cancel();
        });
      },
    },
  ],
};
