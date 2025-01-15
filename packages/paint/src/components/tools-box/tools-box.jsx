import { useCallback } from 'preact/hooks';
import { classNames, keyMirror } from '@blockcode/utils';
import { translate, Button } from '@blockcode/core';
import styles from './tools-box.module.css';

import penIcon from './icons/icon-pen.svg';
import eraserIcon from './icons/icon-eraser.svg';
import fillIcon from './icons/icon-fill.svg';
import textIcon from './icons/icon-text.svg';
import lineIcon from './icons/icon-line.svg';
import curveIcon from './icons/icon-curve.svg';
import rectangleIcon from './icons/icon-rectangle.svg';
import circleIcon from './icons/icon-circle.svg';
import isogonIcon from './icons/icon-isogon.svg';
import polygonIcon from './icons/icon-polygon.svg';
import selectIcon from './icons/icon-select.svg';

export const PaintTools = keyMirror({
  Pen: null,
  Eraser: null,
  Fill: null,
  Text: null,
  Line: null,
  Curve: null,
  Rectangle: null,
  Circle: null,
  Isogon: null,
  Polygon: null,
  Selector: null,
  Center: null,
  ColorPicker: null,
  OutlineColorPicker: null,
});

export function ToolsBox({ small, paintTool, onSelect }) {
  return (
    <div
      className={classNames(styles.toolsBoxWrapper, {
        [styles.small]: small,
      })}
    >
      <Button
        className={classNames(styles.toolButton, {
          [styles.selected]: paintTool === PaintTools.Pen,
        })}
        onClick={useCallback(() => onSelect(PaintTools.Pen), [])}
      >
        <img
          src={penIcon}
          className={styles.toolIcon}
          title={translate('paint.painter.pen', 'Pen')}
        />
      </Button>
      <Button
        className={classNames(styles.toolButton, {
          [styles.selected]: paintTool === PaintTools.Eraser,
        })}
        onClick={useCallback(() => onSelect(PaintTools.Eraser), [])}
      >
        <img
          src={eraserIcon}
          className={styles.toolIcon}
          title={translate('paint.painter.eraser', 'Eraser')}
        />
      </Button>
      <Button
        className={classNames(styles.toolButton, {
          [styles.selected]: paintTool === PaintTools.Fill,
        })}
        onClick={useCallback(() => onSelect(PaintTools.Fill), [])}
      >
        <img
          src={fillIcon}
          className={styles.toolIcon}
          title={translate('paint.painter.fill', 'Fill')}
        />
      </Button>
      <Button
        className={classNames(styles.toolButton, {
          [styles.selected]: paintTool === PaintTools.Text,
        })}
        onClick={useCallback(() => onSelect(PaintTools.Text), [])}
      >
        <img
          src={textIcon}
          className={styles.toolIcon}
          title={translate('paint.painter.text', 'Text')}
        />
      </Button>
      <Button
        className={classNames(styles.toolButton, {
          [styles.selected]: paintTool === PaintTools.Line,
        })}
        onClick={useCallback(() => onSelect(PaintTools.Line), [])}
      >
        <img
          src={lineIcon}
          className={styles.toolIcon}
          title={translate('paint.painter.line', 'Line')}
        />
      </Button>
      <Button
        className={classNames(styles.toolButton, {
          [styles.selected]: paintTool === PaintTools.Curve,
        })}
        onClick={useCallback(() => onSelect(PaintTools.Curve), [])}
      >
        <img
          src={curveIcon}
          className={styles.toolIcon}
          title={translate('paint.painter.curve', 'Curve')}
        />
      </Button>
      <Button
        className={classNames(styles.toolButton, {
          [styles.selected]: paintTool === PaintTools.Rectangle,
        })}
        onClick={useCallback(() => onSelect(PaintTools.Rectangle), [])}
      >
        <img
          src={rectangleIcon}
          className={styles.toolIcon}
          title={translate('paint.painter.rectangle', 'Rectangle')}
        />
      </Button>
      <Button
        className={classNames(styles.toolButton, {
          [styles.selected]: paintTool === PaintTools.Circle,
        })}
        onClick={useCallback(() => onSelect(PaintTools.Circle), [])}
      >
        <img
          src={circleIcon}
          className={styles.toolIcon}
          title={translate('paint.painter.circle', 'Circle')}
        />
      </Button>
      <Button
        className={classNames(styles.toolButton, {
          [styles.selected]: paintTool === PaintTools.Isogon,
        })}
        onClick={useCallback(() => onSelect(PaintTools.Isogon), [])}
      >
        <img
          src={isogonIcon}
          className={styles.toolIcon}
          title={translate('paint.painter.isogon', 'Isogon')}
        />
      </Button>
      <Button
        className={classNames(styles.toolButton, {
          [styles.selected]: paintTool === PaintTools.Polygon,
        })}
        onClick={useCallback(() => onSelect(PaintTools.Polygon), [])}
      >
        <img
          src={polygonIcon}
          className={styles.toolIcon}
          title={translate('paint.painter.polygon', 'Polygon')}
        />
      </Button>
      <Button
        className={classNames(styles.toolButton, {
          [styles.selected]: paintTool === PaintTools.Selector,
        })}
        onClick={useCallback(() => onSelect(PaintTools.Selector), [])}
      >
        <img
          src={selectIcon}
          className={styles.toolIcon}
          title={translate('paint.painter.select', 'Select')}
        />
      </Button>
    </div>
  );
}
