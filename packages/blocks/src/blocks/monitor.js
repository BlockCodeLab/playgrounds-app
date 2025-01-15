import { ScratchBlocks } from '../lib/scratch-blocks';

// 调试输出
ScratchBlocks.Blocks['monitor_debug'] = {
  init() {
    this.jsonInit({
      message0: 'debug %1',
      args0: [
        {
          type: 'input_value',
          name: 'VALUE',
        },
      ],
      category: 'monitor',
      extensions: ['colours_monitor', 'shape_statement'],
    });
  },
};

// 监视值
ScratchBlocks.Blocks['monitor_showvalue'] = {
  init() {
    this.jsonInit({
      message0: ScratchBlocks.Msg.MONITOR_SHOWVALUE,
      args0: [
        {
          type: 'input_value',
          name: 'VALUE',
        },
      ],
      category: 'monitor',
      extensions: ['colours_monitor', 'shape_statement'],
    });
  },
};

// 监视命名值
ScratchBlocks.Blocks['monitor_shownamedvalue'] = {
  init() {
    this.jsonInit({
      message0: ScratchBlocks.Msg.MONITOR_SHOWNAMEDVALUE,
      args0: [
        {
          type: 'input_value',
          name: 'VALUE',
        },
        {
          type: 'input_value',
          name: 'LABEL',
        },
      ],
      category: 'monitor',
      extensions: ['colours_monitor', 'shape_statement'],
    });
  },
};
