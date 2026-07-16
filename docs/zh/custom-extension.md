![](_media/custom-extension.png)

在使用離線版本的編輯器時，可以通過添加自定義擴展來滿足用戶在項目中使用了編輯器暫未支持傳感器的編程需要。這些本地的自定義擴展會被保存到作品中，在其他電腦上同樣用離線版本打開時會被一同加載，保證使用自定義擴展的作品能在任何電腦上打開。

!> 使用了自定義擴展的作品無法被在線版本的編輯器打開，在線版本只能使用編輯器本身支持的擴展編程。

## 使用自定義擴展

自定義擴展保存的位置（如果文件夾不存在請自行創建）：

- Windows：`C:\Users\<用戶名>\BlockCode\blocks\`
- macOS：`/Users/<用戶名>\BlockCode\blocks\`

每個自定義擴展一個文件夾，文件夾名也是自定義擴展ID，請確保每個自定義擴展的文件夾名唯一且只能由字母、數字和下劃線。

!> 確定自定義擴展ID後，請不要更改，更改有可能導致原來用到該自定義擴展的作品無法打開。

### 添加自定義擴展

在離線版本的編輯器中，進入「添加擴展」界面，在擴展分類標籤最後會有「自定義」擴展的標籤，點擊標籤後會展示出所有已經保存在本地的自定義擴展。點擊「+」圖標的占位符，可以添加自定義擴展（支持添加使用 ZIP 壓縮包的壓縮的一個或多個擴展）。

![](_media/custom-extension.png ':size=600')

> [下載案例](_res/dust.zip ':ignore')直接添加嘗試。

也可以直接在自定義擴展的文件夾中手動添加自定義擴展，詳細方法見[自定義擴展案例](#自定義擴展案例)。

### 保存使用自定義擴展的作品

只需要按照正常保存作品的流程將作品「保存到電腦」，保存的作品中就會自帶所使用的自定義擴展。

![](_media/save-computer.png ':size=300')

### 導出自定義擴展

想要導出一個自己在使用的自定義擴展給其他人使用，可以通過[保存使用自定義擴展的作品](#保存使用自定義擴展的作品)發給其他人（最為簡單）,在其他電腦上打開一次作品後就會自動添加使用的自定義擴展。

也可以直接進入自定義擴展的文件夾，選中要導出的自定義擴展（一個或多個），使用壓縮工具壓縮成 ZIP 壓縮包就可以了。其他人只需要按正常[添加自定義擴展](#添加自定義擴展)的方式就可以添加。

## 自定義擴展案例

下面通過一個簡單的案例來了解如何創建一個自定義擴展。

> 粉塵顆粒檢測傳感器擴展案例，用於檢測空氣中 PM2.5 的含量，[下載案例](_res/dust.zip ':ignore')。

### 目錄結構

macOS 用戶進入 `/Users/<用戶名>\BlockCode\blocks\`（Windows 用戶進入 `C:\Users\<用戶名>\BlockCode\blocks\`），新建一個 `dust` 的文件夾，`dust` 也是擴展ID。

```
- /Users/<用戶名>\BlockCode\blocks
  |- dust
    |- info.js
    |- index.js
    |- icon.png
    |- feature.png
    |- lib
      |- pm25_sensor.h
      |- lib/pm25_sensor.cpp
```

除了 `info.js` 和 `index.js`，其他文件都是靜態資源文件，可以根據需要按文件夾整理，使用擴展時會按需被自動加載。

!> `info.js` 和 `index.js` 必須放在自定義擴展文件夾的首層路徑。

### `info.js` 擴展信息

```javascript
export default {
  // 版本
  version: '1.0.0',
  // 主題圖，相對路徑
  image: './feature.png',
  // 圖標，相對路徑
  icon: './icon.png',
  // 擴展名
  name: '粉塵檢測',
  // 擴展描述
  description: 'PM2.5 顆粒檢測傳感器。',
  // 合作者/作者
  collaborator: 'Emakefun',
  // 擴展過濾標籤
  tags: [
    'arduino', // Arduino 系列開發板可用
    'sensor', // 分類標籤：傳感器
  ],
  // 信息外鏈
  readme: 'https://docs.emakefun.com/#/zh-cn/ph2.0_sensors/sensors/pm2.5_dust_sensor/pm2.5_dust_sensor',
};
```

在**擴展**界面呈現的擴展介紹信息，主題圖和圖標使用相對路徑，分別對應擴展文件夾中的 `feature.png` 和 `icon.png` 文件。

#### 開發板標籤

可以通過標籤區分允許哪些開發板的編輯器使用：

- `arduino`：Arduino 系列開發板使用可用（例如，Arduino 和 LGT8F328P）
- `device`：MicroPython 開發板使用可用（例如，ESP32系列 和 物聯板iot:bit）

#### 分類標籤

可以同時添加多個分類標籤，則會在多個分類下都顯示該擴展：

- `controller`：輸入控制
- `sensor`：傳感器
- `actuator`：執行器
- `display`：顯示模塊
- `module`：智能模塊
- `communication`：通訊
- `data`：數據
- `kit`：套件

### `index.js` 擴展定義文件

```javascript
// 積木配置
export default {
  // 圖標，相對路徑
  icon: './icon.png',
  // 積木主體顏色
  // themeColor: "#0fbd8c",
  // 積木邊框顏色
  // otherColor: "#0b8e69",
  // 擴展名
  name: '粉塵檢測',
  // 圖形積木定義列表
  blocks,
  // 轉換代碼庫文件列表
  files,
};

// 圖形積木定義列表
// metadata：編輯器元數據，可以獲取檔案主板引腳信息以及編輯器信息，用於擴展適配不同的編輯器或主板
function blocks(metadata) {
  return [
    {
      // 積木 ID，擴展內的每個積木 ID 必須唯一
      id: 'pm25value',
      // 積木的文本描述，[ARG] 是輸入參數的占位符，ARG 是參數名
      text: '引腳 D:[DPin] A:[APin] 的 PM2.5 濃度（μg/m³）',
      // 積木為輸出樣式（兩頭為圓或尖角），輸出類型積木
      // 可選類型：number, string, boolean
      output: 'number',
      // 輸入參數列表
      inputs: {
        // 文本描述中占位符 [DPin] 的參數名
        DPin: {
          // 選項菜單：開發板輸出引腳的下拉選項
          menu: metadata.boardPins.out,
        },
        // [APin] 參數名
        APin: {
          // 選項菜單：主板的 ADC 引腳
          menu: metadata.boardPins.adc,
        },
      },
      // Arduino 代碼轉換函數
      // block：當前積木
      // args：輸入的參數列表，用的文本描述中占位符的參數名作為 key
      // defs：代碼頭（初始代碼）定義
      ino(block, args, defs) {
        // 代碼頭定義：引用庫文件，文件列表中該文件以設為自動引用，可不用再添加
        // defs[`include_pm25_sensor`] = `#include "pm25_sensor.h"`;
        // 代碼頭定義：定義全局變量
        defs[`variable_pm25`] = `em::Pm25Sensor pm25(${args.DPin}, ${args.APin});`;
        // 代碼頭定義：setup 前置代碼（保持在 setup 內最前面的代碼）
        defs[`setup_pm25_init`] = `pm25.Init();`;
        // 代碼頭定義：loop 前置代碼（保持在 loop 內最前面的代碼）
        // defs[`loop_...`] = `...`;
        // 積木轉換的實際工作代碼
        const code = `pm25.Read()`;
        return [code]; // 輸出類型的積木，返回的轉換代碼必須是 [code] 數組形式
      },
      // MicroPython 代碼轉換函數
      // mpy(block, args) {}, // 暫不轉換代碼時空缺，或直接返回空字符串，否則會報錯
    },
  ];
}

// 轉換代碼庫文件列表
function files(metadata) {
  return metadata.isArduino
    ? [
        // PM2.5 傳感器 Arudino 庫文件
        {
          // 自動引用該文件
          header: true,
          // 保存文件名
          name: 'pm25_sensor.h',
          // 文件位置，相對路徑
          uri: './lib/pm25_sensor.h',
        },
        {
          name: 'pm25_sensor.cpp',
          uri: './lib/pm25_sensor.cpp',
        },
      ]
    : [
        // PM2.5 傳感器 MicroPython 庫文件
        // 沒有直接返回空數組
      ];
}
```

#### 積木配置

定義文件必須導出積木的基礎樣式配置和積木列表，導出為默認對象。

- `icon`：積木上的圖標，使用相對路徑，對應擴展文件夾中的 `icon.png` 文件
- `themeColor`：積木主體顏色
- `otherColor`：積木邊框顏色
- `name`：擴展的名稱
- `blocks`：返回圖形積木定義列表
- `files`：返迴轉換代碼庫文件列表

#### `metadata` 編輯器元數據

編輯器元數據記錄了當前編輯器或所選開發板的必要信息，例如編輯器版本、開發板類型、引腳信息等等。主要會用到的：

- `editor`: 編輯器ID
- `version`：編輯器版本
- `isArduino`：是否為 Arduino 系列編輯器，根據 `editor` 自動判斷
- `boardType`：開發板類型
- `boardPins`：開發板引腳，可以作為積木參數的下拉選項
  - `all`：所有引腳
  - `out`：可輸出引腳
  - `in`：可輸入引腳
  - `adc`：ADC 引腳
  - `dac`：DAC 引腳
  - `pwm`：PWM 引腳

通過編輯器元數據，可以讓擴展自動根據所選的編輯器或開發板類型切換可選引腳。

#### `blocks` 圖形積木列表

圖形積木列表中包含擴展所有可用的積木（或分割線、標籤、按鈕等）的定義，每個積木的定義都包含積木ID、顯示文本、參數、轉換代碼等。只要積木ID不衝突，每個擴展可以定義很多不同積木。

積木的定義詳細見[積木定義](block-definition.md)。

> 快速了解各種積木類型的定義，請[下載所有積木類型定義案例](_res/exmple.zip ':ignore')，添加到擴展庫中。

#### `files` 擴展庫文件列表

為了保證轉換 Arduino 或 MicroPython 代碼中使用的外部庫文件能夠正確被打包（編譯）下載到開發板上，在這裡需要列出所有使用庫文件完整的文件名和靜態文件資源所在位置（通常都在擴展文件夾中，用相對路徑指明）。

每個文件必須包含字段：

- `name`：完整的文件名
- `uri`：相對（擴展文件夾的）路徑

可選字段：

- `header`: 指明該庫文件會被轉換代碼自動引用（`#include <name>` 或 `import <name>`）
- `common`: 指明 MicroPython 庫文件為公共庫，會被放入設備的 `/lib/<庫文件名>` 路徑下

Arduino 項目編譯後才會下載到開發板，擴展的庫文件只和項目有關，因此在使用庫文件無需額外注意。

MicroPython 項目擴展的庫文件會被直接下載到開發板上，可能出現不同擴展庫文件同名情況，為了避免被覆蓋，擴展庫文件會在 `/lib/<擴展ID>/<庫文件名>` 路徑下存放，因此在使用庫文件時需要注意路徑問題。
