## 多语言文本支持

多语言可以让扩展在不同语言环境下用本地语言显示（默认通常为英语）。要启用多语言，需要先使用 `addLocalesMessages` 函数添加多种语言的文本，然后在需要显示文本的地方使用本文 ID 来配置多语言文本，以[微尘颗粒检测传感器扩展案例](custom-extension.md#自定义扩展案例)的 `info.js` 文件为例：

```javascript
// 引用 addLocalesMessages 函数
import { addLocalesMessages } from '@blockcode/core';

export default {
  image: './feature.png',
  icon: './icon.png',
  name: {
    // 文本ID
    id: 'blocks.dust.name',
    // 默认显示文本（在找不到对应本地语言是，显示默认文本，通常为应为英文）
    defaultMessage: 'Dust',
  },
  description: {
    id: 'blocks.dust.description',
    defaultMessage: 'Sensor for PM2.5',
  },
  tags: ['arduino', 'sensor'],
};

// 添加多语言本文
// 只添加当前文件代码中使用的
addLocalesMessages({
  // 英语
  en: {
    // 格式：
    // blocks.[扩展ID].[字段ID]: 显示文本
    'blocks.dust.name': 'Dust',
    'blocks.dust.description': 'Sensor for PM2.5',
  },
  // 简体中文
  'zh-Hans': {
    'blocks.dust.name': '微尘检测',
    'blocks.dust.description': 'PM2.5 颗粒检测传感器。',
  },
  // 繁体中文
  'zh-Hant': { ... },
});
```
