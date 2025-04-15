import { Konva } from '@blockcode/utils';
import { themeColors } from '@blockcode/core';

export default {
  setup(layer, options, updateImage) {
    this.stage = layer.getStage();
    this.layer = layer;
    this.selectorLayer = this.stage.getLayers().at(-1);
    this.updateImage = updateImage;
    options.onToolProxy(this);
  },

  cancel() {
    this.clipImage?.remove?.();
    this.clipImage = null;
    this.cliped = false;
  },

  async delete() {
    if (this.clipImage) {
      this.cancel();
    } else {
      const image = this.layer.children[0];
      image.image(null);
    }
    await this.updateImage();
  },

  flip(x, y) {
    let clipImage = this.clipImage;
    if (!clipImage) {
      // 反转全图
      const image = this.layer.children[0];
      const offsetX = image.width() / 2;
      const offsetY = image.height() / 2;

      clipImage = new Konva.Image({
        offsetX,
        offsetY,
        image: image.image(),
        x: image.x() + offsetX,
        y: image.y() + offsetY,
      });
      this.layer.add(clipImage);
      image.image(null);
    }

    const scale = clipImage.scale();
    clipImage.scale({
      x: Math.sign(x) * scale.x,
      y: Math.sign(y) * scale.y,
    });

    if (!this.clipImage) {
      this.updateImage();
    }
  },

  async clip() {
    // 隐藏选框
    this.poly.setAttr('stroke', 'transparent');
    this.poly.moveTo(this.layer);

    const clipRect = this.poly.getClientRect();

    // 截取选框内容
    const image = await this.layer.toImage(clipRect);
    const offsetX = image.width / 2;
    const offsetY = image.height / 2;

    this.clipImage = new Konva.Image({
      image,
      offsetX,
      offsetY,
      x: clipRect.x + offsetX,
      y: clipRect.y + offsetY,
      name: 'selector',
      draggable: true,
    });
    this.clipImage.on('dragmove', () => (this.changed = true));
    this.layer.add(this.clipImage);
    this.changed = false;
    this.cliped = true;

    // 清除选框内容
    this.poly.setAttrs({
      fill: 'black',
      globalCompositeOperation: 'destination-out',
    });
  },

  onBegin(e) {
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
    this.selectorLayer.add(this.poly);
    this.cliped = false;
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
      this.poly.destroy();
    } else {
      await this.clip();
    }
    this.poly = null;
  },
};
