import keyMirror from 'keymirror';

const Config = keyMirror({
  Language: null,
  DockReversed: null,
});

// 用户配置
//
export function putUserConfig(key, value) {
  localStorage.setItem(`user:${key}`, value);
}

export function getUserConfig(key) {
  return localStorage.getItem(`user:${key}`);
}

export function putUserAllConfig(config = {}) {
  for (const key in config) {
    putUserConfig(key, config[key]);
  }
}

export function getUserAllConfig() {
  const config = {};
  const keyId = `user:`;
  let i, key;
  for (i = 0; i < localStorage.length; i++) {
    key = localStorage.key(i);
    if (key.startsWith(keyId)) {
      config[key.replace(keyId, '')] = localStorage.getItem(`${keyId}${key}`);
    }
  }
  return config;
}

// 用户语言
export function putUserLanguage(language) {
  putUserConfig(Config.Language, language);
}

export function getUserLanguage() {
  return getUserConfig(Config.Language);
}

// 编辑器配置
// 不同编辑器独立设置
//
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
      config[key.replace(keyId, '')] = localStorage.getItem(`${keyId}${key}`);
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
