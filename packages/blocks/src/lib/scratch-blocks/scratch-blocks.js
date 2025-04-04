import { importModuleExport } from '../import-module-export' with { type: 'macro' };
import { saveSvgAsPng, nanoid } from '@blockcode/utils';
import { translate } from '@blockcode/core';

const module = {};
const code = importModuleExport('scratch-blocks/dist/vertical');
new Function('module', code)(module);
export const ScratchBlocks = module.exports;

// 添加字典类型变量类型
ScratchBlocks.DICTIONARY_VARIABLE_TYPE = 'dictionary';

// 禁用积木前的选项框
ScratchBlocks.Block.prototype.setCheckboxInFlyout = function (hasCheckbox) {
  this.checkboxInFlyout_ = false;
};

// 注册监测积木颜色
ScratchBlocks.Colours.monitor = {
  primary: '#855CD6',
  secondary: '#7547D1',
  tertiary: '#7547D1',
  quaternary: '#7547D1',
};
ScratchBlocks.Extensions.register(
  'colours_monitor',
  ScratchBlocks.ScratchBlocks.VerticalExtensions.colourHelper('monitor'),
);

// 备份变量列表自动添加的积木
// 有些情况下会改变这些积木
const DataCategoryFunctions = {};
for (const key in ScratchBlocks.DataCategory) {
  if (key.startsWith('add')) {
    DataCategoryFunctions[key] = ScratchBlocks.DataCategory[key];
  }
}

// 每次重新创建工作区，还原备份的初始积木
ScratchBlocks.restoreBlocks = () => {
  for (const key in ScratchBlocks.Blocks) {
    if (key[0] === '#') {
      ScratchBlocks.Blocks[key.slice(1)] = ScratchBlocks.Blocks[key];
    }
  }
  for (const key in DataCategoryFunctions) {
    ScratchBlocks.DataCategory[key] = DataCategoryFunctions[key];
  }
};

// 将为积木添加注释的菜单项改为导出积木图片
ScratchBlocks.ContextMenu.blockCommentOption = function (block) {
  const exportPngOption = {
    enabled: true,
    text: translate('blocks.centextMenu.exportPng', 'Export to PNG'),
    callback() {
      const options = {};
      const bbox = block.svgGroup_.getBBox();
      // 修复帽子积木被裁剪掉帽子
      bbox.y = 0;
      bbox.width += 2;
      bbox.height += 1;
      block.svgGroup_.getBBox = () => bbox;
      if (block.startHat_) {
        options.top = -17;
        options.left = -1;
      }
      saveSvgAsPng(block.svgGroup_, nanoid(), options);
    },
  };
  return exportPngOption;
};

// 给工作区添加导出积木图片菜单项
const showContextMenu = ScratchBlocks.ContextMenu.show;
ScratchBlocks.ContextMenu.show = function (e, options, rtl) {
  const exportText = translate('blocks.centextMenu.exportPng', 'Export to PNG');
  let hasExport = false;
  for (const item of options) {
    if (item.text === exportText) {
      hasExport = true;
    }
  }

  // 添加导出菜单
  if (!hasExport) {
    const exportPngOption = {
      enabled: true,
      text: exportText,
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
