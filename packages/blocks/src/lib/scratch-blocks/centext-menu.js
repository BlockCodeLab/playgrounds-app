import { saveSvgAsPng, nanoid } from '@blockcode/utils';
import { translate } from '@blockcode/core';
import { ScratchBlocks } from './scratch-blocks';

// 将为积木添加注释的菜单项改为导出积木图片
ScratchBlocks.ContextMenu.blockCommentOption = function (block) {
  // 修改自定义菜单添加规则
  // 不能往后添加，只能添加在前面，保证删除菜单项是在最后面
  if (block.customContextMenu && !block['#customContextMenu']) {
    const customContextMenu = block.customContextMenu;
    block.customContextMenu = function (menuOptions) {
      const i = menuOptions.length;
      menuOptions.push = (item) => {
        menuOptions.splice(-i, 0, item);
        return menuOptions.length;
      };
      customContextMenu.call(this, menuOptions);
    };
    block['#customContextMenu'] = customContextMenu;
  }
  const exportPngOption = {
    enabled: true,
    text: translate('blocks.centextMenu.exportPng', 'Export Block to PNG'),
    callback() {
      const options = {};
      const bbox = block.svgGroup_.getBBox();
      // 修复帽子积木被裁剪掉帽子
      bbox.y = 0;
      bbox.width += 2;
      bbox.height += 1;
      block.svgGroup_.getBBox = () => bbox;
      if (block.startHat_) {
        options.top = -22;
        options.left = -1;
        bbox.height += 5;
      }
      saveSvgAsPng(block.svgGroup_, nanoid(), options);
    },
  };
  // 多个积木
  if (block.getNextBlock()) {
    exportPngOption.text = translate('blocks.centextMenu.exportBlocksPng', 'Export Blocks to PNG');
  }
  return exportPngOption;
};

// 给工作区添加导出积木图片菜单项
const showContextMenu = ScratchBlocks.ContextMenu.show;
ScratchBlocks.ContextMenu.show = function (e, options, rtl) {
  // 只给工作区添加导出菜单
  let isWorkspace = false;
  for (const item of options) {
    if (item.text === ScratchBlocks.Msg.UNDO) {
      isWorkspace = true;
      break;
    }
  }
  if (isWorkspace) {
    const exportPngOption = {
      enabled: true,
      text: translate('blocks.centextMenu.exportAllBlocksPng', 'Export all Blocks to PNG'),
      callback() {
        const workspace = ScratchBlocks.getMainWorkspace();
        const canvas = workspace.getCanvas();
        if (canvas) {
          saveSvgAsPng(canvas, nanoid());
        }
      },
    };
    options.splice(-1, 0, exportPngOption);
  }

  showContextMenu(e, options, rtl);
};
