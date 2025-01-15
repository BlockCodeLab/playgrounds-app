import { default as Konva } from 'konva';

export default {
  setup(layer, options) {
    this.stage = layer.getStage();
    this.layer = layer;
    // 画笔属性
    this.sides = options.sides;
    this.color = options.color;
    this.outlineWidth = options.outlineWidth;
    this.outlineColor = options.outlineColor;
  },

  onBegin(e) {
    // 无颜色（透明色）
    if (this.color.clear && this.outlineColor.clear) return;

    const pos = this.stage.getPointerPosition();
    this.poly = new Konva.RegularPolygon({
      x: pos.x,
      y: pos.y,
      sides: this.sides,
      radius: 1,
      lineCap: 'round',
      lineJoin: 'round',
      fill: this.color.clear ? 'transparent' : this.color.hex,
      stroke: this.outlineWidth === 0 || this.outlineColor.clear ? 'transparent' : this.outlineColor.hex,
      strokeWidth: this.outlineColor.clear ? 0 : this.outlineWidth,
    });
    this.layer.add(this.poly);
  },

  onDrawing(e) {
    if (!this.poly) return;
    const pos = this.stage.getPointerPosition();
    const x = this.poly.x();
    const y = this.poly.y();
    const width = pos.x - x;
    const height = pos.y - y;
    const radius = Math.sqrt(width * width + height * height);
    this.poly.setAttrs({
      radius: radius,
      scale: {
        x: width < 0 ? -1 : 1,
        y: height < 0 ? -1 : 1,
      },
    });
  },

  onEnd(e) {
    if (!this.poly) return;
    const radius = this.poly.radius();
    if (radius < 10) {
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
