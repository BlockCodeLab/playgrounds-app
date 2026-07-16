## 多語言文本支持

多語言可以讓擴展在不同語言環境下用本地語言顯示（默認通常為英語）。要啟用多語言，需要先使用 `addLocalesMessages` 函數添加多種語言的文本，然後在需要顯示文本的地方使用本文 ID 來配置多語言文本，以[粉塵顆粒檢測傳感器擴展案例](zh-hant/custom-extension.md#自製擴展案例)的 `info.js` 文件為例：

```javascript
// 引用 addLocalesMessages 函數
import { addLocalesMessages } from '@blockcode/core';

export default {
  image: './feature.png',
  icon: './icon.png',
  name: {
    // 文本ID
    id: 'blocks.dust.name',
    // 默認顯示文本（在找不到對應本地語言是，顯示默認文本，通常為應為英文）
    defaultMessage: 'Dust',
  },
  description: {
    id: 'blocks.dust.description',
    defaultMessage: 'Sensor for PM2.5',
  },
  tags: ['arduino', 'sensor'],
};

// 添加多語言本文
// 只添加當前文件代碼中使用的
addLocalesMessages({
  // 英語
  en: {
    // 格式：
    // blocks.[擴展ID].[字段ID]: 顯示文本
    'blocks.dust.name': 'Dust',
    'blocks.dust.description': 'Sensor for PM2.5',
  },
  // 簡體中文
  'zh-Hans': {
    'blocks.dust.name': '粉塵檢測',
    'blocks.dust.description': 'PM2.5 顆粒檢測傳感器。',
  },
  // 繁體中文
  'zh-hant': { ... },
});
```
