import { Text } from '@blockcode/core';
import desktopImage from './desktop.png';
import desktopBackground from './desktop-bg.jpg';

export default {
  title: (
    <Text
      id="gui.home.slideshow.desktop.title"
      defaultMessage="The desktop application is here!"
    />
  ),
  backgroundImage: desktopBackground,
  featureImage: desktopImage,
  buttonText: (
    <Text
      id="gui.home.slideshow.desktop.button"
      defaultMessage="Download"
    />
  ),
  onClick: () => window.open('//app.blockcode.fun/#/?id=download'),
};
