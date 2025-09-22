![](docs/_media/bar.png 'BlockCode Playgrounds')

## 关于本代码库

本代码库的各级目录功能如下：

- [docs](docs/): 说明文档
- [examples/](examples/): 扩展开发案例（模版）
  - [blocks-example](examples/blocks-example/): 图形积木扩展案例
  - [editor-example](examples/editor-example/): 编辑器扩展案例
- [packages/](packages/): 功能子模块，子模块介绍见各自说明文档
  - [blocks/](packages/blocks/): 图形积木编程组件
    - [extensions](packages/blocks/extensions): 图形积木扩展
  - [board](packages/board/): 开发板硬件支持库
  - [code](packages/code/): 代码编辑器组件
  - [core](packages/core/): 核心模块，包含核心全局状态机、标准 UI、主题样式定义等
  - [gui/](packages/gui/): 基于 Preact 框架的浏览器端图形界面
    - [editors](packages/gui/editors): 编辑器扩展
  - [paint](packages/paint/): 像素风格画图组件
  - [sound](packages/sound/): 声音编辑组件
  - [utils](packages/utils/): 工具和第三方公共引用库
- [public](public/): 静态文件，包含 LOGO、图片、HTML 等
- [scripts](scripts/): 编译打包脚本
- [src](src/): 基于 Electron 的 windows/macos/linux 跨平台的应用程序

## 开始步骤

1. 安装 [Bun](https://bun.sh/), **Bun is an all-in-one toolkit for JavaScript and TypeScript apps.**

2. 克隆 `playgrounds-app` 项目到 `playgrounds-app` 文件夹，并完成一次完整编译。

```bash
$ git clone https://github.com/BlockCodeLab/playgrounds-app.git
$ cd playgrounds-app
$ git submodule update --init --recursive
$ bun install
$ bun run build
```

3. 运行服务器，用浏览器打开 `localhost:3000`

```bash
$ cd playgrounds-app
$ bun run dev
```

> 开发新的**编辑器扩展**或**图形积木扩展**请参考 [examples/](examples/) 中对应的案例。

### 编译指令

####
