import { Color } from '@blockcode/utils';

export default {
  setup(layer, options) {
    this.stage = layer.getStage();
    this.layer = layer;
    this.ctx = layer.getContext();
    // 工具属性
    this.pickColor = options.onPickColor;
  },

  getIndex(pos) {
    const width = this.layer.width();
    const x = Math.floor(pos.x);
    const y = Math.floor(pos.y);
    return (y * width + x) << 2;
  },

  onBegin(e) {
    const width = this.layer.width();
    const height = this.layer.height();
    this.imageData = this.ctx.getImageData(0, 0, width, height);

    const pos = this.stage.getPointerPosition();
    const index = this.getIndex(pos);
    const rgba = this.imageData.data.slice(index, index + 4);
    const color = new Color(Array.from(rgba));
    this.pickColor(color);
  },

  onDrawing(e) {
    const pos = this.stage.getPointerPosition();
    const index = this.getIndex(pos);
    const rgba = this.imageData.data.slice(index, index + 4);
    const color = new Color(Array.from(rgba));
    this.pickColor(color);
  },

  onEnd(e) {
    this.imageData = null;
  },
};
