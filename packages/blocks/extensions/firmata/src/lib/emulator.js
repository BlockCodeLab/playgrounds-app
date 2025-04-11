import { setAlert, Text, Spinner } from '@blockcode/core';
import { ArduinoUtils } from '@blockcode/board';
import { ArduinoTransport } from './arduino-transport';
import { Arduino } from './arduino';

export function emulator(runtime) {
  const arudino = new Arduino();

  runtime.on('connecting', async (device) => {
    setAlert({
      id: 'firmata-checking',
      icon: <Spinner level="success" />,
      message: (
        <Text
          id="blocks.firmata.checking"
          defaultMessage="Checking firmware..."
        />
      ),
    });
    const firmata = await ArduinoUtils.bindingFirmata(device, ArduinoTransport);
    arudino.board = firmata;
    arudino.connect();
  });

  runtime.on('disconnect', () => {
    arudino.disconnect();
  });

  runtime.on('stop', () => {
    arudino.reset();
  });

  return arudino;
}
