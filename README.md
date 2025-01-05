![](docs/_media/bar.png 'BlockCode Playgrounds')

## 关于本代码库

本代码库的各级目录功能如下：

- [docs](docs/): 说明文档
- [packages/](packages/): 引用的外部功能子模块，子模块介绍见各自说明文档
  - [blocks/](packages/blocks/): 图形积木编程组件
    - [extensions](packages/blocks/extensions): 图形积木扩展
  - [board/](packages/board/): 开发板硬件支持库
  - [core/](packages/core/): 核心模块，包含核心全局状态机、标准UI、主题样式定义等
  - [examples/](packages/examples/): 精选事例项目
  - [gui/](packages/gui/): 基于 Preact 框架的浏览器端图形界面
    - [editors](packages/gui/editors): 编辑器扩展
  - [paint/](packages/paint/): 像素风格画图组件
  - [sound/](packages/sound/): 声音编辑组件
  - [utils/](packages/utils/): 工具和第三方公共引用库
  - [vm/](packages/vm/): 硬件模拟器
- [public/](public/): 静态文件，包含LOGO、图片、HTML等
- [scripts/](scripts/): 编译程序工具
- [src](src/): 基于 Electron 的 windows/macos/linux 跨平台的应用程序

## 程序框架
