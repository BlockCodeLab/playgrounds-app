import { importModuleExport } from '../import-module-export' with { type: 'macro' };

const module = {};
const code = importModuleExport('scratch-blocks/dist/vertical');
new Function('module', code)(module);
export const ScratchBlocks = module.exports;

// 添加字典类型变量类型
ScratchBlocks.DICTIONARY_VARIABLE_TYPE = 'dictionary';

// 限制积木前的选项框
ScratchBlocks.Block.visibleCheckboxInFlyout_ = false; // 默认不可显示
ScratchBlocks.Block.prototype.setCheckboxInFlyout = function (hasCheckbox) {
  this.checkboxInFlyout_ = ScratchBlocks.Block.visibleCheckboxInFlyout_ && hasCheckbox;
};

// 点击选项框
ScratchBlocks.VerticalFlyout.prototype.checkboxClicked_ = function (checkboxObj) {
  return function (e) {
    ScratchBlocks.mainWorkspace.fireChangeListener(
      new ScratchBlocks.Events.Ui(checkboxObj.block, 'checkboxclick', checkboxObj.clicked, !checkboxObj.clicked),
    );
    this.setCheckboxState(checkboxObj.block.id, !checkboxObj.clicked);
    e.stopPropagation();
    e.preventDefault();
  }.bind(this);
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
export const DataCategoryFunctions = {};
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
  ScratchBlocks.Block.visibleCheckboxInFlyout_ = false;
  ScratchBlocks.DataCategory.enableShowOrHideVariable_ = false;
  ScratchBlocks.DataCategory.enableShowOrHideList_ = false;
};
