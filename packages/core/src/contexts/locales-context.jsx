import { createContext } from 'preact';
import { useContext } from 'preact/hooks';
import { computed, effect, signal } from '@preact/signals';
import { Translator } from '@eo-locale/core';
import { TranslationsProvider } from '@eo-locale/preact';
import {
  getCurrentLanguage,
  putCurrentLanguage,
  languageNames, // 每种语言的多语种名字：自己语言名字、默认语言（英语）名字、用户语言名字
  isRtlByLanguage,
  createLocale,
} from '../lib/browser-locales';

// 核心多语种字符串
//
import en from '../l10n/en.yaml';
import zhHans from '../l10n/zh-hans.yaml';
import zhHant from '../l10n/zh-hant.yaml';

const locales = signal([
  createLocale('en', en),
  createLocale('zh-Hans', zhHans),
  createLocale('zh-Hant', zhHant),
  // ...
]);

// 增加多语种字符串
export function addLocalesMessages(messages) {
  locales.value = locales.value.map((locale) => ({
    language: locale.language,
    messages: Object.assign(locale.messages, messages[locale.language] ?? {}),
  }));
}

// 当前语言及语言方向
//
const language = signal(getCurrentLanguage());
const isRtl = computed(() => isRtlByLanguage(language.value));
const translator = computed(() => new Translator(language.value, locales.value));

// 当语言发生改变立即保存下最新的语言设置
effect(() => putCurrentLanguage(language.value));

// 语言设置
export function setLanguage(val) {
  language.value = val;
}

// 将默认语言字符串翻译成当前语言
export function translate(id, defaultMessage, options = {}) {
  return translator.value.translate(id, {
    defaultMessage,
    ...options,
  });
}

// 检查是否为需要翻译的字符串
export function maybeTranslate(message) {
  if (!message?.props) {
    return message;
  }
  if (message.props.children) {
    return []
      .concat(message.props.children)
      .map((child) => maybeTranslate(child))
      .join('');
  }
  return translate(message.props.id, message.props);
}

// 本地化上下文组件
//
const LocalesContext = createContext();

export const useLocalesContext = () => useContext(LocalesContext);

export function LocalesProvider({ children }) {
  return (
    <LocalesContext.Provider
      value={{
        language,
        languageNames,
        isRtl,
      }}
    >
      <TranslationsProvider
        locales={locales.value}
        language={language.value}
        onError={handleTranslateError}
      >
        {children}
      </TranslationsProvider>
    </LocalesContext.Provider>
  );
}

function handleTranslateError(err) {
  if (DEBUG) {
    console.error(`${err.message}: "${err.id}" in "${err.language}"`);
  }
}
