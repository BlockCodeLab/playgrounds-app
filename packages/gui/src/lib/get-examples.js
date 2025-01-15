import en from './examples/en';
import zhHans from './examples/zh-hans';

const examples = {
  en,
  'zh-Hans': zhHans,
};

function hiddenFilter(items) {
  return items.filter((item) => !item.hidden);
}

export default function (language) {
  if (language === 'en') {
    return hiddenFilter(en);
  }
  return hiddenFilter([].concat(en, examples[language] || []));
}
