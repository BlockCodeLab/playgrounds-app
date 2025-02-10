import { default as Konva } from 'konva';

export default {
  setup(layer, options) {
    this.stage = layer.getStage();
    this.layer = layer;
    // 画笔属性
    this.size = options.size;
    this.color = options.color;
  },

  onBegin(e) {
    // 无颜色（透明色）
    if (this.color.clear) return;

    const pos = this.stage.getPointerPosition();
    this.poly = new Konva.Line({
      stroke: this.color.hex,
      strokeWidth: this.size,
      lineCap: 'round',
      lineJoin: 'round',
      points: [pos.x, pos.y],
    });
    this.layer.add(this.poly);
  },

  onDrawing(e) {
    if (!this.poly) return;
    const pos = this.stage.getPointerPosition();
    const points = this.poly.points();
    points[2] = pos.x;
    points[3] = pos.y;
    this.poly.points(points);
  },

  onEnd(e) {
    this.poly.addName('done');
    this.poly = null;
  },
};
