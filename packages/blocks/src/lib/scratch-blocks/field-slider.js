import { ScratchBlocks } from './scratch-blocks';

/**
 * Class for an number slider field.
 * @param {string|number=} opt_value The initial value of the field. Should
 *    cast to a number. Defaults to 0.
 * @param {?(string|number)=} opt_min Minimum value.
 * @param {?(string|number)=} opt_max Maximum value.
 * @param {?(string|number)=} opt_precision Precision for value.
 * @param {?Function=} opt_validator A function that is called to validate
 *    changes to the field's value. Takes in a number & returns a validated
 *    number, or null to abort the change.
 * @extends {ScratchBlocks.FieldNumber}
 * @constructor
 */
class FieldSlider extends ScratchBlocks.FieldNumber {
  constructor(opt_value, opt_min, opt_max, opt_precision, opt_validator) {
    super(opt_value, opt_min, opt_max, opt_precision, opt_validator);
    this.addArgType('slider');

    this.min_ = opt_min;
    this.max_ = opt_max;
    this.precision_ = opt_precision;

    /**
     * Array holding info needed to unbind events.
     * Used for disposing.
     * Ex: [[node, name, func], [node, name, func]].
     * @type {!Array.<Array<?>>}
     * @private
     */
    this.boundEvents_ = [];

    /**
     * The HTML range input element.
     * @type {?HTMLInputElement}
     * @private
     */
    this.sliderInput_ = null;
  }

  /**
   * Constructs a FieldSlider from a JSON arg object.
   * @param {!Object} options A JSON object with options (value, min, max, and
   *                          precision).
   * @return {!FieldSlider} The new field instance.
   * @package
   */
  static fromJson(options) {
    return new FieldSlider(options.value, options.min, options.max, options.precision);
  }

  /**
   * Clean up this FieldSlider, as well as the inherited FieldTextInput.
   * @return {!Function} Closure to call on destruction of the WidgetDiv.
   * @private
   */
  dispose_() {
    return function () {
      for (var event in this.boundEvents_) {
        ScratchBlocks.unbindEvent_(event);
      }
      this.sliderInput_ = null;
    };
  }

  /**
   * Show the inline free-text editor on top of the text along with the slider
   *    editor.
   * @protected
   * @override
   */
  showEditor_() {
    super.showEditor_();

    // Build the DOM.
    var editor = document.createElement('div');
    editor.className = 'scratchSliderDiv';
    var sliderInput = document.createElement('input');
    sliderInput.setAttribute('type', 'range');
    sliderInput.setAttribute('min', this.min_);
    sliderInput.setAttribute('max', this.max_);
    sliderInput.setAttribute('step', this.precision_);
    sliderInput.setAttribute('value', this.getValue());
    sliderInput.className = 'scratchFieldSlider';
    sliderInput.style.setProperty('--trackColor', this.sourceBlock_.parentBlock_.getColourTertiary());
    editor.appendChild(sliderInput);
    this.sliderInput_ = sliderInput;

    ScratchBlocks.DropDownDiv.getContentDiv().appendChild(editor);
    ScratchBlocks.DropDownDiv.setColour(
      this.sourceBlock_.parentBlock_.getColour(),
      this.sourceBlock_.getColourTertiary(),
    );
    ScratchBlocks.DropDownDiv.setCategory(this.sourceBlock_.parentBlock_.getCategory());
    ScratchBlocks.DropDownDiv.showPositionedByBlock(this, this.sourceBlock_);

    this.boundEvents_.push(ScratchBlocks.bindEvent_(sliderInput, 'input', this, this.onSliderChange_));

    this.boundEvents_.push(
      ScratchBlocks.bindEventWithChecks_(ScratchBlocks.FieldTextInput.htmlInput_, 'keyup', this, this.updateSlider_),
    );

    this.boundEvents_.push(
      ScratchBlocks.bindEventWithChecks_(ScratchBlocks.FieldTextInput.htmlInput_, 'keypress', this, this.updateSlider_),
    );
  }

  /**
   * Sets the text to match the slider's position.
   * @private
   */
  onSliderChange_() {
    ScratchBlocks.FieldTextInput.htmlInput_.value = this.sliderInput_.value;
    this.setValue(this.sliderInput_.value);
    this.validate_();
    this.resizeEditor_();
  }

  /**
   * Updates the slider when the field rerenders.
   * @private
   */
  updateSlider_() {
    if (!this.sliderInput_) {
      return;
    }
    this.sliderInput_.setAttribute('value', this.getValue());
  }
}

ScratchBlocks.FieldSlider = FieldSlider;
ScratchBlocks.Field.register('field_slider', ScratchBlocks.FieldSlider);
