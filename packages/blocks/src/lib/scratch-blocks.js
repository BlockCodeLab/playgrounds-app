import { importModuleExport } from './import-module-export' with { type: 'macro' };
import { translate } from '@blockcode/core';

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
ScratchBlocks.DataCategory.addShowVariable = () => {};
ScratchBlocks.DataCategory.addHideVariable = () => {};
ScratchBlocks.DataCategory.addShowList = () => {};
ScratchBlocks.DataCategory.addHideList = () => {};

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

// 静态类型变量/列表积木
const DATA_BLOCKS = [
  'data_setvariableto',
  'data_changevariableby',
  'data_addtolist',
  'data_deleteoflist',
  'data_deletealloflist',
  'data_insertatlist',
  'data_replaceitemoflist',
  'data_itemoflist',
  'data_itemnumoflist',
  'data_lengthoflist',
  'data_listcontainsitem',
];
// 备份设置变量/列表的积木
for (const key of DATA_BLOCKS) {
  ScratchBlocks.Blocks[`${key}`] = ScratchBlocks.Blocks[key];
}
// 设置强类型变量声明积木
ScratchBlocks.setDataCategoryForTyped = (typeOptions) => {
  // 禁用变量/列表的部分的积木
  ScratchBlocks.DataCategory.addAddToList = () => {};
  ScratchBlocks.DataCategory.addDeleteOfList = () => {};
  ScratchBlocks.DataCategory.addDeleteAllOfList = () => {};
  // ScratchBlocks.DataCategory.addInsertAtList = () => {};
  // ScratchBlocks.DataCategory.addReplaceItemOfList = () => {};
  // ScratchBlocks.DataCategory.addItemOfList = () => {};
  ScratchBlocks.DataCategory.addItemNumberOfList = () => {};
  // ScratchBlocks.DataCategory.addLengthOfList = () => {};
  ScratchBlocks.DataCategory.addListContainsItem = () => {};

  // 声明变量
  ScratchBlocks.Blocks['data_setvariableto'] = {
    init() {
      this.jsonInit({
        message0: translate('blocks.dataCategory.dataType', 'declare %1 type to %2'),
        args0: [
          {
            type: 'field_variable',
            name: 'VARIABLE',
          },
          {
            type: 'field_dropdown',
            name: 'TYPE',
            options: typeOptions.map((type) => {
              if (typeof type === 'string') {
                return [type, type];
              }
              return type;
            }),
          },
        ],
        category: ScratchBlocks.Categories.data,
        extensions: ['colours_data', 'shape_statement'],
      });
    },
  };

  // 设置变量
  ScratchBlocks.Blocks['data_changevariableby'] = {
    init() {
      this.jsonInit({
        message0: ScratchBlocks.Msg.DATA_SETVARIABLETO,
        args0: [
          {
            type: 'field_variable',
            name: 'VARIABLE',
          },
          {
            type: 'input_value',
            name: 'VALUE',
          },
        ],
        category: ScratchBlocks.Categories.data,
        extensions: ['colours_data', 'shape_statement'],
      });
    },
  };

  // 声明数组
  ScratchBlocks.Blocks['data_insertatlist'] = {
    init: function () {
      this.jsonInit({
        message0: translate('blocks.dataCategory.arrayType', 'declare %3 type to %1 and size to %2'),
        args0: [
          {
            type: 'field_dropdown',
            name: 'TYPE',
            options: typeOptions.map((type) => {
              if (typeof type === 'string') {
                return [type, type];
              }
              return type;
            }),
          },
          {
            type: 'input_value',
            name: 'INDEX',
          },
          {
            type: 'field_variable',
            name: 'LIST',
            variableTypes: [ScratchBlocks.LIST_VARIABLE_TYPE],
          },
        ],
        category: ScratchBlocks.Categories.dataLists,
        extensions: ['colours_data_lists', 'shape_statement'],
      });
    },
  };

  // 设置数组项
  ScratchBlocks.Blocks['data_replaceitemoflist'] = {
    init: function () {
      this.jsonInit({
        message0: translate('blocks.dataCategory.arraySetItem', 'set index %1 of %2 to %3'),
        args0: [
          {
            type: 'input_value',
            name: 'INDEX',
            defaultValue: 5,
          },
          {
            type: 'field_variable',
            name: 'LIST',
            variableTypes: [ScratchBlocks.LIST_VARIABLE_TYPE],
          },
          {
            type: 'input_value',
            name: 'ITEM',
          },
        ],
        category: ScratchBlocks.Categories.dataLists,
        extensions: ['colours_data_lists', 'shape_statement'],
      });
    },
  };

  // 获取数组项
  ScratchBlocks.Blocks['data_itemoflist'] = {
    init: function () {
      this.jsonInit({
        message0: translate('blocks.dataCategory.arrayItem', 'index %1 of %2'),
        args0: [
          {
            type: 'input_value',
            name: 'INDEX',
          },
          {
            type: 'field_variable',
            name: 'LIST',
            variableTypes: [ScratchBlocks.LIST_VARIABLE_TYPE],
          },
        ],
        output: null,
        category: ScratchBlocks.Categories.dataLists,
        extensions: ['colours_data_lists'],
        outputShape: ScratchBlocks.OUTPUT_SHAPE_ROUND,
      });
    },
  };
};
