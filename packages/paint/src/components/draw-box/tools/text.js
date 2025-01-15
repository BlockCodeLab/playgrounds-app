import { default as Konva } from 'konva';

const FONT_SIZE = 30;

export default {
  setup(layer, options) {
    this.stage = layer.getStage();
    this.layer = layer;
    // 画笔属性
    this.fontFamily = options.fontFamily;
    this.color = options.color;
  },

  cancel() {
    this.cancelEditbox?.();
    this.poly = null;
    this.cancelEditbox = null;
  },

  enableEditbox() {
    this.poly.hide();

    const textPosition = this.poly.absolutePosition();

    const stageRect = this.stage.container().getBoundingClientRect();
    const areaPosition = {
      x: stageRect.x + textPosition.x,
      y: stageRect.y + textPosition.y,
    };

    const textarea = document.createElement('div');
    document.body.appendChild(textarea);

    textarea.innerText = this.poly.text();
    textarea.contentEditable = 'plaintext-only';
    textarea.style.position = 'absolute';
    textarea.style.top = areaPosition.y + 'px';
    textarea.style.left = areaPosition.x + 'px';
    textarea.style.minWidth = this.poly.fontSize() + 'px';
    textarea.style.fontSize = this.poly.fontSize() + 'px';
    textarea.style.border = 'none';
    textarea.style.padding = '0px';
    textarea.style.margin = '0px';
    textarea.style.background = 'none';
    textarea.style.outline = 'none';
    textarea.style.resize = 'auto';
    textarea.style.lineHeight = this.poly.lineHeight();
    textarea.style.fontFamily = this.poly.fontFamily();
    textarea.style.transformOrigin = 'left top';
    textarea.style.textAlign = this.poly.align();
    textarea.style.color = this.poly.fill();

    textarea.focus();

    textarea.addEventListener('blur', () => textarea.focus());

    this.cancelEditbox = () => {
      this.poly.text(textarea.innerText.trimEnd());
      textarea.parentNode.removeChild(textarea);
      this.poly.show();
    };
  },

  onBegin(e) {
    // 无颜色（透明色）
    if (this.color.clear) return;

    const pos = this.stage.getPointerPosition();
    this.poly = new Konva.Text({
      x: pos.x,
      y: pos.y - FONT_SIZE / 2,
      text: '',
      fontSize: FONT_SIZE,
      fontFamily: this.fontFamily,
      fill: this.color.hex,
    });
    this.layer.add(this.poly);

    this.enableEditbox(this.stage, this.poly);
  },

  onDone(e) {
    if (!this.poly) return;

    this.cancelEditbox();

    const text = this.poly.text();
    if (text.length === 0) {
      this.poly.remove();
    } else {
      this.poly.setAttrs({
        name: 'selector',
        draggable: true,
      });
    }
    this.poly = null;
    this.cancelEditbox = null;
  },
};
