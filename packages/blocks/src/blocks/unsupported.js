import { ScratchBlocks } from '../lib/scratch-blocks';

ScratchBlocks.Blocks['unsupported_hat'] = {
  init() {
    this.jsonInit({
      message0: ScratchBlocks.Msg.UNSUPPORTED,
      extensions: ['colours_more', 'shape_hat'],
    });
  },
};

ScratchBlocks.Blocks['unsupported_statement'] = {
  init() {
    this.jsonInit({
      message0: ScratchBlocks.Msg.UNSUPPORTED,
      extensions: ['colours_more', 'shape_statement'],
    });
  },
};

ScratchBlocks.Blocks['unsupported_boolean'] = {
  init() {
    this.jsonInit({
      message0: ScratchBlocks.Msg.UNSUPPORTED,
      extensions: ['colours_more', 'output_boolean'],
    });
  },
};

ScratchBlocks.Blocks['unsupported_string'] = {
  init() {
    this.jsonInit({
      message0: ScratchBlocks.Msg.UNSUPPORTED,
      extensions: ['colours_more', 'output_string'],
    });
  },
};

ScratchBlocks.Blocks['unsupported_number'] = {
  init() {
    this.jsonInit({
      message0: ScratchBlocks.Msg.UNSUPPORTED,
      extensions: ['colours_more', 'output_number'],
    });
  },
};
