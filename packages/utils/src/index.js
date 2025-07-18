export { default as classNames } from 'classnames';

export { default as html2canvas } from 'html2canvas';

export { default as JSZip } from 'jszip';

export { default as keyMirror } from 'keymirror';

export { default as Konva } from 'konva';

export { default as localForage } from 'localforage';

export { default as UPNG } from 'upng-js';

export { saveSvg, saveSvgAsPng, svgAsDataUri } from 'save-svg-as-png';

export { Base64Utils } from './lib/base64-utils';

export { Color } from './lib/color';

export { exportFile } from './lib/export-file';

export { fetchSpark } from './lib/fetch-spark';

export { flatChildren } from './lib/flat-children';

export { KonvaUtils, computeConvexHulls } from './lib/konva-utils';

export { MathUtils } from './lib/math-utils';

export { mime } from './lib/mime';

export { nanoid, nanoidLooks } from './lib/nanoid';

export { saveProjectToComputer, openProjectFromComputer, openProjectFromURL } from './lib/project-file';

export { getBinaryCache, setBinaryCache } from './lib/binary-cache';

export {
  isDesktop,
  isMac,
  sleep,
  sleepMs,
  xmlEscape,
  base64ToUint8Array,
  uint8ArrayToBase64,
  arrayBufferToBinaryString,
  arrayBufferToBase64,
} from './lib/simples';

export {
  delProject,
  getProject,
  putProject,
  cloneProject,
  renameProject,
  getProjectsThumbs,
} from './lib/project-storage';

export {
  setUserConfig,
  getUserConfig,
  putUserAllConfig,
  getUserAllConfig,
  setUserLanguage,
  getUserLanguage,
  setEditorConfig,
  getEditorConfig,
  putEditorAllConfig,
  getEditorAllConfig,
  setDockReversed,
  getDockReversed,
} from './lib/user-config';
