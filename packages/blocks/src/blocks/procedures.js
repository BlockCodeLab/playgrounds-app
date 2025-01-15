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
