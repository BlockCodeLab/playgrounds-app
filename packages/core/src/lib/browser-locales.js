import { setUserLanguage, getUserLanguage } from '@blockcode/utils';

const { DisplayNames, Locale } = window.Intl;

const defaultLanguage = 'en';
const browserLanguage = navigator.language;

export const languageNames = new Map();

export function isRtlByLanguage(lang) {
  const locale = new Locale(lang);
  const textInfo = locale.textInfo || locale.getTextInfo();
  return textInfo && textInfo.direction === 'rtl';
}

const unifiedLanguages = {
  'zh-CN': 'zh-Hans',
  'zh-TW': 'zh-Hant',
  'zh-HK': 'zh-Hant',
  'zh-MO': 'zh-Hant',
};

export function getCurrentLanguage() {
  // 从 LocalStorage 或浏览器获取当前语种
  let lang = getUserLanguage() || browserLanguage;
  lang = unifiedLanguages[lang] || lang;
  return languageNames.has(lang) ? lang : defaultLanguage;
}

export function putCurrentLanguage(language) {
  document.querySelector('html').lang = language;
  setUserLanguage(language);
}

const defaultLanguageName = new DisplayNames([defaultLanguage], { type: 'language' });
const browserLanguageName = new DisplayNames([browserLanguage], { type: 'language' });

export function createLocale(language, messages = {}) {
  const displayNames = new DisplayNames([language], { type: 'language' });
  languageNames.set(language, {
    languageName: displayNames.of(language),
    languageNameByDefault: defaultLanguageName.of(language),
    languageNameByBrowser: browserLanguageName.of(language),
  });
  return { language, messages };
}
