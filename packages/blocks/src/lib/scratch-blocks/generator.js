import { ScratchBlocks } from './scratch-blocks';

const BaseGenerator = ScratchBlocks.Generator;

class Generator extends BaseGenerator {
  init(workspace) {
    // 将所有积木对应的转换函数绑定到 this
    for (const key in this) {
      if (typeof this[key] === 'function' && !BaseGenerator.prototype[key]) {
        this[key] = this[key].bind(this);
      }
    }

    // Create a dictionary of definitions to be printed before the code.
    this.definitions_ = Object.create(null);
    // Create a dictionary mapping desired function names in definitions_
    // to actual function names (to avoid collisions with user functions).
    this.functionNames_ = Object.create(null);

    if (!this.nameDB_) {
      this.nameDB_ = new ScratchBlocks.Names(this.RESERVED_WORDS_);
    } else {
      this.nameDB_.reset();
    }

    this.nameDB_.setVariableMap(workspace.getVariableMap());
  }

  statementToCode(block, name) {
    // 帽子（事件）函数没有input，所以用statementToCode时无法提供
    // 所以用nextConnection的targetBlock
    const targetBlock = name ? block.getInputTargetBlock(name) : block.nextConnection?.targetBlock();
    let code = this.blockToCode(targetBlock);
    if (code) {
      code = this.prefixLines(code, this.INDENT);
    }
    return code;
  }

  getVariableName(name, type = ScratchBlocks.Variables.NAME_TYPE) {
    const varName = this.nameDB_.getName(name, type);
    return varName;
  }
}

ScratchBlocks.Generator = Generator;
