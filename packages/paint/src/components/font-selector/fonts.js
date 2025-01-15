const DefaultFonts = [
  {
    family: 'Sans Serif',
  },
  {
    family: 'Serif',
  },
  {
    family: 'Handwriting',
  },
  {
    family: 'Marker',
  },
  {
    family: 'Curly',
  },
  {
    family: 'Pixel',
  },
  {
    label: '中文',
    family: '"Microsoft YaHei", "微软雅黑", STXihei, "华文细黑"',
  },
  {
    label: '日本語',
    family:
      '"ヒラギノ角ゴ Pro W3", "Hiragino Kaku Gothic Pro", Osaka, "メイリオ", Meiryo, "ＭＳ Ｐゴシック", "MS PGothic"',
  },
  {
    label: '한국어',
    family: 'Malgun Gothic',
  },
];

const getSameSubstr = (str1, str2) => {
  const max = str1.length > str2.length ? str1 : str2;
  const min = max == str1 ? str2 : str1;
  let str;
  for (let i = 0; i < min.length; i++) {
    for (let x = 0, y = min.length - i; y != min.length + 1; x++, y++) {
      // y表示所取字符串的长度
      str = min.substring(x, y);
      // 判断max中是否包含str
      if (max.indexOf(str) != -1) {
        return str;
      }
    }
  }
  return '';
};

export async function getAvailableFonts() {
  try {
    const availableFonts = await window.queryLocalFonts();
    const fonts = new Map();
    let fullName;
    for (const fontData of availableFonts) {
      if (/demo/i.test(fontData.family)) continue;
      fullName = fontData.fullName;
      if (fonts.has(fontData.family)) {
        fullName = fonts.get(fontData.family);
        fullName = getSameSubstr(fullName, fontData.fullName);
      }
      fonts.set(fontData.family, fullName);
    }
    return fonts
      .entries()
      .toArray()
      .map(([family, label]) => ({ label, family }));
  } catch (err) {
    return DefaultFonts;
  }
}
