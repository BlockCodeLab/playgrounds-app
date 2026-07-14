完整自製擴展案例見[自製擴展](custom-extension.md)文檔，這裡僅給出一個用於介紹積木定義參數的演示案例。

## `blocks` 圖形積木列表

圖形積木列表中定義了擴展在軟件積木區呈現的每個積木、分割線、標籤等，每個有效的積木定義都包含積木ID、顯示文本、參數、轉換代碼等。

### 分割線

直接添加一個 `'---'` 在列表中，就可以作為分割線，在積木區呈現出分割線上下兩個積木之間有一段空白空間。

### 標籤

標籤可以用戶在多個積木前顯示出一串文本，類似在積木區顯示的積木類型的名字一樣，定義標籤只需要一個參數：

- `label`: 標籤顯示的文本

例如:

```javascript
function blocks(metadata) {
  return [
    { label: '我是標籤' },
    ...
  ]
}
```

### 圖形積木

!> 圖形積木列表中定義的每個積木ID都必須唯一，否則會導致出錯。

```javascript
// 圖形積木列表演示
function blocks(metadata) {
  return [
    {
      // 顯示標籤
      { label: '粉塵檢測' },
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
          // 選項菜單，開發板輸出引腳的下拉選項
          menu: metadata.boardPins.out,
        },
        // [APin] 參數名
        APin: {
          // 選項菜單，主板的 ADC 引腳
          menu: metadata.boardPins.adc,
        },
      },
      // Arduino 轉換代碼
      // block：當前積木
      // args：輸入的參數列表，用的文本描述中占位符的參數名作為 key
      ino(block, args) {
        // 代碼頭定義：引用庫文件，文件列表中該文件以設為自動引用，可不用再添加
        // this.definitions_[`include_pm25_sensor`] = `#include "pm25_sensor.h"`;
        // 代碼頭定義：定義全局變量
        this.definitions_[`variable_pm25`] = `em::Pm25Sensor pm25(${args.DPin}, ${args.APin});`;
        // 代碼頭定義：setup 前置代碼（保持在 setup 內最前面的代碼）
        this.definitions_[`setup_pm25_init`] = `pm25.Init();`;
        // 積木轉換的實際工作代碼
        const code = `pm25.Read()`;
        return [code]; // 輸出類型的積木，返回的轉換代碼必須是 [code] 數組形式
      },
      // MicroPython 轉換代碼
      // mpy(block, args) {}, // 暫不轉換代碼時只需要空缺，或直接返回空字符串（不返回值會報錯）
    },
    '---', // 分割線
    {
      // 積木 ID
      id: 'tone',
      // 積木的文本描述
      text: '引腳 [Pin] 演奏音符 [Note] [Duration] 毫秒',
      // 輸入參數列表
      inputs: {
        // [Pin] 參數名
        Pin: {
          // 選項菜單
          menu: meta.boardPins.out,
        },
        // [Note] 參數名
        Note: {
          // 數據類型，有參數選項時無需指定數據類型
          // 可選類型：string, number, integer, positive, positive_integer, angle, color, matrix, note
          type: 'note',
        },
        // [Duration] 參數名
        Duration: {
          // 數據類型
          type: 'positive_integer',
          // 默認值，可選
          defaultValue: '500',
        },
      },
      // Arduino 代碼轉換函數
      ino(block, args) {
        // frequencyFromNote 輔助函數（自製），可將 note 音符轉為頻率數字
        const freq = frequencyFromNote(args.Note);
        // 使用 Arduino 的 tone() 函數播放音符（頻率）
        const code = `tone(${args.Pin}, ${freq}, ${args.Duration});\n`;
        // 返迴轉換後的代碼，非輸出類型的積木直接返回 code
        return code;
      },
      // MicroPython 代碼轉換函數
      mpy(block, args) {
        // 代碼頭定義：引用庫，每一個需要的庫單獨引用
        this.definitions_['import_time'] = 'import time';
        this.definitions_['import_pin'] = 'from machine import Pin';
        this.definitions_['import_pwm'] = 'from machine import PWM';
        // 代碼頭定義：定義全局變量
        this.definitions_['variable_tone'] = `tone = PWM(Pin(${args.PIN}))`;
        // frequencyFromNote 輔助函數
        const freq = frequencyFromNote(args.Note);
        // 使用 MicroPython 的 PWM 播放音符（頻率）
        let code = '';
        code += `tone.duty_u16(32767)\n`; // 代碼每行需要手動添加換行符\n
        code += `tone.freq(${freq})\n`;
        code += `time.sleep_ms(${args.Duration})\n`;
        code += `tone.duty_u16(0)\n`;
        // 返迴轉換後的代碼
        return code;
      },
    },
  ];
}
```

每個積木定義用一個對象，所有積木組成一個對象數組。

#### 積木必要參數

這些參數是通常積木必須要有的參數，缺少的話將無法成為有效積木。

- `id`：積木ID，必須保證每個積木ID不同，且不要輕易改動，尤其是被其他程序使用過的擴展，改動積木ID有可能出錯。
- `text`：積木展示的文本，文本中可以用 **[ARG]** 形式作為占位符來聲明一個需要輸入的參數，**ARG**是參數名。

#### 外形參數

可選參數，默認積木外形是一個可以上下連接其他積木的普通積木，可以通過下面參數改變外形（積木類型）。

- `output`：數值輸出類型的積木，外形為必須嵌入其他積木使用。可選值：
  - `number`或`string`：輸出的是數字或字符串，兩頭是半圓的積木
  - `boolean`：輸出的是布爾值，兩頭是尖角的積木

#### 輸入參數列表

可選參數，默認積木無需輸入，有 `inputs` 參數時，文本描述中的參數占位符將會轉為輸入形式。輸入參數列表是一個用 `text` 文本中的參數名 **ARG** 作為 **key**（大小寫敏感）的對象，需要給每個輸入參數定義。

- `menu`：選項菜單，選項菜單是一個二維數組:
  - 數組格式：[[選項1顯示文本, 選項1返回值], [選項2顯示文本, 選項2返回值], ...]
  - 例如，`menu: [["高電平", 1], ["低電平", 0]]`，可以作為引腳高低電平選項
- `type`：數據類型，定義了輸入參數的輸入限制或呈現形式。可選值：
  - `string`：字符形式，允許輸入任何字符（僅為輸入限制不代表返回值類型）
  - `number`：數字形式，包含正、負、小數
  - `integer`：整數形式，包含正、負整數
  - `positive`：正數形式，包含正整數和正小數
  - `positive_integer`：正整數形式
  - `angle`：角度輸入形式，出現角度盤可以拖動選擇
  - `color`：顏色輸入形式，通過RGB三色通道調色
  - `matrix`：5×5的點陣輸入形式，可以點亮和點滅
  - `note`：音符輸入形式，出現琴鍵選擇音符
- `defaultValue`：可選，默認值。

!> `menu` 和 `type` 兩個參數二選一即可。

#### 代碼轉換函數

定義積木轉為真正的程序代碼的規則，根據不同的開發板進行轉換，可將圖形積木轉為 Arduino 系列程序代碼片段和 MicroPython 系列程序代碼片段。如果不定義任何轉換函數圖形積木將僅作為顯示，不具備功能，可以只定義一種或者都定義。

轉換函數的 `this` 對象指向當前當前編輯器的 `Blockly.generator` 代碼轉換器。`this.definitions_` 對象中可以定義特定的轉換代碼，對於整體代碼轉換有很重要的作用，詳見[`this.definitions_`](#thisdefinitions) 說明。

轉換後的代碼以字符串的形式返回，多行代碼需要再每行代碼末尾加 `\n` 換行符，代碼無需額外給每行代碼行首加空格（縮進）——除非代碼需要。

- `ino()`：將圖形積木轉為 Arduino 系列程序代碼片段，Arduino 代碼為 C/C++ 語言格式
- `mpy()`：將圖形積木轉為 MicroPython 系列程序代碼片段，代碼為 Python3 語言格式

> 1. 轉換函數，必須至少返回一個空字符串，否則會出錯。
> 2. `output` 輸出類型積木必須返回為數組，將轉換後的代碼字符串放入數組再返回，例如，`return [code];`。

##### 轉換函數參數

- `block`：當前積木對象，原始的 `Blockly.block` 對象
- `args`：獲取當前積木的參數列表，用文本描述中的參數名作為 **key** 獲取值，例如：`args.Pin` 獲取引腳值

!> `args` 獲取參數的值時，如果參數數據類型是 `string` 返回的值會根據內容不是有效數字，在守首尾加上引號（`'`或`"`），例如，`abc123` 返回 `'abc123'` 或 `"abc123"`、`-13.2`返回`-13.2`

##### `this.definitions_` 對象 :id=thisdefinitions

在這個對象中可以添加用於整體代碼轉換的規則，例如，引用頭文件、聲明全局變量（不是「變量」積木）、在 `setup` 或 `loop` 函數添加代碼（限 `Arduino` 系列程序）等等。

###### 用於 `Arduino` 程序：

- `this.definitions_['include_xxx'] =`：在 `Arduino` 程序最前面添加引用的庫<br>
  例如，`this.definitions_['include_wire'] = '#include <Wire.h>';`
- `this.definitions_['variable_xxx'] =`：在所有積木轉換的代碼的前面添加全局變量<br>
  例如，`this.definitions_['variable_compass] = QMC5883LCompass compass;`
- `this.definitions_['setup_xxx'] =`：將定義的代碼添加到 `setup` 函數中其他積木轉換的代碼前面
- `this.definitions_['loop_xxx'] =`：將定義的代碼添加到 `loop` 函數中其他積木轉換的代碼前面

!> `xxx` 作為添加代碼的唯一性 **key**，避免被添加的代碼在多個積木轉換中同時定義，導致最終轉換的代碼中重複出現。

###### 用於 `MicroPython` 程序：

- `this.definitions_['import_xxx'] =`：`MicroPython` 程序最前面添加引用的庫

###### 用於所有程序：

- `this.definitions_['xxx'] =`：將定義的代碼添加到所有積木轉換代碼的前面
