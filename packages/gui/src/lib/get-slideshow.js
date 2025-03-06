import arcade from './slideshow/arcade/arcade';
import desktop from './slideshow/desktop/desktop';
// import tankwar from './slideshow/tankwar/tankwar';

export default function (openEditor, openProject) {
  return [desktop, arcade(openEditor)];
}
