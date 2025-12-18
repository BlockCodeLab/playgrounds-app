import './css/global.css';
import './css/typography.css';

// 主题颜色
export { default as themeColors } from './css/colors.toml';

export {
  LocalesProvider,
  useLocalesContext,
  addLocalesMessages,
  setLanguage,
  translate,
  maybeTranslate,
} from './contexts/locales-context';

export {
  AppProvider,
  useAppContext,
  showSplash,
  hideSplash,
  addAlertConfig,
  setAlert,
  delAlert,
  openPromptModal,
  closePromptModal,
  openLayout,
  closeLayout,
  openTab,
  addTabs,
  setAppState,
  openUserStorage,
  closeUserStorage,
  setMacosMenuBarStyled,
  logger,
} from './contexts/app-context';

export {
  ProjectProvider,
  useProjectContext,
  ModifyTypes,
  setMeta,
  setModified,
  isModifyType,
  renameProject,
  openFile,
  addFile,
  setFile,
  getFile,
  delFile,
  openAsset,
  addAsset,
  setAsset,
  getAsset,
  delAsset,
  openProject,
  closeProject,
} from './contexts/project-context';

export { DateTime, Numeric, Text } from '@eo-locale/preact';

export { ActionButton } from './components/action-button/action-button';

export { Box } from './components/box/box';

export { BufferedInput } from './components/forms/buffered-input';

export { Button } from './components/button/button';

export { ContextMenu } from './components/context-menu/context-menu';

export { Dropdown } from './components/dropdown/dropdown';

export { IconSelector } from './components/icon-selector/icon-selector';

export { IconSelectorItem } from './components/icon-selector/icon-selector-item';

export { Library } from './components/library/library';

export { LibraryItem } from './components/library/library-item';

export { Input } from './components/forms/input';

export { Label } from './components/forms/label';

export { Menu, MenuItem, MenuSection } from './components/menu/menu';

export { Modal } from './components/modal/modal';

export { Spinner } from './components/spinner/spinner';

export { ToggleButtons } from './components/toggle-buttons/toggle-buttons';

export { Tooltip } from './components/tooltip/tooltip';

export { Keys, setHotkey, showHotkey, clearHotkeys } from './lib/io/hotkey';

export { Serial } from './lib/io/serial';

export { BLE } from './lib/io/ble';
