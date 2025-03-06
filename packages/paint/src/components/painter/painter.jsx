import { useCallback, useEffect, useMemo } from 'preact/hooks';
import { batch, useComputed, useSignal } from '@preact/signals';
import { classNames, Color, MathUtils } from '@blockcode/utils';
import { useProjectContext, translate, maybeTranslate, setAsset } from '@blockcode/core';
import { EditorModes } from '../../lib/editor-mode';

import { Text, Label, BufferedInput, Button } from '@blockcode/core';
import { ColorPicker } from '../color-picker/color-picker';
import { FontSelector } from '../font-selector/font-selector';
import { ToolsBox, PaintTools } from '../tools-box/tools-box';
import { DrawBox } from '../draw-box/draw-box';
import styles from './painter.module.css';

import undoIcon from './icons/icon-undo.svg';
import redoIcon from './icons/icon-redo.svg';
import centerIcon from './icons/icon-center.svg';
import cropIcon from './icons/icon-crop.svg';
import zoomInIcon from './icons/icon-zoom-in.svg';
import zoomOutIcon from './icons/icon-zoom-out.svg';
import zoomResetIcon from './icons/icon-zoom-reset.svg';
import tileMapIcon from './icons/icon-tilemap.svg';
import deleteIcon from './icons/icon-delete.svg';
import flipHorizontalIcon from './icons/icon-flip-horizontal.svg';
import flipVerticalIcon from './icons/icon-flip-vertical.svg';

import penIcon from '../tools-box/icons/icon-pen.svg';
import eraserIcon from '../tools-box/icons/icon-eraser.svg';
import lineIcon from '../tools-box/icons/icon-line.svg';
import curveIcon from '../tools-box/icons/icon-curve.svg';
import isogonIcon from '../tools-box/icons/icon-isogon.svg';

const UNDO_MAX_LENGTH = 30;
const ZOOM_STEP = 0.5;
const ZOOM_MAX = 20;

const getImageName = (mode) => {
  switch (mode) {
    case EditorModes.Image:
      return translate('paint.painter.image', 'Image').toLowerCase();
    case EditorModes.Costume:
      return translate('paint.painter.costume', 'Costume').toLowerCase();
    case EditorModes.Backdrop:
      return translate('paint.painter.backdrop', 'Backdrop').toLowerCase();
  }
};

export default function Painter({ mode, maxSize }) {
  const { asset, assetId, modified } = useProjectContext();

  const zoom = useSignal(1);
  const smallToolsBox = useSignal(false);

  // 工具模式
  const toolMode = useSignal(null);

  // 绘图工具
  const paintTool = useSignal(PaintTools.Pen);

  // 绘图设置
  const penSize = useSignal(10);
  const outlineWidth = useSignal(2);
  const isogonSides = useSignal(6);
  const font = useSignal(null);

  // 颜色设置
  const fillColor = useSignal(new Color([260, 0.6, 1]));
  const outlineColor = useSignal(new Color([0, 1, 0]));

  // 撤销和恢复
  const undoStack = useSignal([]);
  const redoStack = useSignal([]);

  const imageName = useMemo(() => asset.value?.name, [assetId.value, modified.value]);
  const disabled = !/image\//.test(asset.value?.type);

  // 选择新的资源时重置
  useEffect(() => {
    batch(() => {
      toolMode.value = null;
      undoStack.value = null;
      redoStack.value = null;
      undoStack.value = [];
      redoStack.value = [];
      if (asset.value) {
        undoStack.value.push(Object.assign({}, asset.value));
      }
    });
  }, [assetId.value]);

  const outlineDisabled = useComputed(
    () =>
      paintTool.value !== PaintTools.Rectangle &&
      paintTool.value !== PaintTools.Circle &&
      paintTool.value !== PaintTools.Isogon &&
      paintTool.value !== PaintTools.Polygon,
  );

  const penSizeEnabled = useComputed(
    () =>
      paintTool.value === PaintTools.Pen ||
      paintTool.value === PaintTools.Eraser ||
      paintTool.value === PaintTools.Line ||
      paintTool.value === PaintTools.Curve,
  );

  const penSizeIcon = useComputed(() => {
    if (paintTool.value === PaintTools.Eraser) {
      return eraserIcon;
    }
    if (paintTool.value === PaintTools.Line) {
      return lineIcon;
    }
    if (paintTool.value === PaintTools.Curve) {
      return curveIcon;
    }
    return penIcon;
  });

  // 改名字
  const handleChangeName = useCallback((name) => setAsset({ name }), []);

  // 选取颜色
  const handlePickColor = useCallback((color) => {
    if (toolMode.value === PaintTools.ColorPicker) {
      fillColor.value = color;
    } else if (toolMode.value === PaintTools.OutlineColorPicker) {
      outlineColor.value = color;
    }
  }, []);

  const wrapPickingColor = useCallback(
    (picker) => (picking) => {
      if (picking) {
        toolMode.value = picker;
      } else {
        toolMode.value = null;
      }
    },
    [],
  );

  // 画笔属性修改
  const handleOutlineWidthChange = useCallback((val) => (outlineWidth.value = MathUtils.clamp(val, 0, 100)), []);

  const handlePanSizeChange = useCallback((val) => (penSize.value = MathUtils.clamp(val, 1, 100)), []);

  const handleIsogonEdgesChange = useCallback((val) => (isogonSides.value = MathUtils.clamp(val, 3, 20)), []);

  const handleFontChange = useCallback((val) => (font.value = val), []);

  const handleDrawSizeChange = useCallback((size) => {
    smallToolsBox.value = smallToolsBox.value ? size.width < 390 : size.width < 340;
  }, []);

  // 撤销和重做
  const handleChange = useCallback((image) => {
    batch(() => {
      if (undoStack.value.length > UNDO_MAX_LENGTH) {
        undoStack.value.shift();
      }
      if (image) {
        redoStack.value.length = 0;
        undoStack.value.push(image);
        setAsset(image);
      }
    });
  }, []);

  const handleUndo = useCallback(() => {
    batch(() => {
      toolMode.value = null;
      let image = undoStack.value.pop();
      redoStack.value.push(image);
      image = undoStack.value[undoStack.value.length - 1];
      setAsset(image);
    });
  }, []);

  const handleRedo = useCallback(() => {
    batch(() => {
      toolMode.value = null;
      const image = redoStack.value.pop();
      undoStack.value.push(image);
      setAsset(image);
    });
  }, []);

  return (
    <div className={styles.painterWrapper}>
      <div className={styles.row}>
        <div className={styles.toolGroup}>
          <Label text={getImageName(mode)}>
            <BufferedInput
              disabled={disabled}
              className={styles.nameInput}
              placeholder={translate('paint.painter.name', 'name')}
              onSubmit={handleChangeName}
              value={imageName ? maybeTranslate(imageName) : getImageName(mode)}
            />
          </Label>
        </div>

        <div className={styles.toolGroup}>
          <Button
            disabled={undoStack.value.length <= 1}
            className={classNames(styles.button, styles.groupButtonFirst, {
              [styles.groupButtonToggledOff]: disabled,
            })}
            onClick={handleUndo}
          >
            <img
              src={undoIcon}
              className={styles.buttonIcon}
              title={translate('paint.painter.undo', 'Undo')}
            />
          </Button>
          <Button
            disabled={redoStack.value.length === 0}
            className={classNames(styles.button, styles.groupButtonLast, {
              [styles.groupButtonToggledOff]: disabled,
            })}
            onClick={handleRedo}
          >
            <img
              src={redoIcon}
              className={styles.buttonIcon}
              title={translate('paint.painter.redo', 'Redo')}
            />
          </Button>
        </div>

        <div className={styles.toolGroup}>
          <Button
            vertical
            disabled={mode !== EditorModes.Costume}
            className={classNames(styles.labelButton, {
              [styles.selected]: toolMode.value === PaintTools.Center,
            })}
            onClick={useCallback(
              () => (toolMode.value = toolMode.value !== PaintTools.Center ? PaintTools.Center : null),
              [],
            )}
          >
            <img
              src={centerIcon}
              className={styles.buttonIcon}
              title={translate('paint.painter.center', 'Center')}
            />
            <Text
              id="paint.painter.center"
              defaultMessage="Center"
            />
          </Button>
          <Button
            vertical
            disabled
            className={styles.labelButton}
            onClick={useCallback(() => null, [])}
          >
            <img
              src={cropIcon}
              className={styles.buttonIcon}
              title={translate('paint.painter.crop', 'Auto Crop')}
            />
            <Text
              id="paint.painter.crop"
              defaultMessage="Auto Crop"
            />
          </Button>
        </div>
      </div>

      <div className={styles.row}>
        {/* 画笔的颜色设置 */}
        <div className={styles.toolGroup}>
          <Label
            className={classNames({
              [styles.disabled]: paintTool.value === PaintTools.Eraser || paintTool.value === PaintTools.Selector,
            })}
            text={
              <Text
                id="paint.painter.fill"
                defaultMessage="Fill"
              />
            }
          >
            <ColorPicker
              picking={toolMode.value === PaintTools.ColorPicker}
              color={fillColor.value}
              onChange={useCallback((val) => (fillColor.value = val), [])}
              onPickingColor={wrapPickingColor(PaintTools.ColorPicker)}
            />
          </Label>
        </div>

        {/* 正方形、圆形、多边形的边框颜色及宽度设置 */}
        <div className={classNames(styles.toolGroup, styles.dashedBorder)}>
          <Label
            className={classNames({
              [styles.disabled]: outlineDisabled.value,
            })}
            text={
              <Text
                id="paint.painter.outline"
                defaultMessage="Outline"
              />
            }
          >
            <ColorPicker
              outline
              picking={toolMode.value === PaintTools.OutlineColorPicker}
              color={outlineColor.value}
              onChange={useCallback((val) => (outlineColor.value = val), [])}
              onPickingColor={wrapPickingColor(PaintTools.OutlineColorPicker)}
            />
          </Label>

          <BufferedInput
            small
            type="number"
            className={classNames(styles.largeInput, {
              [styles.disabled]: outlineDisabled.value,
            })}
            value={outlineWidth.value}
            onSubmit={handleOutlineWidthChange}
          />
        </div>

        {
          // 画笔、橡皮擦、画线的尺寸设置
          penSizeEnabled.value && (
            <div className={styles.toolGroup}>
              <img
                src={penSizeIcon}
                className={styles.toolIcon}
              />
              <BufferedInput
                small
                type="number"
                className={styles.largeInput}
                value={penSize.value}
                onSubmit={handlePanSizeChange}
              />
            </div>
          )
        }

        {
          // 正多边形边数设置
          paintTool.value === PaintTools.Isogon && (
            <div className={styles.toolGroup}>
              <img
                src={isogonIcon}
                className={styles.toolIcon}
              />
              <BufferedInput
                small
                type="number"
                className={styles.largeInput}
                value={isogonSides.value}
                onSubmit={handleIsogonEdgesChange}
              />
            </div>
          )
        }

        {
          // 字体设置
          paintTool.value === PaintTools.Text && (
            <FontSelector
              font={font.value}
              onChange={handleFontChange}
            />
          )
        }

        {
          // 选择操作
          paintTool.value === PaintTools.Selector && (
            <>
              <div className={classNames(styles.toolGroup, styles.dashedBorder)}>
                <Button
                  disabled
                  className={styles.labelButton}
                  onClick={useCallback(() => {}, [])}
                >
                  <img
                    src={deleteIcon}
                    className={styles.buttonIcon}
                    title={translate('paint.painter.delete', 'Delete')}
                  />
                </Button>
              </div>
              <div className={styles.toolGroup}>
                <Button
                  disabled
                  className={styles.labelButton}
                  onClick={useCallback(() => {}, [])}
                >
                  <img
                    src={flipHorizontalIcon}
                    className={styles.buttonIcon}
                    title={translate('paint.painter.flipHorizontal', 'Flip Horizontal')}
                  />
                </Button>
                <Button
                  disabled
                  className={styles.labelButton}
                  onClick={useCallback(() => {}, [])}
                >
                  <img
                    src={flipVerticalIcon}
                    className={styles.buttonIcon}
                    title={translate('paint.painter.flipVertical', 'Flip Vertical')}
                  />
                </Button>
              </div>
            </>
          )
        }
      </div>

      <div className={classNames(styles.row, styles.rowFill)}>
        <ToolsBox
          small={smallToolsBox.value}
          paintTool={paintTool.value}
          onSelect={useCallback(
            (val) =>
              batch(() => {
                paintTool.value = val;
                toolMode.value = null;
              }),
            [],
          )}
        />

        <div className={styles.drawBoxWrapper}>
          <DrawBox
            zoom={zoom.value}
            maxSize={maxSize}
            toolOptions={{
              type: toolMode.value || paintTool.value,
              size: penSize.value,
              sides: isogonSides.value,
              color: fillColor.value,
              fontFamily: font.value?.family,
              outlineWidth: outlineWidth.value,
              outlineColor: outlineColor.value,
              onPickColor: handlePickColor,
            }}
            onSizeChange={handleDrawSizeChange}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className={classNames(styles.row, styles.rowBottom)}>
        <div>
          {mode === EditorModes.Backdrop && (
            <Button
              disabled
              className={styles.tileMapButton}
            >
              <img
                className={styles.buttonLeftIcon}
                src={tileMapIcon}
              />
              <Text
                id="paint.mode.tileMap"
                defaultMessage="Convert to TileMap"
              />
            </Button>
          )}
        </div>
        <div>
          <Button
            disabled={zoom.value === 1}
            className={classNames(styles.button, styles.groupButtonFirst)}
            onClick={useCallback(() => zoom.value - ZOOM_STEP >= 1 && (zoom.value = zoom.value - ZOOM_STEP), [])}
          >
            <img
              src={zoomOutIcon}
              className={styles.buttonIcon}
            />
          </Button>
          <Button
            disabled={zoom.value === 1}
            className={classNames(styles.button, styles.groupButton)}
            onClick={useCallback(() => (zoom.value = 1), [])}
          >
            <img
              src={zoomResetIcon}
              className={styles.buttonIcon}
            />
          </Button>
          <Button
            disabled={zoom.value === ZOOM_MAX}
            className={classNames(styles.button, styles.groupButtonLast)}
            onClick={useCallback(() => zoom.value + ZOOM_STEP < ZOOM_MAX && (zoom.value = zoom.value + ZOOM_STEP), [])}
          >
            <img
              src={zoomInIcon}
              className={styles.buttonIcon}
            />
          </Button>
        </div>
      </div>
    </div>
  );
}
