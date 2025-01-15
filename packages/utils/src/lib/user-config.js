import keyMirror from 'keymirror';

const Config = keyMirror({
  Language: null,
  DockReversed: null,
});

// 用户语言
//
export function putUserLanguage(language) {
  localStorage.setItem(Config.Language, language);
}

export function getUserLanguage() {
  return localStorage.getItem(Config.Language);
}

// 编辑器配置
//
// 不同编辑器独立设置
export function putEditorConfig(editor, key, value) {
  localStorage.setItem(`${editor}:${key}`, value);
}

export function getEditorConfig(editor, key) {
  return localStorage.getItem(`${editor}:${key}`);
}

export function putEditorAllConfig(editor, config = {}) {
  for (const key in config) {
    putEditorConfig(editor, key, config[key]);
  }
}

export function getEditorAllConfig(editor) {
  const config = {};
  const keyId = `${editor}:`;
  let i, key;
  for (i = 0; i < localStorage.length; i++) {
    key = localStorage.key(i);
    if (key.startsWith(keyId)) {
      config[key.replace(keyId, '')] = localStorage.getItem(`${editor}:${key}`);
    }
  }
  return config;
}

// 停靠栏是否反转
//
export function putDockReversed(editor, flag) {
  putEditorConfig(editor, Config.DockReversed, flag);
}

export function getDockReversed(id) {
  return getEditorConfig(editor, Config.DockReversed);
}
