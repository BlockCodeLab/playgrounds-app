import { useEffect, useRef, useCallback } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { default as Konva } from 'konva';
import { classNames, sleepMs } from '@blockcode/utils';
import { useProjectContext, Keys } from '@blockcode/core';
import { loadImageFromAsset } from '../../lib/load-image';
import { createImageFromLayer } from '../../lib/create-image';
import { PaintTools } from '../tools-box/tools-box';
import styles from './draw-box.module.css';

import pen from './tools/pen';
import eraser from './tools/eraser';
import fill from './tools/fill';
import text from './tools/text';
import line from './tools/line';
import curve from './tools/curve';
import rectangle from './tools/rectangle';
import circle from './tools/circle';
import isogon from './tools/isogon';
import polygon from './tools/polygon';
import selector from './tools/selector';
import center from './tools/center';
import colorPicker from './tools/color-picker';

import centerIcon from '../painter/icons/icon-center.svg';

const Tools = {
  [PaintTools.Pen]: pen,
  [PaintTools.Eraser]: eraser,
  [PaintTools.Fill]: fill,
  [PaintTools.Text]: text,
  [PaintTools.Line]: line,
  [PaintTools.Curve]: curve,
  [PaintTools.Rectangle]: rectangle,
  [PaintTools.Circle]: circle,
  [PaintTools.Isogon]: isogon,
  [PaintTools.Polygon]: polygon,
  [PaintTools.Selector]: selector,
  [PaintTools.Center]: center,
  [PaintTools.ColorPicker]: colorPicker,
  [PaintTools.OutlineColorPicker]: colorPicker,
};

export function DrawBox({ zoom, maxSize, toolOptions, onSizeChange, onChange }) {
  const ref = useRef(null);

  const { asset, assetId, modified } = useProjectContext();

  const tool = useSignal(null);

  // 更新图形数据
  const updateImage = useCallback(() => {
    if (tool.value?.type === PaintTools.Center) return;

    if (ref.drawLayer.children.length <= 2) return;

    const pos = ref.image.position();
    pos.x += asset.value.centerX;
    pos.y += asset.value.centerY;

    const image = createImageFromLayer(ref.drawLayer, pos);
    onChange(image);
  }, []);

  // 更新图形中心
  const updateCenter = useCallback((pos) => {
    const imagePos = ref.image.position();
    const centerX = pos.x - imagePos.x;
    const centerY = pos.y - imagePos.y;
    onChange({ centerX, centerY });
  });

  // 创建图形操作控制器
  const createSelector = useCallback(() => {
    const shapes = ref.stage.find('.selector');
    if (shapes.length > 0) {
      ref.transformer.zIndex(ref.drawLayer.children.length - 1);
      ref.transformer.nodes(shapes);
    } else {
      updateImage();
    }
  }, []);

  // 清理图形操作控制器
  const clearSelector = useCallback(() => {
    if (ref.transformer.nodes().length > 0) {
      ref.transformer.nodes([]);
      updateImage();
    }
  }, []);

  // 清理可编辑图形
  const clearDrawable = useCallback(() => {
    ref.transformer.nodes([]);
    for (let child of ref.drawLayer.children) {
      if (child === ref.image || child instanceof Konva.Transformer) continue;
      child.remove();
    }
  }, []);

  // 键盘控制
  const handleKeyDown = useCallback((e) => {
    switch (e.code) {
      case Keys.ESC:
      case Keys.DELETE:
      case Keys.BACKSPACE:
        ref.painting = false;
        tool.value?.cancel?.();
        clearDrawable();
        return;
      case Keys.RETURN:
      case Keys.ENTER:
        clearSelector();
        return;
      case Keys.LEFT:
        ref.transformer.nodes().forEach((node) => node.x(node.x() - 1));
        return;
      case Keys.RIGHT:
        ref.transformer.nodes().forEach((node) => node.x(node.x() + 1));
        return;
      case Keys.UP:
        ref.transformer.nodes().forEach((node) => node.y(node.y() - 1));
        return;
      case Keys.DOWN:
        ref.transformer.nodes().forEach((node) => node.y(node.y() + 1));
        return;
    }
  }, []);

  // 放置原始图
  useEffect(async () => {
    if (!/image\//.test(asset.value?.type) || !ref.image) return;

    const image = await loadImageFromAsset(asset.value);
    ref.image.image(image);
    ref.image.position({
      x: ref.stage.width() / 2 - asset.value.centerX,
      y: ref.stage.height() / 2 - asset.value.centerY,
    });
    // 清除之前的绘制
    clearDrawable();
  }, [assetId.value, modified.value]);

  // 缩放画布
  useEffect(() => {
    if (ref.stage) {
      const { clientWidth, clientHeight, scrollLeft, scrollTop, scrollWidth, scrollHeight } = ref.current;
      const clientCenter = {
        top: clientHeight / 2,
        left: clientWidth / 2,
      };
      const scrollOption = {
        top: ((scrollTop + clientCenter.top) / scrollHeight) * (clientHeight * zoom) - clientCenter.top,
        left: ((scrollLeft + clientCenter.left) / scrollWidth) * (clientWidth * zoom) - clientCenter.left,
        behavior: 'instant',
      };
      ref.stage.content.style.zoom = zoom;
      ref.current.scrollTo(scrollOption);
    }
  }, [zoom]);

  // 切换绘画工具或模式
  useEffect(() => {
    if (ref.drawLayer) {
      if (tool.value?.type !== toolOptions.type) {
        if (ref.painting) {
          ref.painting = false;
          tool.value?.cancel?.();
          updateImage();
        }
        clearSelector();
        tool.value = Tools[toolOptions.type];
        if (tool.value) {
          tool.value.type = toolOptions.type;
        }
      }
      // 重新设置图形中心
      if (toolOptions.type === PaintTools.Center) {
        toolOptions.onCenterChange = updateCenter;
      }
      tool.value?.setup?.(ref.drawLayer, toolOptions);
    }
  }, [toolOptions]);

  useEffect(() => {
    if (ref.current) {
      const { clientWidth, clientHeight } = ref.current;
      const stageWidth = Math.max(maxSize.width, clientWidth);
      const stageHeight = Math.max(maxSize.height, clientHeight);
      Konva.pixelRatio = 1;
      ref.stage = new Konva.Stage({
        container: ref.current,
        width: stageWidth,
        height: stageWidth,
      });
      onSizeChange({ width: clientWidth, height: clientHeight });

      // 层管理
      const maskLayer = new Konva.Layer({ listening: false }); // 遮罩层
      ref.drawLayer = new Konva.Layer(); // 绘图层
      ref.stage.add(ref.drawLayer, maskLayer);

      // 无效绘图区（超出 maxSize)遮罩
      const maskWidth = (stageWidth - maxSize.width) / 2;
      const maskHeight = (stageHeight - maxSize.height) / 2;
      const topMask = new Konva.Rect({
        x: 0,
        y: 0,
        width: stageWidth,
        height: maskHeight,
        fill: 'black',
        opacity: 0.2,
      });
      const bottomMask = new Konva.Rect({
        x: 0,
        y: stageHeight - maskHeight,
        width: clientWidth,
        height: maskHeight,
        fill: 'black',
        opacity: 0.2,
      });
      const leftMask = new Konva.Rect({
        x: 0,
        y: maskHeight,
        width: maskWidth,
        height: maxSize.height,
        fill: 'black',
        opacity: 0.2,
      });
      const rightMask = new Konva.Rect({
        x: stageWidth - maskWidth,
        y: maskHeight,
        width: maskWidth,
        height: maxSize.height,
        fill: 'black',
        opacity: 0.2,
      });
      maskLayer.add(topMask, bottomMask, leftMask, rightMask);

      // 绘图操作手柄
      ref.transformer = new Konva.Transformer();
      ref.drawLayer.add(ref.transformer);

      // 原始图片
      ref.image = new Konva.Image();
      ref.drawLayer.add(ref.image);
      if (asset.value) {
        loadImageFromAsset(asset.value).then((image) => {
          ref.image.image(image);
          ref.image.position({
            x: ref.stage.width() / 2 - asset.value.centerX,
            y: ref.stage.height() / 2 - asset.value.centerY,
          });
        });
      }

      // 绘图
      ref.painting = false;
      ref.stage.on('pointerdown', async (e) => {
        if (ref.painting || e.target.name() === 'selector' || e.target.parent instanceof Konva.Transformer) {
          return;
        }
        if (tool.value?.type === PaintTools.ColorPicker || tool.value?.type === PaintTools.OutlineColorPicker) {
          e.evt.stopPropagation();
        }
        clearSelector();
        await sleepMs(30);
        if (tool.value) {
          ref.painting = true;
          tool.value.onBegin?.(e);
        }
      });
      ref.stage.on('pointermove', (e) => {
        if (ref.painting) {
          e.evt.preventDefault();
          tool.value.onDrawing?.(e);
        }
      });
      ref.stage.on('pointerup', async (e) => {
        if (ref.painting) {
          ref.painting = !!tool.value.onDone;
          await tool.value.onEnd?.(e);
          if (!tool.value.onDone) {
            createSelector();
          }
        }
      });
      ref.stage.on('pointerdblclick', async (e) => {
        if (ref.painting) {
          ref.painting = false;
          await tool.value.onDone?.(e);
          createSelector();
        }
      });
      ref.stage.on('pointerclick', async (e) => {
        if (ref.painting && tool.value?.type === PaintTools.Text) {
          ref.painting = false;
          await tool.value.onDone?.(e);
          createSelector();
        }
      });
      document.addEventListener('keydown', handleKeyDown);

      // 缩放画板
      ref.resizeObserver = new ResizeObserver(() => {
        if (!ref.stage) return;

        // 改变画布尺寸
        const { clientWidth, clientHeight } = ref.current;
        const stageWidth = Math.max(maxSize.width, clientWidth);
        const stageHeight = Math.max(maxSize.height, clientHeight);
        ref.stage.size({
          width: stageWidth,
          height: stageHeight,
        });
        onSizeChange({ width: clientWidth, height: clientHeight });

        // 修正图形位置
        ref.image.position({
          x: stageWidth / 2 - asset.value.centerX,
          y: stageHeight / 2 - asset.value.centerY,
        });

        // 修正遮罩
        const maskWidth = (stageWidth - maxSize.width) / 2;
        const maskHeight = (stageHeight - maxSize.height) / 2;
        topMask.size({
          width: stageWidth,
          height: maskHeight,
        });
        bottomMask.setAttrs({
          y: stageHeight - maskHeight,
          width: stageWidth,
          height: maskHeight,
        });
        leftMask.setAttrs({
          y: maskHeight,
          width: maskWidth,
        });
        rightMask.setAttrs({
          x: stageWidth - maskWidth,
          y: maskHeight,
          width: maskWidth,
        });
      });
      ref.resizeObserver.observe(ref.current);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      tool.value?.cancelEditbox?.(); // 取消可能存在的文本编辑框
      ref.resizeObserver.unobserve(ref.current);
      ref.stage.destroy();
      ref.stage = null;
    };
  }, [ref]);
  return (
    <div className={styles.drawBox}>
      <div
        ref={ref}
        className={classNames(styles.drawContainer, {
          [styles.text]: tool.value?.type === PaintTools.Text,
          [styles.center]: tool.value?.type === PaintTools.Center,
          [styles.picker]:
            tool.value?.type === PaintTools.ColorPicker || tool.value?.type === PaintTools.OutlineColorPicker,
        })}
      />
      <img
        src={centerIcon}
        className={classNames(styles.centerIcon, {
          [styles.hidden]: tool.value?.type !== PaintTools.Center,
        })}
      />
    </div>
  );
}
