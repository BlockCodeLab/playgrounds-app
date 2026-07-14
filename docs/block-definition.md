完整自定义扩展案例见[自定义扩展](custom-extension.md)文档，这里仅给出一个用于介绍积木定义参数的演示案例。

## `blocks` 图形积木列表

图形积木列表中定义了扩展在软件积木区呈现的每个积木、分割线、标签等，每个有效的积木定义都包含积木ID、显示文本、参数、转换代码等。

### 分割线

直接添加一个 `'---'` 在列表中，就可以作为分割线，在积木区呈现出分割线上下两个积木之间有一段空白空间。

### 标签

标签可以用户在多个积木前显示出一串文本，类似在积木区显示的积木类型的名字一样，定义标签只需要一个参数：

- `label`: 标签显示的文本

例如:

```javascript
function blocks(metadata) {
  return [
    { label: '我是标签' },
    ...
  ]
}
```

### 图形积木

!> 图形积木列表中定义的每个积木ID都必须唯一，否则会导致出错。

```javascript
// 图形积木列表演示
function blocks(metadata) {
  return [
    {
      // 显示标签
      { label: '粉尘检测' },
      // 积木 ID，扩展内的每个积木 ID 必须唯一
      id: 'pm25value',
      // 积木的文本描述，[ARG] 是输入参数的占位符，ARG 是参数名
      text: '引脚 D:[DPin] A:[APin] 的 PM2.5 浓度（μg/m³）',
      // 积木为输出样式（两头为圆或尖角），输出类型积木
      // 可选类型：number, string, boolean
      output: 'number',
      // 输入参数列表
      inputs: {
        // 文本描述中占位符 [DPin] 的参数名
        DPin: {
          // 选项菜单，开发板输出引脚的下拉选项
          menu: metadata.boardPins.out,
        },
        // [APin] 参数名
        APin: {
          // 选项菜单，主板的 ADC 引脚
          menu: metadata.boardPins.adc,
        },
      },
      // Arduino 转换代码
      // block：当前积木
      // args：输入的参数列表，用的文本描述中占位符的参数名作为 key
      ino(block, args) {
        // 代码头定义：引用库文件，文件列表中该文件以设为自动引用，可不用再添加
        // this.definitions_[`include_pm25_sensor`] = `#include "pm25_sensor.h"`;
        // 代码头定义：定义全局变量
        this.definitions_[`variable_pm25`] = `em::Pm25Sensor pm25(${args.DPin}, ${args.APin});`;
        // 代码头定义：setup 前置代码（保持在 setup 内最前面的代码）
        this.definitions_[`setup_pm25_init`] = `pm25.Init();`;
        // 积木转换的实际工作代码
        const code = `pm25.Read()`;
        return [code]; // 输出类型的积木，返回的转换代码必须是 [code] 数组形式
      },
      // MicroPython 转换代码
      // mpy(block, args) {}, // 暂不转换代码时只需要空缺，或直接返回空字符串（不返回值会报错）
    },
    '---', // 分割线
    {
      // 积木 ID
      id: 'tone',
      // 积木的文本描述
      text: '引脚 [Pin] 演奏音符 [Note] [Duration] 毫秒',
      // 输入参数列表
      inputs: {
        // [Pin] 参数名
        Pin: {
          // 选项菜单
          menu: meta.boardPins.out,
        },
        // [Note] 参数名
        Note: {
          // 数据类型，有参数选项时无需指定数据类型
          // 可选类型：string, number, integer, positive, positive_integer, angle, color, matrix, note
          type: 'note',
        },
        // [Duration] 参数名
        Duration: {
          // 数据类型
          type: 'positive_integer',
          // 默认值，可选
          defaultValue: '500',
        },
      },
      // Arduino 代码转换函数
      ino(block, args) {
        // frequencyFromNote 辅助函数（自定义），可将 note 音符转为频率数字
        const freq = frequencyFromNote(args.Note);
        // 使用 Arduino 的 tone() 函数播放音符（频率）
        const code = `tone(${args.Pin}, ${freq}, ${args.Duration});\n`;
        // 返回转换后的代码，非输出类型的积木直接返回 code
        return code;
      },
      // MicroPython 代码转换函数
      mpy(block, args) {
        // 代码头定义：引用库，每一个需要的库单独引用
        this.definitions_['import_time'] = 'import time';
        this.definitions_['import_pin'] = 'from machine import Pin';
        this.definitions_['import_pwm'] = 'from machine import PWM';
        // 代码头定义：定义全局变量
        this.definitions_['variable_tone'] = `tone = PWM(Pin(${args.PIN}))`;
        // frequencyFromNote 辅助函数
        const freq = frequencyFromNote(args.Note);
        // 使用 MicroPython 的 PWM 播放音符（频率）
        let code = '';
        code += `tone.duty_u16(32767)\n`; // 代码每行需要手动添加换行符\n
        code += `tone.freq(${freq})\n`;
        code += `time.sleep_ms(${args.Duration})\n`;
        code += `tone.duty_u16(0)\n`;
        // 返回转换后的代码
        return code;
      },
    },
  ];
}
```

每个积木定义用一个对象，所有积木组成一个对象数组。

#### 积木必要参数

这些参数是通常积木必须要有的参数，缺少的话将无法成为有效积木。

- `id`：积木ID，必须保证每个积木ID不同，且不要轻易改动，尤其是被其他程序使用过的扩展，改动积木ID有可能出错。
- `text`：积木展示的文本，文本中可以用 **[ARG]** 形式作为占位符来声明一个需要输入的参数，**ARG**是参数名。

#### 外形参数

可选参数，默认积木外形是一个可以上下连接其他积木的普通积木，可以通过下面参数改变外形（积木类型）。

- `output`：数值输出类型的积木，外形为必须嵌入其他积木使用。可选值：
  - `number`或`string`：输出的是数字或字符串，两头是半圆的积木
  - `boolean`：输出的是布尔值，两头是尖角的积木

#### 输入参数列表

可选参数，默认积木无需输入，有 `inputs` 参数时，文本描述中的参数占位符将会转为输入形式。输入参数列表是一个用 `text` 文本中的参数名 **ARG** 作为 **key**（大小写敏感）的对象，需要给每个输入参数定义。

- `menu`：选项菜单，选项菜单是一个二维数组:
  - 数组格式：[[选项1显示文本, 选项1返回值], [选项2显示文本, 选项2返回值], ...]
  - 例如，`menu: [["高电平", 1], ["低电平", 0]]`，可以作为引脚高低电平选项
- `type`：数据类型，定义了输入参数的输入限制或呈现形式。可选值：
  - `string`：字符形式，允许输入任何字符（仅为输入限制不代表返回值类型）
  - `number`：数字形式，包含正、负、小数
  - `integer`：整数形式，包含正、负整数
  - `positive`：正数形式，包含正整数和正小数
  - `positive_integer`：正整数形式
  - `angle`：角度输入形式，出现角度盘可以拖动选择
  - `color`：颜色输入形式，通过RGB三色通道调色
  - `matrix`：5×5的点阵输入形式，可以点亮和点灭
  - `note`：音符输入形式，出现琴键选择音符
- `defaultValue`：可选，默认值。

!> `menu` 和 `type` 两个参数二选一即可。

#### 代码转换函数

定义积木转为真正的程序代码的规则，根据不同的开发板进行转换，可将图形积木转为 Arduino 系列程序代码片段和 MicroPython 系列程序代码片段。如果不定义任何转换函数图形积木将仅作为显示，不具备功能，可以只定义一种或者都定义。

转换函数的 `this` 对象指向当前当前编辑器的 `Blockly.generator` 代码转换器。`this.definitions_` 对象中可以定义特定的转换代码，对于整体代码转换有很重要的作用，详见[`this.definitions_`](#thisdefinitions) 说明。

转换后的代码以字符串的形式返回，多行代码需要再每行代码末尾加 `\n` 换行符，代码无需额外给每行代码行首加空格（缩进）——除非代码需要。

- `ino()`：将图形积木转为 Arduino 系列程序代码片段，Arduino 代码为 C/C++ 语言格式
- `mpy()`：将图形积木转为 MicroPython 系列程序代码片段，代码为 Python3 语言格式

> 1. 转换函数，必须至少返回一个空字符串，否则会出错。
> 2. `output` 输出类型积木必须返回为数组，将转换后的代码字符串放入数组再返回，例如，`return [code];`。

##### 转换函数参数

- `block`：当前积木对象，原始的 `Blockly.block` 对象
- `args`：获取当前积木的参数列表，用文本描述中的参数名作为 **key** 获取值，例如：`args.Pin` 获取引脚值

!> `args` 获取参数的值时，如果参数数据类型是 `string` 返回的值会根据内容不是有效数字，在守首尾加上引号（`'`或`"`），例如，`abc123` 返回 `'abc123'` 或 `"abc123"`、`-13.2`返回`-13.2`

##### `this.definitions_` 对象 :id=thisdefinitions

在这个对象中可以添加用于整体代码转换的规则，例如，引用头文件、声明全局变量（不是“变量”积木）、在 `setup` 或 `loop` 函数添加代码（限 `Arduino` 系列程序）等等。

###### 用于 `Arduino` 程序：

- `this.definitions_['include_xxx'] =`：在 `Arduino` 程序最前面添加引用的库<br>
  例如，`this.definitions_['include_wire'] = '#include <Wire.h>';`
- `this.definitions_['variable_xxx'] =`：在所有积木转换的代码的前面添加全局变量<br>
  例如，`this.definitions_['variable_compass] = QMC5883LCompass compass;`
- `this.definitions_['setup_xxx'] =`：将定义的代码添加到 `setup` 函数中其他积木转换的代码前面
- `this.definitions_['loop_xxx'] =`：将定义的代码添加到 `loop` 函数中其他积木转换的代码前面

!> `xxx` 作为添加代码的唯一性 **key**，避免被添加的代码在多个积木转换中同时定义，导致最终转换的代码中重复出现。

###### 用于 `MicroPython` 程序：

- `this.definitions_['import_xxx'] =`：`MicroPython` 程序最前面添加引用的库

###### 用于所有程序：

- `this.definitions_['xxx'] =`：将定义的代码添加到所有积木转换代码的前面
