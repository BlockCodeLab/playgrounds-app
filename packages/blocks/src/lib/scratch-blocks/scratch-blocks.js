import { importModuleExport } from '../import-module-export' with { type: 'macro' };

const module = {};
const code = importModuleExport('scratch-blocks/dist/vertical');
new Function('module', code)(module);
export const ScratchBlocks = module.exports;

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

// 将所有积木对应的转换函数绑定到 this
const generatorInit = ScratchBlocks.Generator.prototype.init;
ScratchBlocks.Generator.prototype.init = function (workspace) {
  for (const key in this) {
    if (typeof this[key] === 'function' && !ScratchBlocks.Generator.prototype[key]) {
      this[key] = this[key].bind(this);
    }
  }
  generatorInit.call(this, workspace);
};

// 禁用显示/隐藏变量/列表的积木
ScratchBlocks.DataCategory.addShowVariable = () => { };
ScratchBlocks.DataCategory.addHideVariable = () => { };
ScratchBlocks.DataCategory.addShowList = () => { };
ScratchBlocks.DataCategory.addHideList = () => { };

// 备份所有变量/列表积木
// 用于在C语言替换默认积木后的还原
const DataCategoryFunctions = {};
for (const key in ScratchBlocks.DataCategory) {
  if (key.startsWith('add')) {
    DataCategoryFunctions[key] = ScratchBlocks.DataCategory[key];
  }
}

// 还原初始积木
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
