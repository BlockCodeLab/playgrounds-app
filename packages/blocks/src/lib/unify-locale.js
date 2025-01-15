const unifiedLocales = {
  'zh-Hans': 'zh-cn',
  'zh-Hant': 'zh-tw',
};

export function unifyLocale(language) {
  if (unifiedLocales[language]) {
    return unifiedLocales[language];
  }
  return language;
}
