import { Color } from '@blockcode/utils';

export default {
  setup(layer, options) {
    this.stage = layer.getStage();
    this.layer = layer;
    // 工具属性
    this.pickColor = options.onPickColor;
  },

  getIndex(pos) {
    const width = this.layer.width();
    const x = Math.floor(pos.x);
    const y = Math.floor(pos.y);
    return (y * width + x) << 2;
  },

  async onBegin(e) {
    const width = this.layer.width();
    const height = this.layer.height();
    const canvas = await this.layer.toCanvas({
      pixelRatio: 1,
    });
    const ctx = canvas.getContext('2d');
    this.imageData = ctx.getImageData(0, 0, width, height);

    const pos = this.stage.getPointerPosition();
    const index = this.getIndex(pos);
    const rgba = this.imageData.data.slice(index, index + 4);
    const color = new Color(Array.from(rgba));
    this.pickColor(color);
  },

  onDrawing(e) {
    if (!this.imageData) return;
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
