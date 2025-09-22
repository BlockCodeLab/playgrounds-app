import { translate } from '@blockcode/core';
import { ScratchBlocks, DataCategoryFunctions } from './scratch-blocks';

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
  'data_listcontents',
  'data_variable',
];

// 限制显示/隐藏变量/列表的积木
ScratchBlocks.DataCategory.enableShowOrHideVariable_ = false;
ScratchBlocks.DataCategory.enableShowOrHideList_ = false;
DataCategoryFunctions.addShowVariable = (xmlList, variable) => {
  if (ScratchBlocks.DataCategory.enableShowOrHideVariable_) {
    ScratchBlocks.DataCategory.addBlock(xmlList, variable, 'data_showvariable', 'VARIABLE');
  }
};
DataCategoryFunctions.addHideVariable = (xmlList, variable) => {
  if (ScratchBlocks.DataCategory.enableShowOrHideVariable_) {
    ScratchBlocks.DataCategory.addBlock(xmlList, variable, 'data_hidevariable', 'VARIABLE');
  }
};
DataCategoryFunctions.addShowList = (xmlList, variable) => {
  if (ScratchBlocks.DataCategory.enableShowOrHideList_) {
    ScratchBlocks.DataCategory.addBlock(xmlList, variable, 'data_showlist', 'LIST');
  }
};
DataCategoryFunctions.addHideList = (xmlList, variable) => {
  if (ScratchBlocks.DataCategory.enableShowOrHideList_) {
    ScratchBlocks.DataCategory.addBlock(xmlList, variable, 'data_hidelist', 'LIST');
  }
};
ScratchBlocks.restoreBlocks();

// 将列表名字居中
ScratchBlocks.Blocks['data_listcontents'] = {
  init() {
    this.jsonInit({
      message0: '%1',
      lastDummyAlign0: 'CENTRE',
      args0: [
        {
          type: 'field_variable_getter',
          text: '',
          name: 'LIST',
          variableType: ScratchBlocks.LIST_VARIABLE_TYPE,
        },
      ],
      category: ScratchBlocks.Categories.dataLists,
      extensions: ['contextMenu_getListBlock', 'colours_data_lists', 'output_string'],
    });
  },
};

// 备份设置变量/列表的积木
for (const key of DATA_BLOCKS) {
  ScratchBlocks.Blocks[`#${key}`] = ScratchBlocks.Blocks[key];
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
