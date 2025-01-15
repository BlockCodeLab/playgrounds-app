import { isMac } from '@blockcode/utils';

export const Keys = {
  ESC: 'Escape',
  F1: 'F1',
  F2: 'F2',
  F3: 'F3',
  F4: 'F4',
  F5: 'F5',
  F6: 'F6',
  F7: 'F7',
  F8: 'F8',
  F9: 'F9',
  F10: 'F10',
  F11: 'F11',
  F12: 'F12',
  D1: 'Digit1',
  D2: 'Digit2',
  D3: 'Digit3',
  D4: 'Digit4',
  D5: 'Digit5',
  D6: 'Digit6',
  D7: 'Digit7',
  D8: 'Digit8',
  D9: 'Digit9',
  D0: 'Digit0',
  TAB: 'Tab',
  BACKSPACE: 'Backspace',
  DELETE: 'Delete',
  ENTER: 'Enter',
  RETURN: 'Enter',
  A: 'KeyA',
  B: 'KeyB',
  C: 'KeyC',
  D: 'KeyD',
  E: 'KeyE',
  F: 'KeyF',
  G: 'KeyG',
  H: 'KeyH',
  I: 'KeyI',
  J: 'KeyJ',
  K: 'KeyK',
  L: 'KeyL',
  M: 'KeyM',
  N: 'KeyN',
  O: 'KeyO',
  P: 'KeyP',
  Q: 'KeyQ',
  R: 'KeyR',
  S: 'KeyS',
  T: 'KeyT',
  U: 'KeyU',
  V: 'KeyV',
  W: 'KeyW',
  X: 'KeyX',
  Y: 'KeyY',
  Z: 'KeyZ',
  UP: 'ArrowUp',
  DOWN: 'ArrowDown',
  LEFT: 'ArrowLeft',
  RIGHT: 'ArrowRight',
  SHIFT: 'Shift',
  CTRL: 'Control',
  ALT: 'Alt',
  WIN: 'Meta',
  CONTROL: 'Control',
  OPTION: 'Alt',
  COMMAND: 'Meta',
  META: 'Meta',
};

const KeysSymbol = {
  [Keys.ESC]: isMac ? '⎋' : 'Esc',
  [Keys.F1]: 'F1',
  [Keys.F2]: 'F2',
  [Keys.F3]: 'F3',
  [Keys.F4]: 'F4',
  [Keys.F5]: 'F5',
  [Keys.F6]: 'F6',
  [Keys.F7]: 'F7',
  [Keys.F8]: 'F8',
  [Keys.F9]: 'F9',
  [Keys.F10]: 'F10',
  [Keys.F11]: 'F11',
  [Keys.F12]: 'F12',
  [Keys.D1]: '1',
  [Keys.D2]: '2',
  [Keys.D3]: '3',
  [Keys.D4]: '4',
  [Keys.D5]: '5',
  [Keys.D6]: '6',
  [Keys.D7]: '7',
  [Keys.D8]: '8',
  [Keys.D9]: '9',
  [Keys.D0]: '0',
  [Keys.TAB]: isMac ? '⇥' : 'Tab',
  [Keys.DELETE]: isMac ? '⌫' : 'Backspace',
  [Keys.RETURN]: isMac ? '↩' : 'Enter',
  [Keys.A]: 'A',
  [Keys.B]: 'B',
  [Keys.C]: 'C',
  [Keys.D]: 'D',
  [Keys.E]: 'E',
  [Keys.F]: 'F',
  [Keys.G]: 'G',
  [Keys.H]: 'H',
  [Keys.I]: 'I',
  [Keys.J]: 'J',
  [Keys.K]: 'K',
  [Keys.L]: 'L',
  [Keys.M]: 'M',
  [Keys.N]: 'N',
  [Keys.O]: 'O',
  [Keys.P]: 'P',
  [Keys.Q]: 'Q',
  [Keys.R]: 'R',
  [Keys.S]: 'S',
  [Keys.T]: 'T',
  [Keys.U]: 'U',
  [Keys.V]: 'V',
  [Keys.W]: 'W',
  [Keys.X]: 'X',
  [Keys.Y]: 'Y',
  [Keys.Z]: 'Z',
  [Keys.UP]: '↑',
  [Keys.DOWN]: '↓',
  [Keys.LEFT]: '←',
  [Keys.RIGHT]: '→',
  [Keys.SHIFT]: isMac ? '⇧' : 'Shift',
  [Keys.CONTROL]: isMac ? '⌃' : 'Ctrl',
  [Keys.OPTION]: isMac ? '⌥' : 'Alt',
  [Keys.COMMAND]: isMac ? '⌘' : '⊞',
};

const KeysOrder = {
  [Keys.CONTROL]: 0,
  [Keys.OPTION]: 1,
  [Keys.SHIFT]: 2,
  [Keys.COMMAND]: 3,
};

const Hotkeys = new Map();

export function setHotkey(hotkey, handler) {
  Hotkeys.set(hotkey.join('-'), handler);
}

export function showHotkey(hotkey) {
  const keysName = [];
  if (typeof hotkey === 'string') {
    hotkey = hotkey.split('-');
  }
  hotkey.forEach((key) => {
    if (KeysOrder.hasOwnProperty(key)) {
      keysName[KeysOrder[key]] = KeysSymbol[key];
    } else {
      keysName.push(KeysSymbol[key]);
    }
  });
  return keysName.filter((key) => key).join(isMac ? '' : '+');
}

export function clearHotkeys() {
  Hotkeys.clear();
}

window.addEventListener('keydown', (e) => {
  Hotkeys.forEach((handler, hotkey) => {
    const testKey = (key) => {
      if (key === Keys.CONTROL && e.ctrlKey) {
        return true;
      }
      if (key === Keys.OPTION && e.altKey) {
        return true;
      }
      if (key === Keys.SHIFT && e.shiftKey) {
        return true;
      }
      if (key === Keys.COMMAND && e.metaKey) {
        return true;
      }
      if (key === e.code) {
        return true;
      }
      return false;
    };

    if (typeof hotkey === 'string') {
      hotkey = hotkey.split('-');
    }
    if (hotkey.every(testKey) && typeof handler === 'function') {
      e.preventDefault();
      try {
        handler();
      } catch (err) {}
    }
  });
});
