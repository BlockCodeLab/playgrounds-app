import { MathUtils } from '@blockcode/utils';
import { ScratchBlocks } from './scratch-blocks';

const BaseFieldMatrix = ScratchBlocks.FieldMatrix;

const MIN_WIDTH = 3;
const MIN_HEIGHT = 3;
const MAX_WIDTH = 18;
const MAX_HEIGHT = 9;
const DEFAULT_WIDTH = 5;
const DEFAULT_HEIGHT = 5;

class FieldMatrix extends BaseFieldMatrix {
  constructor(matrix, opt_width = DEFAULT_WIDTH, opt_height = DEFAULT_HEIGHT) {
    super(matrix);
    this.width_ = MathUtils.clamp(opt_width, MIN_WIDTH, MAX_WIDTH);
    this.height_ = MathUtils.clamp(opt_height, MIN_HEIGHT, MAX_HEIGHT);

    this.zeros_ = '0'.repeat(this.height_ * this.width_);
    this.ones_ = '1'.repeat(this.height_ * this.width_);
    this.matrix_ = this.zeros_;

    // 根据宽高计算缩略图宽度
    const nodeSize = (ScratchBlocks.FieldMatrix.THUMBNAIL_NODE_SIZE * 5) / this.height_;
    const nodePad = (ScratchBlocks.FieldMatrix.THUMBNAIL_NODE_PAD * 4) / (this.height_ - 1);
    this.thumbnailWidth_ = (nodeSize + nodePad) * this.width_;
  }

  static fromJson(options) {
    return new FieldMatrix(options.matrix, options.width, options.height);
  }

  init() {
    if (this.fieldGroup_) {
      // Matrix menu has already been initialized once.
      return;
    }

    // Build the DOM.
    this.fieldGroup_ = ScratchBlocks.utils.createSvgElement('g', {}, null);

    const nodeSize = (ScratchBlocks.FieldMatrix.THUMBNAIL_NODE_SIZE * 5) / this.height_;
    this.size_.width =
      this.thumbnailWidth_ + ScratchBlocks.FieldMatrix.ARROW_SIZE + ScratchBlocks.BlockSvg.DROPDOWN_ARROW_PADDING * 1.5;

    this.sourceBlock_.getSvgRoot().appendChild(this.fieldGroup_);

    const thumbX = ScratchBlocks.BlockSvg.DROPDOWN_ARROW_PADDING / 2;
    const thumbY = (this.size_.height - ScratchBlocks.FieldMatrix.THUMBNAIL_SIZE) / 2;
    const thumbnail = ScratchBlocks.utils.createSvgElement(
      'g',
      {
        transform: `translate(${thumbX}, ${thumbY})`,
        'pointer-events': 'bounding-box',
        cursor: 'pointer',
      },
      this.fieldGroup_,
    );
    this.ledThumbNodes_ = [];
    const nodePad = (ScratchBlocks.FieldMatrix.THUMBNAIL_NODE_PAD * 4) / (this.height_ - 1);
    for (let i = 0; i < this.height_; i++) {
      for (let n = 0; n < this.width_; n++) {
        const attr = {
          x: (nodeSize + nodePad) * n + nodePad,
          y: (nodeSize + nodePad) * i + nodePad,
          width: nodeSize,
          height: nodeSize,
          rx: nodePad,
          ry: nodePad,
        };
        this.ledThumbNodes_.push(ScratchBlocks.utils.createSvgElement('rect', attr, thumbnail));
      }
      thumbnail.style.cursor = 'default';
      this.updateMatrix_();
    }

    if (!this.arrow_) {
      const arrowX = this.thumbnailWidth_ + ScratchBlocks.BlockSvg.DROPDOWN_ARROW_PADDING * 1.5;
      const arrowY = (this.size_.height - ScratchBlocks.FieldMatrix.ARROW_SIZE) / 2;
      this.arrow_ = ScratchBlocks.utils.createSvgElement(
        'image',
        {
          height: `${ScratchBlocks.FieldMatrix.ARROW_SIZE}px`,
          width: `${ScratchBlocks.FieldMatrix.ARROW_SIZE}px`,
          transform: `translate(${arrowX}, ${arrowY})`,
        },
        this.fieldGroup_,
      );
      this.arrow_.setAttributeNS(
        'http://www.w3.org/1999/xlink',
        'xlink:href',
        `${ScratchBlocks.mainWorkspace.options.pathToMedia}dropdown-arrow.svg`,
      );
      this.arrow_.style.cursor = 'default';
    }

    this.mouseDownWrapper_ = ScratchBlocks.bindEventWithChecks_(
      this.getClickTarget_(),
      'mousedown',
      this,
      this.onMouseDown_,
    );
  }

  setValue(matrix) {
    if (!matrix || matrix === this.matrix_) {
      return; // No change
    }
    if (this.sourceBlock_ && ScratchBlocks.Events.isEnabled()) {
      ScratchBlocks.Events.fire(
        new ScratchBlocks.Events.Change(this.sourceBlock_, 'field', this.name, this.matrix_, matrix),
      );
    }
    matrix = matrix + this.zeros_.slice(0, this.width_ * this.height_ - matrix.length);
    this.matrix_ = matrix;
    this.updateMatrix_();
  }

  showEditor_() {
    // If there is an existing drop-down someone else owns, hide it immediately and clear it.
    ScratchBlocks.DropDownDiv.hideWithoutAnimation();
    ScratchBlocks.DropDownDiv.clearContent();
    const div = ScratchBlocks.DropDownDiv.getContentDiv();
    // Build the SVG DOM.
    const matrixHeight =
      ScratchBlocks.FieldMatrix.MATRIX_NODE_SIZE * this.height_ +
      ScratchBlocks.FieldMatrix.MATRIX_NODE_PAD * (this.height_ + 1);
    const matrixWidth =
      ScratchBlocks.FieldMatrix.MATRIX_NODE_SIZE * this.width_ +
      ScratchBlocks.FieldMatrix.MATRIX_NODE_PAD * (this.width_ + 1);
    this.matrixStage_ = ScratchBlocks.utils.createSvgElement(
      'svg',
      {
        xmlns: 'http://www.w3.org/2000/svg',
        'xmlns:html': 'http://www.w3.org/1999/xhtml',
        'xmlns:xlink': 'http://www.w3.org/1999/xlink',
        version: '1.1',
        height: `${matrixHeight}px`,
        width: `${matrixWidth}px`,
      },
      div,
    );
    // Create the ?x? matrix
    this.ledButtons_ = [];
    for (let i = 0; i < this.height_; i++) {
      for (let n = 0; n < this.width_; n++) {
        const x = ScratchBlocks.FieldMatrix.MATRIX_NODE_SIZE * n + ScratchBlocks.FieldMatrix.MATRIX_NODE_PAD * (n + 1);
        const y = ScratchBlocks.FieldMatrix.MATRIX_NODE_SIZE * i + ScratchBlocks.FieldMatrix.MATRIX_NODE_PAD * (i + 1);
        const attr = {
          x: `${x}px`,
          y: `${y}px`,
          width: ScratchBlocks.FieldMatrix.MATRIX_NODE_SIZE,
          height: ScratchBlocks.FieldMatrix.MATRIX_NODE_SIZE,
          rx: ScratchBlocks.FieldMatrix.MATRIX_NODE_RADIUS,
          ry: ScratchBlocks.FieldMatrix.MATRIX_NODE_RADIUS,
        };
        const led = ScratchBlocks.utils.createSvgElement('rect', attr, this.matrixStage_);
        this.matrixStage_.appendChild(led);
        this.ledButtons_.push(led);
      }
    }
    // Div for lower button menu
    const buttonDiv = document.createElement('div');
    // Button to clear matrix
    const clearButtonDiv = document.createElement('div');
    clearButtonDiv.className = 'scratchMatrixButtonDiv';
    const clearButton = this.createButton_(this.sourceBlock_.colourSecondary_);
    clearButtonDiv.appendChild(clearButton);
    // Button to fill matrix
    const fillButtonDiv = document.createElement('div');
    fillButtonDiv.className = 'scratchMatrixButtonDiv';
    const fillButton = this.createButton_('#FFFFFF');
    fillButtonDiv.appendChild(fillButton);

    buttonDiv.appendChild(clearButtonDiv);
    buttonDiv.appendChild(fillButtonDiv);
    div.appendChild(buttonDiv);

    ScratchBlocks.DropDownDiv.setColour(this.sourceBlock_.getColour(), this.sourceBlock_.getColourTertiary());
    ScratchBlocks.DropDownDiv.setCategory(this.sourceBlock_.getCategory());
    ScratchBlocks.DropDownDiv.showPositionedByBlock(this, this.sourceBlock_);

    this.matrixTouchWrapper_ = ScratchBlocks.bindEvent_(this.matrixStage_, 'mousedown', this, this.onMouseDown);
    this.clearButtonWrapper_ = ScratchBlocks.bindEvent_(clearButton, 'click', this, this.clearMatrix_);
    this.fillButtonWrapper_ = ScratchBlocks.bindEvent_(fillButton, 'click', this, this.fillMatrix_);

    // Update the matrix for the current value
    this.updateMatrix_();
  }

  clearMatrix_(e) {
    if (e.button !== 0) return;
    this.setValue(this.zeros_);
  }

  fillMatrix_(e) {
    if (e.button !== 0) return;
    this.setValue(this.ones_);
  }

  setLEDNode_(led, state) {
    if (led < 0 || led > this.width_ * this.height_ - 1) return;
    const matrix = this.matrix_.slice(0, led) + state + this.matrix_.slice(led + 1);
    this.setValue(matrix);
  }

  fillLEDNode_(led) {
    if (led < 0 || led > this.width_ * this.height_ - 1) return;
    this.setLEDNode_(led, '1');
  }

  clearLEDNode_(led) {
    if (led < 0 || led > this.width_ * this.height_ - 1) return;
    this.setLEDNode_(led, '0');
  }

  toggleLEDNode_(led) {
    if (led < 0 || led > this.width_ * this.height_ - 1) return;
    if (this.matrix_.charAt(led) === '0') {
      this.setLEDNode_(led, '1');
    } else {
      this.setLEDNode_(led, '0');
    }
  }

  checkForLED_(e) {
    const bBox = this.matrixStage_.getBoundingClientRect();
    const nodeSize = ScratchBlocks.FieldMatrix.MATRIX_NODE_SIZE;
    const nodePad = ScratchBlocks.FieldMatrix.MATRIX_NODE_PAD;
    const dx = e.clientX - bBox.left;
    const dy = e.clientY - bBox.top;
    const min = nodePad / 2;
    const max = bBox.width - nodePad / 2;
    if (dx < min || dx > max || dy < min || dy > max) {
      return -1;
    }
    const xDiv = Math.trunc((dx - nodePad / 2) / (nodeSize + nodePad));
    const yDiv = Math.trunc((dy - nodePad / 2) / (nodeSize + nodePad));
    return xDiv + yDiv * this.width_;
  }

  updateMatrix_() {
    const matrix = this.matrix_.replace(/:/g, '');
    for (let i = 0; i < matrix.length; i++) {
      if (matrix[i] === '0') {
        this.fillMatrixNode_(this.ledButtons_, i, this.sourceBlock_.colourSecondary_);
        this.fillMatrixNode_(this.ledThumbNodes_, i, this.sourceBlock_.colour_);
      } else {
        this.fillMatrixNode_(this.ledButtons_, i, '#FFFFFF');
        this.fillMatrixNode_(this.ledThumbNodes_, i, '#FFFFFF');
      }
    }
  }
}

ScratchBlocks.FieldMatrix = FieldMatrix;
ScratchBlocks.Field.register('field_matrix', ScratchBlocks.FieldMatrix);
