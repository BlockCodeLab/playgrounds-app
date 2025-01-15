import { default as Konva } from 'konva';

export default {
  setup(layer, options) {
    this.stage = layer.getStage();
    this.layer = layer;
    // 画笔属性
    this.size = options.size;
    this.color = options.color;
  },

  cancel() {
    if (!this.poly) return;
    const points = this.poly.getAttr('points');
    points.pop();
    points.pop();
    this.poly.setAttr('points', points);
    this.poly = null;
  },

  draw(ctx, shape) {
    const points = shape.getAttr('points');
    const x = shape.x();
    const y = shape.y();

    // 第一个点
    ctx.beginPath();
    ctx.moveTo(points[0] - x, points[1] - y);

    // 绘制中间点，若点过少直接绘制直线
    if (points.length < 6) {
      ctx.lineTo(points[2] - x, points[3] - y);
    } else {
      let i = 2;
      for (; i < points.length - 4; i += 2) {
        var xc = (points[i] - x + (points[i + 2] - x)) / 2;
        var yc = (points[i + 1] - y + (points[i + 3] - y)) / 2;
        ctx.quadraticCurveTo(points[i] - x, points[i + 1] - y, xc, yc);
      }

      // 最后两个点
      ctx.quadraticCurveTo(points[i] - x, points[i + 1] - y, points[i + 2] - x, points[i + 3] - y);
    }

    ctx.fillStrokeShape(shape);
  },

  onBegin(e) {
    if (this.color.clear) return;

    const pos = this.stage.getPointerPosition();
    this.poly = new Konva.Shape({
      stroke: this.color.hex,
      strokeWidth: this.size,
      lineCap: 'round',
      lineJoin: 'round',
      points: [pos.x, pos.y],
      sceneFunc: this.draw,
    });
    this.layer.add(this.poly);
  },

  onDrawing(e) {
    if (!this.poly) return;
    const pos = this.stage.getPointerPosition();
    const points = this.poly.getAttr('points');
    const len = points.length;
    points[len - 2] = pos.x;
    points[len - 1] = pos.y;
    this.poly.setAttr('points', points);
  },

  onEnd(e) {
    if (!this.poly) return;
    const pos = this.stage.getPointerPosition();
    const points = this.poly.getAttr('points');
    points.push(pos.x);
    points.push(pos.y);
    this.poly.setAttr('points', points);
  },

  onDone(e) {
    this.poly = null;
  },
};
