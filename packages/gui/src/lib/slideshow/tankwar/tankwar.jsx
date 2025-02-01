import { Text } from '@blockcode/core';
import tankwarImage from './tankwar.png';
import tankwarBackground from './tankwar-bg.jpg';

export default function (openEditor) {
  return {
    title: (
      <Text
        id="gui.home.slideshow.tankwar.title"
        defaultMessage="The Tank War is coming! Join us! NOW!"
      />
    ),
    backgroundImage: tankwarBackground,
    featureImage: tankwarImage,
    buttonText: (
      <Text
        id="gui.home.slideshow.tankwar.button"
        defaultMessage="Join us"
      />
    ),
    onClick: () => openEditor('playground-tankwar'),
  };
}
