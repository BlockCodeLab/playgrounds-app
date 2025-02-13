import { Konva } from '@blockcode/utils';

export default {
  setup(layer, options) {
    this.stage = layer.getStage();
    this.layer = layer;
    // 画笔属性
    this.size = options.size;
    this.color = options.color;
    this.outlineWidth = options.outlineWidth;
    this.outlineColor = options.outlineColor;
  },

  cancel() {
    if (!this.poly) return;
    const points = this.poly.getAttr('points');
    points.pop();
    points.pop();
    this.poly.setAttr('points', points);
    this.poly = null;
  },

  onBegin(e) {
    // 无颜色（透明色）
    if (this.color.clear) return;

    const pos = this.stage.getPointerPosition();
    this.poly = new Konva.Line({
      points: [pos.x, pos.y],
      lineCap: 'round',
      lineJoin: 'round',
      closed: true,
      fill: this.color.clear ? 'transparent' : this.color.hex,
      stroke: this.outlineWidth === 0 || this.outlineColor.clear ? 'transparent' : this.outlineColor.hex,
      strokeWidth: this.outlineColor.clear ? 0 : this.outlineWidth,
    });
    this.layer.add(this.poly);
  },

  onDrawing(e) {
    if (!this.poly) return;
    const pos = this.stage.getPointerPosition();
    const points = this.poly.points();
    const len = points.length;
    points[len - 2] = pos.x;
    points[len - 1] = pos.y;
    this.poly.points(points);
  },

  onEnd(e) {
    if (!this.poly) return;
    const pos = this.stage.getPointerPosition();
    const points = this.poly.points();
    points.push(pos.x);
    points.push(pos.y);
    this.poly.points(points);
  },

  onDone(e) {
    if (!this.poly) return;
    const size = this.poly.size();
    if (size.width < 10 && size.height < 10) {
      this.poly.remove();
    } else {
      this.poly.setAttrs({
        name: 'selector',
        draggable: true,
      });
    }
    this.poly = null;
  },
};
