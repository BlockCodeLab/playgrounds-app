import { ScratchBlocks } from './scratch-blocks';

// 纯数字参数
ScratchBlocks.Blocks['argument_reporter_number'] = {
  init() {
    this.jsonInit({
      message0: ' %1',
      args0: [
        {
          type: 'field_label_serializable',
          name: 'VALUE',
          text: '',
        },
      ],
      extensions: ['colours_more', 'output_number'],
    });
  },
};

// 纯数字参数（可编辑）
ScratchBlocks.Blocks['argument_editor_number'] = {
  init() {
    this.jsonInit({
      message0: ' %1',
      args0: [
        {
          type: 'field_input_removable',
          name: 'TEXT',
          text: 'foo',
        },
      ],
      colour: ScratchBlocks.Colours.textField,
      colourSecondary: ScratchBlocks.Colours.textField,
      colourTertiary: ScratchBlocks.Colours.textField,
      colourQuaternary: ScratchBlocks.Colours.textField,
      extensions: ['output_number'],
    });
  },
  // Exist on declaration and arguments editors, with different implementations.
  removeFieldCallback: ScratchBlocks.ScratchBlocks.ProcedureUtils.removeArgumentCallback_,
};

ScratchBlocks.scratchBlocksUtils.isShadowArgumentReporter = function (block) {
  return (
    block.isShadow() &&
    (block.type == 'argument_reporter_boolean' ||
      block.type == 'argument_reporter_string_number' ||
      block.type == 'argument_reporter_number' ||
      block.type == 'argument_reporter_string')
  );
};
