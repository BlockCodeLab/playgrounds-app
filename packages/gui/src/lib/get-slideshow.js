import arcade from './slideshow/arcade/arcade';
import tankwar from './slideshow/tankwar/tankwar';

export default function (openEditor, openProject) {
  return [arcade(openEditor), tankwar(openEditor)];
}
