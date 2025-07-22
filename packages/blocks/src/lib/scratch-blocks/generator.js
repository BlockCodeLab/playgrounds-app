import { ScratchBlocks } from './scratch-blocks';

const BaseGenerator = ScratchBlocks.Generator;

class Generator extends BaseGenerator {
  blockToCode(block) {
    if (this.check_(block)) {
      return super.blockToCode(block);
    }
    return '';
  }

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

    if (!this.variableDB_) {
      this.variableDB_ = new ScratchBlocks.Names(this.RESERVED_WORDS_);
    } else {
      this.variableDB_.reset();
    }

    this.variableDB_.setVariableMap(workspace.getVariableMap());
  }

  addLoopTrap(branch, id) {
    id = id.replace(/\$/g, '$$$$');
    if (this.INFINITE_LOOP_TRAP && !branch) {
      branch = this.prefixLines(this.INFINITE_LOOP_TRAP.replace(/%1/g, "'" + id + "'"), this.INDENT) + branch;
    }
    if (this.STATEMENT_PREFIX) {
      branch += this.prefixLines(branch, this.INDENT);
    }
    return branch;
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

  check_(block) {
    return !!block;
  }

  getVariableName(desiredName) {
    const variableName = this.variableDB_.getName(desiredName, ScratchBlocks.Variables.NAME_TYPE);
    return `_${variableName.replaceAll('_', '')}`;
  }

  getFunctionName(desiredName) {
    const functionName = this.variableDB_.getName(desiredName, ScratchBlocks.Procedures.NAME_TYPE);
    return `_${functionName.replaceAll('_25', '').replaceAll('_', '')}`;
  }
}

ScratchBlocks.Generator = Generator;
