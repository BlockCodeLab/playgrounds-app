import { importWebpackExport } from './import-webpack-export' with { type: 'macro' };

const module = {};
const code = importWebpackExport('scratch-blocks/dist/vertical');
new Function('module', code)(module);
export const ScratchBlocks = module.exports;

// 禁用积木前的选项框
ScratchBlocks.Block.prototype.setCheckboxInFlyout = function (hasCheckbox) {
  this.checkboxInFlyout_ = false;
};

// 禁用显示/隐藏变量/列表的积木
ScratchBlocks.DataCategory.addShowVariable = () => {};
ScratchBlocks.DataCategory.addHideVariable = () => {};
ScratchBlocks.DataCategory.addShowList = () => {};
ScratchBlocks.DataCategory.addHideList = () => {};

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
