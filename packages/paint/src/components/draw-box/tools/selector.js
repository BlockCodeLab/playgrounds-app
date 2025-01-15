import { default as Konva } from 'konva';
import { sleepMs } from '@blockcode/utils';
import { themeColors } from '@blockcode/core';

export default {
  setup(layer, options) {
    this.stage = layer.getStage();
    this.layer = layer;
  },

  cancel() {
    this.clipImage?.remove?.();
    this.clipImage = null;
  },

  async clip() {
    // 隐藏选框
    this.poly.setAttr('stroke', 'transparent');

    const clipRect = this.poly.getClientRect();

    // 截取选框内容
    const image = await this.layer.toImage(clipRect);

    this.clipImage = new Konva.Image({
      image,
      x: clipRect.x,
      y: clipRect.y,
      name: 'selector',
      draggable: true,
    });
    this.layer.add(this.clipImage);

    // 清除选框内容
    this.poly.setAttrs({
      fill: 'black',
      globalCompositeOperation: 'destination-out',
    });
  },

  onBegin(e) {
    this.cancel();

    const pos = this.stage.getPointerPosition();
    this.poly = new Konva.Rect({
      x: pos.x,
      y: pos.y,
      width: 1,
      height: 1,
      dash: [5, 5],
      fill: 'transparent',
      stroke: themeColors.ui.theme.highlight,
      strokeWidth: 1,
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
    this.poly.setAttrs({
      width: Math.abs(width),
      height: Math.abs(height),
      scale: {
        x: width < 0 ? -1 : 1,
        y: height < 0 ? -1 : 1,
      },
    });
  },

  async onEnd(e) {
    if (!this.poly) return;
    const size = this.poly.size();
    if (size.width < 10 && size.height < 10) {
      this.poly.remove();
    } else {
      await this.clip();
    }
    this.poly = null;
  },
};
