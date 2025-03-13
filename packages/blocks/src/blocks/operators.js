import { ScratchBlocks } from '../lib/scratch-blocks';

// >=
ScratchBlocks.Blocks['operator_gte'] = {
  init() {
    this.jsonInit({
      message0: ScratchBlocks.Msg.OPERATORS_GTE,
      args0: [
        {
          type: 'input_value',
          name: 'OPERAND1',
        },
        {
          type: 'input_value',
          name: 'OPERAND2',
        },
      ],
      category: ScratchBlocks.Categories.operators,
      extensions: ['colours_operators', 'output_boolean'],
    });
  },
};

// <=
ScratchBlocks.Blocks['operator_lte'] = {
  init() {
    this.jsonInit({
      message0: ScratchBlocks.Msg.OPERATORS_LTE,
      args0: [
        {
          type: 'input_value',
          name: 'OPERAND1',
        },
        {
          type: 'input_value',
          name: 'OPERAND2',
        },
      ],
      category: ScratchBlocks.Categories.operators,
      extensions: ['colours_operators', 'output_boolean'],
    });
  },
};

// !=
ScratchBlocks.Blocks['operator_notequals'] = {
  init() {
    this.jsonInit({
      message0: ScratchBlocks.Msg.OPERATORS_NOTEQUALS,
      args0: [
        {
          type: 'input_value',
          name: 'OPERAND1',
        },
        {
          type: 'input_value',
          name: 'OPERAND2',
        },
      ],
      category: ScratchBlocks.Categories.operators,
      extensions: ['colours_operators', 'output_boolean'],
    });
  },
};
