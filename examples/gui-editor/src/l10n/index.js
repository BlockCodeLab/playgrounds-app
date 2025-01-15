import { addLocalesMessages } from '@blockcode/core';

import en from './en.yaml';
import zhHans from './zh-hans.yaml';
import zhHant from './zh-hant.yaml';

addLocalesMessages({
  en,
  'zh-Hans': zhHans,
  'zh-Hant': zhHant,
});
