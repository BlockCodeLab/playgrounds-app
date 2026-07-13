![](_media/custom-extension.png)

在使用离线版本的编辑器时，可以通过添加自定义扩展来满足用户在项目中使用了编辑器暂未支持传感器的编程需要。这些本地的自定义扩展会被保存到作品中，在其他电脑上同样用离线版本打开时会被一同加载，保证使用自定义扩展的作品能在任何电脑上打开。

!> 使用了自定义扩展的作品无法被在线版本的编辑器打开，在线版本只能使用编辑器本身支持的扩展编程。

## 使用自定义扩展

自定义扩展保存的位置（如果文件夹不存在请自行创建）：

- Windows：`C:\Users\<用户名>\BlockCode\blocks\`
- macOS：`/Users/<用户名>\BlockCode\blocks\`

每个自定义扩展一个文件夹，文件夹名也是自定义扩展ID，请确保每个自定义扩展的文件夹名唯一且只能由字母、数字和下划线。

!> 确定自定义扩展ID后，请不要更改，更改有可能导致原来用到该自定义扩展的作品无法打开。

### 添加自定义扩展

在离线版本的编辑器中，进入“添加扩展”界面，在扩展分类标签最后会有“自定义”扩展的标签，点击标签后会展示出所有已经保存在本地的自定义扩展。点击“+”图标的占位符，可以添加自定义扩展（支持添加使用 ZIP 压缩包的压缩的一个或多个扩展）。

![](_media/custom-extension.png ':size=600')

> [下载案例](_res/dust.zip ':ignore')直接添加尝试。

也可以直接在自定义扩展的文件夹中手动添加自定义扩展，详细方法见[自定义扩展案例](#自定义扩展案例)。

### 保存使用自定义扩展的作品

只需要按照正常保存作品的流程将作品“保存到电脑”，保存的作品中就会自带所使用的自定义扩展。

![](_media/save-computer.png ':size=300')

### 导出自定义扩展

想要导出一个自己在使用的自定义扩展给其他人使用，可以通过[保存使用自定义扩展的作品](#保存使用自定义扩展的作品)发给其他人（最为简单）,在其他电脑上打开一次作品后就会自动添加使用的自定义扩展。

也可以直接进入自定义扩展的文件夹，选中要导出的自定义扩展（一个或多个），使用压缩工具压缩成 ZIP 压缩包就可以了。其他人只需要按正常[添加自定义扩展](#添加自定义扩展)的方式就可以添加。

## 自定义扩展案例

下面通过一个简单的案例来了解如何创建一个自定义扩展。

> 微尘颗粒检测传感器扩展案例，用于检测空气中 PM2.5 的含量，[下载案例](_res/dust.zip ':ignore')。

### 目录结构

macOS 用户进入 `/Users/<用户名>\BlockCode\blocks\`（Windows 用户进入 `C:\Users\<用户名>\BlockCode\blocks\`），新建一个 `dust` 的文件夹，`dust` 也是扩展ID。

```
- /Users/<用户名>\BlockCode\blocks
  |- dust
    |- info.js
    |- index.js
    |- icon.png
    |- feature.png
    |- pm25_sensor.h
    |- pm25_sensor.cpp
```

除了 `info.js` 和 `index.js`，其他文件都是静态资源文件，使用扩展时会按需被自动加载。

!> 扩展文件夹中，保持目录结构扁平化，不要嵌套文件夹。

### `info.js` 扩展信息

```javascript
export default {
  // 主题图，相对路径
  image: './feature.png',
  // 图标，相对路径
  icon: './icon.png',
  // 扩展名
  name: '微尘检测',
  // 扩展描述
  description: 'PM2.5 颗粒检测传感器。',
  // 扩展过滤标签
  tags: [
    'arduino', // Arduino 系列开发板可用
    'sensor', // 分类标签：传感器
  ],
};
```

在**扩展**界面呈现的扩展介绍信息，主题图和图标使用相对路径，分别对应扩展文件夹中的 `feature.png` 和 `icon.png` 文件。

#### 开发板标签

可以通过标签区分允许哪些开发板的编辑器使用：

- `arduino`：Arduino 系列开发板使用可用（例如，Arduino 和 LGT8F328P）
- `device`：MicroPython 开发板使用可用（例如，ESP32系列 和 物联板iot:bit）

#### 分类标签

可以同时添加多个分类标签，则会在多个分类下都显示该扩展：

- `controller`：输入控制
- `sensor`：传感器
- `actuator`：执行器
- `display`：显示模块
- `module`：智能模块
- `communication`：通讯
- `data`：数据
- `kit`：套件

### `index.js` 扩展定义文件

```javascript
// 积木配置
export default {
  // 图标，相对路径
  icon: './icon.png',
  // 积木主体颜色
  // themeColor: "#0fbd8c",
  // 积木边框颜色
  // otherColor: "#0b8e69",
  // 扩展名
  name: '微尘检测',
  // 图形积木定义列表
  blocks,
  // 转换代码库文件列表
  files,
};

// 图形积木定义列表
// metadata：编辑器元数据，可以获取档案主板引脚信息以及编辑器信息，用于扩展适配不同的编辑器或主板
function blocks(metadata) {
  return [
    {
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
          // 选项菜单：开发板输出引脚的下拉选项
          menu: metadata.boardPins.out,
        },
        // [APin] 参数名
        APin: {
          // 选项菜单：主板的 ADC 引脚
          menu: metadata.boardPins.adc,
        },
      },
      // Arduino 代码转换函数
      // block：当前积木
      // args：输入的参数列表，用的文本描述中占位符的参数名作为 key
      ino(block, args) {
        // 代码头定义：引用库文件，文件列表中该文件以设为自动引用，可不用再添加
        // this.definitions_[`include_pm25_sensor`] = `#include "pm25_sensor.h"`;
        // 代码头定义：定义全局变量
        this.definitions_[`variable_pm25`] = `em::Pm25Sensor pm25(${args.DPin}, ${args.APin});`;
        // 代码头定义：setup 前置代码（保持在 setup 内最前面的代码）
        this.definitions_[`setup_pm25_init`] = `pm25.Init();`;
        // 代码头定义：loop 前置代码（保持在 loop 内最前面的代码）
        // this.definitions_[`loop_...`] = `...`;
        // 积木转换的实际工作代码
        const code = `pm25.Read()`;
        return [code]; // 输出类型的积木，返回的转换代码必须是 [code] 数组形式
      },
      // MicroPython 代码转换函数
      // mpy(block, args) {}, // 暂不转换代码时空缺，或直接返回空字符串，否则会报错
    },
  ];
}

// 转换代码库文件列表
function files(metadata) {
  return metadata.isArduino
    ? [
        // PM2.5 传感器 Arudino 库文件
        {
          // 自动引用该文件
          header: true,
          // 保存文件名
          name: 'pm25_sensor.h',
          // 文件位置，相对路径
          uri: './pm25_sensor.h',
        },
        {
          name: 'pm25_sensor.cpp',
          uri: './pm25_sensor.cpp',
        },
      ]
    : [
        // PM2.5 传感器 MicroPython 库文件
        // 没有直接返回空数组
      ];
}
```

#### 积木配置

定义文件必须导出积木的基础样式配置和积木列表，导出为默认对象。

- `icon`：积木上的图标，使用相对路径，对应扩展文件夹中的 `icon.png` 文件
- `themeColor`：积木主体颜色
- `otherColor`：积木边框颜色
- `name`：扩展的名称
- `blocks`：返回图形积木定义列表
- `files`：返回转换代码库文件列表

#### `metadata` 编辑器元数据

编辑器元数据记录了当前编辑器或所选开发板的必要信息，例如编辑器版本、开发板类型、引脚信息等等。主要会用到的：

- `editor`: 编辑器ID
- `version`：编辑器版本
- `isArduino`：是否为 Arduino 系列编辑器，根据 `editor` 自动判断
- `boardType`：开发板类型
- `boardPins`：开发板引脚，可以作为积木参数的下拉选项
  - `all`：所有引脚
  - `out`：可输出引脚
  - `in`：可输入引脚
  - `adc`：ADC 引脚
  - `dac`：DAC 引脚
  - `pwm`：PWM 引脚

通过编辑器元数据，可以让扩展自动根据所选的编辑器或开发板类型切换可选引脚。

#### `blocks` 图形积木列表

图形积木列表中包含扩展所有可用的积木（或分割线、标签、按钮等）的定义，每个积木的定义都包含积木ID、显示文本、参数、转换代码等。只要积木ID不冲突，每个扩展可以定义很多不同积木。

积木的定义详细见[积木定义](block-definition.md)。

> 快速了解各种积木类型的定义，请[下载所有积木类型定义案例](_res/exmple.zip ':ignore')，添加到扩展库中。

#### `files` 扩展库文件列表

为了保证转换 Arduino 或 MicroPython 代码中使用的外部库文件能够正确被打包（编译）下载到开发板上，在这里需要列出所有使用库文件完整的文件名和静态文件资源所在位置（通常都在扩展文件夹中，用相对路径指明）。

每个文件必须包含字段：

- `name`：完整的文件名
- `uri`：相对（扩展文件夹的）路径

可选字段：

- `header`: 指明该库文件会被转换代码自动引用（`#include <name>` 或 `import <name>`）
- `common`: 指明 MicroPython 库文件为公共库，会被放入 `/lib/<库文件名>` 路径下

Arduino 项目编译后才会下载到开发板，扩展的库文件只和项目有关，因此在使用库文件无需额外注意。

MicroPython 项目扩展的库文件会被直接下载到开发板上，可能出现不同扩展库文件同名情况，为了避免被覆盖，扩展库文件会在 `/lib/<扩展ID>/<库文件名>` 路径下存放，因此在使用库文件时需要注意路径问题。
