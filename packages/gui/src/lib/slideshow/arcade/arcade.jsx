import { Text } from '@blockcode/core';
import arcadeImage from './arcade.png';
import arcadeBackground from './arcade-bg.jpg';

export default function (openEditor) {
  return {
    title: (
      <Text
        id="gui.home.slideshow.arcade.title"
        defaultMessage="The Tank War is coming! Join us! NOW!"
      />
    ),
    backgroundImage: arcadeBackground,
    featureImage: arcadeImage,
    buttonText: (
      <Text
        id="gui.home.slideshow.arcade.button"
        defaultMessage="Play now"
      />
    ),
    onClick: () => openEditor('@blockcode/gui-arcade'),
  };
}
