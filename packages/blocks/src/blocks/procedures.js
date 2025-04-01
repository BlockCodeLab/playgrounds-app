import { ScratchBlocks } from '../lib/scratch-blocks';

ScratchBlocks.Blocks['procedures_declaration'].addLabelExternal = function () {
  ScratchBlocks.WidgetDiv.hide(true);
  this.procCode_ = this.procCode_ + ScratchBlocks.Msg.PROCEDURES_ADD_LABEL;
  this.updateDisplay_();
  this.focusLastEditor_();
};

ScratchBlocks.Blocks['procedures_declaration'].addBooleanExternal = function () {
  ScratchBlocks.WidgetDiv.hide(true);
  this.procCode_ = this.procCode_ + ' %b';
  this.displayNames_.push(ScratchBlocks.Msg.PROCEDURES_ADD_BOOLEAN);
  this.argumentIds_.push(ScratchBlocks.utils.genUid());
  this.argumentDefaults_.push('false');
  this.updateDisplay_();
  this.focusLastEditor_();
};

ScratchBlocks.Blocks['procedures_declaration'].addStringNumberExternal = function () {
  ScratchBlocks.WidgetDiv.hide(true);
  this.procCode_ = this.procCode_ + ' %s';
  this.displayNames_.push(ScratchBlocks.Msg.PROCEDURES_ADD_STRING_NUMBER);
  this.argumentIds_.push(ScratchBlocks.utils.genUid());
  this.argumentDefaults_.push('');
  this.updateDisplay_();
  this.focusLastEditor_();
};

ScratchBlocks.Blocks['procedures_declaration'].addStringExternal = function () {
  ScratchBlocks.WidgetDiv.hide(true);
  this.procCode_ = this.procCode_ + ' %s';
  this.displayNames_.push(ScratchBlocks.Msg.PROCEDURES_ADD_STRING);
  this.argumentIds_.push(ScratchBlocks.utils.genUid());
  this.argumentDefaults_.push('');
  this.updateDisplay_();
  this.focusLastEditor_();
};

ScratchBlocks.Blocks['procedures_declaration'].addNumberExternal = function () {
  ScratchBlocks.WidgetDiv.hide(true);
  this.procCode_ = this.procCode_ + ' %n';
  this.displayNames_.push(ScratchBlocks.Msg.PROCEDURES_ADD_NUMBER);
  this.argumentIds_.push(ScratchBlocks.utils.genUid());
  this.argumentDefaults_.push(0);
  this.updateDisplay_();
  this.focusLastEditor_();
};

ScratchBlocks.Blocks['procedures_declaration'].onChangeFn = function () {
  this.procCode_ = '';
  this.displayNames_ = [];
  this.argumentIds_ = [];
  for (let i = 0; i < this.inputList.length; i++) {
    if (i != 0) {
      this.procCode_ += ' ';
    }
    const input = this.inputList[i];
    if (input.type == ScratchBlocks.DUMMY_INPUT) {
      this.procCode_ += input.fieldRow[0].getValue();
    } else if (input.type == ScratchBlocks.INPUT_VALUE) {
      // Inspect the argument editor.
      const target = input.connection.targetBlock();
      this.displayNames_.push(target.getFieldValue('TEXT'));
      this.argumentIds_.push(input.name);
      if (target.type == 'argument_editor_boolean') {
        this.procCode_ += '%b';
      } else if (target.type == 'argument_editor_number') {
        this.procCode_ += '%n';
      } else {
        this.procCode_ += '%s';
      }
    } else {
      throw new Error('Unexpected input type on a procedure mutator root: ' + input.type);
    }
  }
};

ScratchBlocks.Blocks['procedures_declaration'].createArgumentEditor_ = function (argumentType, displayName) {
  ScratchBlocks.Events.disable();
  let newBlock;
  try {
    newBlock = this.workspace.newBlock('argument_editor_string_number');
    if (argumentType == 'b') {
      newBlock = this.workspace.newBlock('argument_editor_boolean');
    } else if (argumentType == 'n') {
      newBlock = this.workspace.newBlock('argument_editor_number');
    }
    newBlock.setFieldValue(displayName, 'TEXT');
    newBlock.setShadow(true);
    if (!this.isInsertionMarker()) {
      newBlock.initSvg();
      newBlock.render(false);
    }
  } finally {
    ScratchBlocks.Events.enable();
  }
  if (newBlock && ScratchBlocks.Events.isEnabled()) {
    ScratchBlocks.Events.fire(new ScratchBlocks.Events.BlockCreate(newBlock));
  }
  return newBlock;
};

ScratchBlocks.Blocks['procedures_prototype'].createArgumentReporter_ = function (argumentType, displayName) {
  let blockType = 'argument_reporter_string_number';
  if (argumentType == 'b') {
    blockType = 'argument_reporter_boolean';
  } else if (argumentType == 'n') {
    blockType = 'argument_reporter_number';
  }
  ScratchBlocks.Events.disable();
  let newBlock;
  try {
    newBlock = this.workspace.newBlock(blockType);
    newBlock.setShadow(true);
    newBlock.setFieldValue(displayName, 'VALUE');
    if (!this.isInsertionMarker()) {
      newBlock.initSvg();
      newBlock.render(false);
    }
  } finally {
    ScratchBlocks.Events.enable();
  }
  if (newBlock && ScratchBlocks.Events.isEnabled()) {
    ScratchBlocks.Events.fire(new ScratchBlocks.Events.BlockCreate(newBlock));
  }
  return newBlock;
};

ScratchBlocks.Blocks['procedures_prototype'].updateArgumentReporterNames_ = function (prevArgIds, prevDisplayNames) {
  const nameChanges = [];
  const argReporters = [];
  const definitionBlock = this.getParent();
  if (!definitionBlock) return;

  // Create a list of argument reporters that are descendants of the definition stack (see above comment)
  const allBlocks = definitionBlock.getDescendants(false);
  for (let i = 0; i < allBlocks.length; i++) {
    const block = allBlocks[i];
    if (
      (block.type === 'argument_reporter_string_number' ||
        block.type === 'argument_reporter_number' ||
        block.type === 'argument_reporter_boolean') &&
      !block.isShadow()
    ) {
      // Exclude arg reporters in the prototype block, which are shadows.
      argReporters.push(block);
    }
  }

  // Create a list of "name changes", including the new name and blocks matching the old name
  // Only search over the current set of argument ids, ignore args that have been removed
  for (let i = 0, id; (id = this.argumentIds_[i]); i++) {
    // Find the previous index of this argument id. Could be -1 if it is newly added.
    const prevIndex = prevArgIds.indexOf(id);
    if (prevIndex == -1) continue; // Newly added argument, no corresponding previous argument to update.
    const prevName = prevDisplayNames[prevIndex];
    if (prevName != this.displayNames_[i]) {
      nameChanges.push({
        newName: this.displayNames_[i],
        blocks: argReporters.filter(function (block) {
          return block.getFieldValue('VALUE') == prevName;
        }),
      });
    }
  }

  // Finally update the blocks for each name change.
  // Do this after creating the lists to avoid cycles of renaming.
  for (let j = 0, nameChange; (nameChange = nameChanges[j]); j++) {
    for (let k = 0, block; (block = nameChange.blocks[k]); k++) {
      block.setFieldValue(nameChange.newName, 'VALUE');
    }
  }
};

ScratchBlocks.ScratchBlocks.ProcedureUtils.checkOldTypeMatches_ = function (oldBlock, type) {
  if (!oldBlock) {
    return false;
  }
  if (type == 'n' && oldBlock.type == 'argument_reporter_number') {
    return true;
  }
  if ((type == 'n' || type == 's') && oldBlock.type == 'argument_reporter_string_number') {
    return true;
  }
  if (type == 'b' && oldBlock.type == 'argument_reporter_boolean') {
    return true;
  }
  return false;
};
