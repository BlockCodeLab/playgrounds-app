import './l10n';

import { svgAsDataUri } from '@blockcode/utils';
import { ScratchBlocks, blocksTab } from '@blockcode/blocks';

import { BlocksEditor } from '@blockcode/blocks';
import { defaultProject } from './lib/default-project';

const handleExtensionsFilter = () => ['example'];

export default {
  // 新建项目
  onNew() {
    return defaultProject;
  },

  // 保存项目，过滤不需要保存的数据
  onSave(files, assets) {
    const extensions = [];
    files = files.map((file) => {
      extensions.push(file.extensions);
      return {
        id: file.id,
        type: file.type,
        xml: file.xml,
      };
    });
    const meta = {
      extensions: Array.from(new Set(extensions.flat())),
    };
    return {
      meta,
      files,
      assets,
    };
  },

  // 生成项目缩略图
  // ! 不要将缩略图生成放在 onSave 中
  async onThumb() {
    const workspace = ScratchBlocks.getMainWorkspace();
    if (workspace) {
      const canvas = workspace.getCanvas();
      if (canvas) {
        return await svgAsDataUri(canvas, {});
      }
    }
  },

  // 撤销操作
  // 这里是积木的撤销
  onUndo(e) {
    if (e instanceof MouseEvent) {
      const workspace = ScratchBlocks.getMainWorkspace();
      workspace?.undo?.(false);
    }
  },

  // 重做操作
  // 这里是积木的重做
  onRedo(e) {
    if (e instanceof MouseEvent) {
      const workspace = ScratchBlocks.getMainWorkspace();
      workspace?.undo?.(true);
    }
  },

  // 允许撤销操作的检测
  onEnableUndo() {
    const workspace = ScratchBlocks.getMainWorkspace();
    return workspace?.undoStack_ && workspace.undoStack_.length !== 0;
  },

  // 允许重做操作的检测
  onEnableRedo() {
    const workspace = ScratchBlocks.getMainWorkspace();
    return workspace?.redoStack_ && workspace.redoStack_.length !== 0;
  },

  // 菜单项
  // {
  //   icon: 图标,
  //   label: 文字,
  //   Menu: 菜单组件,
  // },
  // menuItems: [],

  // 工作区标签页
  // {
  //   icon: 图标,
  //   label: 文字,
  //   Content: 编辑器组件,
  // },
  tabs: [
    {
      ...blocksTab,
      Content: () => {
        return <BlocksEditor onExtensionsFilter={handleExtensionsFilter} />;
      },
    },
  ],

  // 停靠栏
  // {
  //   expand: 位置，可选 left/right/top,
  //   Content: 停靠栏组件,
  // }
  // docks: []
};
