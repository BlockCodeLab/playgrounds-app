export { default as classNames } from 'classnames';

export { Firmata } from 'firmata-io';

export { default as html2canvas } from 'html2canvas';

export { default as JSZip } from 'jszip';

export { default as keyMirror } from 'keymirror';

export { default as localForage } from 'localforage';

export { default as mime } from 'mime/lite';

export { default as UPNG } from 'upng-js';

export { saveSvgAsPng, svgAsDataUri } from 'save-svg-as-png';

export { Color } from './lib/color';

export { exportFile } from './lib/export-file';

export { fetchSpark } from './lib/fetch-spark';

export { flatChildren } from './lib/flat-children';

export { MathUtils } from './lib/math-utils';

export { nanoid, nanoidLooks } from './lib/nanoid';

export { openProjectFromComputer, saveProjectToComputer } from './lib/project-file';

export { isDesktop, isMac, sleep, sleepMs, xmlEscape, arrayBufferToBase64, base64ToArrayBuffer } from './lib/simples';

export {
  delProject,
  getProject,
  putProject,
  cloneProject,
  renameProject,
  getProjectsThumbs,
} from './lib/project-storage';

export {
  getUserConfig,
  putUserConfig,
  getUserLanguage,
  putUserLanguage,
  putEditorAllConfig,
  getEditorAllConfig,
  putEditorConfig,
  getEditorConfig,
  getDockReversed,
  putDockReversed,
} from './lib/user-config';
