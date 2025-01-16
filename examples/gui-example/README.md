# 编辑器扩展案例

此编辑器扩展案例扩展了一个简单的图形积木编辑器，没有添加任何额外功能，只有基本编辑和保存。

开始你的编辑器开发时，只需要复制该案例，然后进行修改，再按下面步骤炒作就可以在 BlockCode Playgrounds 首页添加新的编辑器入口了（如果要上线到官方网站，还需要向官方申请）。

你的编辑器代码可以放在你自己的仓库，在向官方申请官方线上入口时，只需要提交你的仓库地址就可以了。（申请入口暂未开放）

## 开始步骤

1. 克隆 `playgrounds-app` 项目到 `playgrounds-app` 文件夹，并完成一次完整编译。

```bash
$ git clone https://github.com/BlockCodeLab/playgrounds-app.git
$ cd playgrounds-app
$ bun install
$ bun run build:all
```

2. 进入 `playgrounds-app` 项目文件夹，在 `/packages/gui/editors/` 路径下新建文件夹 `example`，并对新文件夹进行 git 仓库初始化。

```bash
$ cd playgrounds-app/packages/gui/editors/
$ mkdir example
$ cd example
$ git init
$ git remote add origin <GIT-URL>
$ git branch -M main
```

3. 将编辑器案例文件夹下的所有文件复制到 `example` 文件夹，然后执行编译脚本，得到 `dist` 文件夹。

```bash
$ cd playgrounds-app/packages/gui/editors/example
$ bun install
$ bun run build
```

4. 编译 `playgrounds-app` 项目的 `gui` 模块（只需要编译一次，为了加入新编辑器的信息）。

```bash
$ cd playgrounds-app
$ bun run build:gui
```

5. 运行服务器，用浏览器打开 `localhost:3000`

```bash
$ cd playgrounds-app
$ bun run dev
```

> 之后对编辑器的开发只需要执行步骤 3（有必须时还需执行步骤 5）就可以在浏览器中查看了。
