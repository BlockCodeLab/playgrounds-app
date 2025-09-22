import { Color, MathUtils } from '@blockcode/utils';

export function emulator(runtime, Konva) {
  runtime.on('start', () => {
    const renderer = new Konva.Group({
      id: 'pen_renderer',
    });
    runtime.paintLayer.add(renderer);
  });

  runtime.targetUtils.on('update', (target) => {
    const renderer = runtime.querySelector('#pen_renderer');
    const pen = runtime.getData(target, 'pen.position');
    if (!renderer || !pen) return;

    const pos = target.position();
    if (Math.floor(pen.x) === Math.floor(pos.x) && Math.floor(pen.y) === Math.floor(pos.y)) return;

    const line = new Konva.Line({
      points: [pen.x, pen.y, pos.x, pos.y],
      stroke: runtime.getData(target, 'pen.color') ?? '#FF0000',
      strokeWidth: runtime.getData(target, 'pen.size') ?? 1,
      lineJoin: 'round',
      lineCap: 'round',
    });
    renderer.add(line);

    runtime.setData(target, 'pen.position', pos);
  });

  return {
    get key() {
      return 'pen';
    },

    get renderer() {
      return runtime.querySelector('#pen_renderer');
    },

    erase() {
      if (!this.renderer) return;
      this.renderer.destroyChildren();
    },

    async stamp(target) {
      if (!this.renderer) return;

      // 等待造型更新完成
      while (target.getAttr('_frameIndex') != null) {
        await runtime.nextTick();
      }

      const image = target.clone({
        id: null, // 移除ID和名字
        name: null,
        visible: true, // 强制显示
      });
      this.renderer.add(image);
    },

    down(target) {
      runtime.setData(target, 'pen.position', target.position());
    },

    up(target) {
      runtime.setData(target, 'pen.position', null);
    },

    setColor(target, color) {
      runtime.setData(target, 'pen.color', color);
    },

    addColorParam(target, param, value) {
      const paramValue = MathUtils.toNumber(value);
      const colorValue = runtime.getData(target, 'pen.color') ?? '#FF0000';
      const color = new Color(colorValue).toHSVColor();
      switch (param) {
        case 'saturation':
          color.hsv.s += paramValue;
          break;
        case 'brightness':
          color.hsv.v += paramValue;
          break;
        case 'hub':
        default:
          color.hsv.h += paramValue * 3.6;
      }
      runtime.setData(target, 'pen.color', color.hex);
    },

    setColorParam(target, param, value) {
      const paramValue = MathUtils.toNumber(value);
      const colorValue = runtime.getData(target, 'pen.color') ?? '#FF0000';
      const color = new Color(colorValue).toHSVColor();
      switch (param) {
        case 'saturation':
          color.hsv.s = paramValue;
          break;
        case 'brightness':
          color.hsv.v = paramValue;
          break;
        case 'hub':
        default:
          color.hsv.h = paramValue * 3.6;
      }
      runtime.setData(target, 'pen.color', color.hex);
    },

    setSize(target, size) {
      const sizeValue = MathUtils.toNumber(size);
      runtime.setData(target, 'pen.size', sizeValue);
    },

    addSize(target, value) {
      const sizeValue = MathUtils.toNumber(value);
      const size = runtime.getData(target, 'pen.size') ?? 1;
      runtime.setData(target, 'pen.size', size + sizeValue);
    },
  };
}
