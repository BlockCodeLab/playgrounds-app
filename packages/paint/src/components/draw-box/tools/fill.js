import { default as Konva } from 'konva';
import { Color, sleepMs } from '@blockcode/utils';
import { loadImageFromURL } from '../../../lib/load-image';

export default {
  setup(layer, options) {
    this.stage = layer.getStage();
    this.layer = layer;
    this.pixels = [];
    // 画笔属性
    this.color = options.color;
  },

  getIndex(x, y) {
    const width = this.layer.width();
    return (y * width + x) << 2;
  },

  getPos(index) {
    const width = this.layer.width();
    const i = index >> 2;
    const y = Math.floor(i / width);
    const x = i - y * width;
    return { x, y };
  },

  checkPixel(x, y, color) {
    if (x < 0 || y < 0 || x >= this.imageData.width || y >= this.imageData.height) return;

    const index = this.getIndex(x, y);
    if (this.pixels.includes(index)) return;

    const rgba = this.imageData.data.slice(index, index + 4);
    const pixel = new Color(Array.from(rgba));
    if (pixel.equals(color) && pixel.notEquals(this.color)) {
      this.pixels.push(index);
    }
  },

  fill(pos) {
    const x = Math.floor(pos.x);
    const y = Math.floor(pos.y);

    const rgb = this.color.rgb;
    const alpha = this.color.clear ? 0 : 255;

    const width = this.layer.width();
    const height = this.layer.height();
    const ctx = this.layer.getContext();
    this.imageData = ctx.getImageData(0, 0, width, height);

    // 检查要替换的颜色
    let index = this.getIndex(x, y);
    const rgba = this.imageData.data.slice(index, index + 4);
    const color = new Color(Array.from(rgba));
    this.checkPixel(x, y, color);

    // 开始替换颜色
    const imageData = ctx.createImageData(width, height);
    while (this.pixels.length > 0) {
      index = this.pixels.shift();
      imageData.data[index + 0] = rgb.r;
      imageData.data[index + 1] = rgb.g;
      imageData.data[index + 2] = rgb.b;
      imageData.data[index + 3] = alpha;
      this.imageData.data[index + 0] = rgb.r;
      this.imageData.data[index + 1] = rgb.g;
      this.imageData.data[index + 2] = rgb.b;
      this.imageData.data[index + 3] = alpha;

      // 检查四周相邻的颜色是否需要替换
      pos = this.getPos(index);
      this.checkPixel(pos.x - 1, pos.y, color);
      this.checkPixel(pos.x + 1, pos.y, color);
      this.checkPixel(pos.x, pos.y - 1, color);
      this.checkPixel(pos.x, pos.y + 1, color);
    }
    this.imageData = null;

    ctx.putImageData(imageData, 0, 0);
    return ctx.canvas.toDataURL();
  },

  onBegin(e) {
    // 无颜色（透明色）
    if (this.color.clear) return;

    this.filling = true;

    const pos = this.stage.getPointerPosition();
    const imageUrl = this.fill(pos);

    const image = new Konva.Image({
      x: 0,
      y: 0,
    });
    this.layer.add(image);
    loadImageFromURL(imageUrl).then((res) => {
      image.image(res);
      this.filling = false;
    });
  },

  async onEnd(e) {
    this.pixels.length = 0;
    while (true) {
      if (!this.fileing) break;
      await sleepMs(50);
    }
    await sleepMs(100);
  },
};
