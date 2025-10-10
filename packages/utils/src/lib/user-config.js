import keyMirror from 'keymirror';

const Config = keyMirror({
  Language: null,
  DockReversed: null,
});

// 用户配置
//
export function setUserConfig(key, value) {
  localStorage.setItem(`user:${key}`, value);
}

export function getUserConfig(key) {
  return localStorage.getItem(`user:${key}`);
}

export function putUserAllConfig(config = {}) {
  for (const key in config) {
    setUserConfig(key, config[key]);
  }
}

export function getUserAllConfig() {
  const config = Object.create(null);
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
export function setUserLanguage(language) {
  setUserConfig(Config.Language, language);
}

export function getUserLanguage() {
  return getUserConfig(Config.Language);
}

// 编辑器配置
// 不同编辑器独立设置
//
export function setEditorConfig(editor, key, value) {
  localStorage.setItem(`${editor}:${key}`, value);
}

export function getEditorConfig(editor, key) {
  return localStorage.getItem(`${editor}:${key}`);
}

export function putEditorAllConfig(editor, config = {}) {
  for (const key in config) {
    setEditorConfig(editor, key, config[key]);
  }
}

export function getEditorAllConfig(editor) {
  const config = Object.create(null);
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
export function setDockReversed(editor, flag) {
  setEditorConfig(editor, Config.DockReversed, flag);
}

export function getDockReversed(editor) {
  return getEditorConfig(editor, Config.DockReversed);
}
