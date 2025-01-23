import { useCallback, useMemo } from 'preact/hooks';
import { classNames, Color } from '@blockcode/utils';
import { Text, Tooltip } from '@blockcode/core';
import styles from './color-picker.module.css';

import pickerIcon from './icon-picker.svg';
import clearIcon from './icon-clear.svg';

const HUE = [0, 0, 324, 288, 252, 216, 180, 144, 108, 72, 36, 0, 0];
const SLIDER_MAX_WIDTH = 124;

const getColorObject = (h, s, v, clear) => new Color({ h, s, v }, clear);

const moveSliderHandler = (e, setValue) => {
  e.stopPropagation();
  const target = e.target;
  const left = target.offsetLeft;
  const cx = e.clientX;
  const mouseMove = (e) => {
    e.preventDefault();
    let x = e.clientX - cx + left;
    if (x >= SLIDER_MAX_WIDTH) x = SLIDER_MAX_WIDTH;
    if (x <= 0) x = 0;
    target.style.left = `${x}px`;
    setValue(x / SLIDER_MAX_WIDTH);
  };
  const mouseUp = () => {
    document.removeEventListener('pointermove', mouseMove);
    document.removeEventListener('pointerup', mouseUp);
  };
  document.addEventListener('pointermove', mouseMove);
  document.addEventListener('pointerup', mouseUp);
};

const clickSlider = (e, setValue) => {
  const handler = e.target.children[0];
  let x = e.offsetX - 13;
  if (x >= SLIDER_MAX_WIDTH) x = SLIDER_MAX_WIDTH;
  if (x <= 0) x = 0;
  handler.style.left = `${x}px`;
  setValue(x / SLIDER_MAX_WIDTH);
};

export function ColorPicker({ picking, color: defaultColor, outline, onChange, onPickingColor }) {
  const color = defaultColor.hsv.h;
  const saturation = defaultColor.hsv.s;
  const brightness = defaultColor.hsv.v;

  const setColor = useCallback(
    (value) => onChange(getColorObject(Math.round(value * 360), saturation, brightness)),
    [saturation, brightness, onChange],
  );

  const setSaturation = useCallback(
    (value) => onChange(getColorObject(color, value, brightness)),
    [color, brightness, onChange],
  );

  const setBrightness = useCallback(
    (value) => onChange(getColorObject(color, saturation, value)),
    [color, saturation, onChange],
  );

  const handleClear = useCallback(
    () => onChange(getColorObject(color, saturation, brightness, true)),
    [color, saturation, brightness, onChange],
  );

  const handleColorMouseDown = useCallback((e) => moveSliderHandler(e, setColor), [setColor]);

  const handleSaturationMouseDown = useCallback((e) => moveSliderHandler(e, setSaturation), [setSaturation]);

  const handleBrightnessMouseDown = useCallback((e) => moveSliderHandler(e, setBrightness), [setBrightness]);

  const handleColorClick = useCallback((e) => clickSlider(e, setColor), [setColor]);

  const handleSaturationClick = useCallback((e) => clickSlider(e, setSaturation), [setSaturation]);

  const handleBrightnessClick = useCallback((e) => clickSlider(e, setBrightness), [setBrightness]);

  const hueBackgrounds = useMemo(
    () => HUE.map((h) => getColorObject(h, saturation, brightness).hex),
    [saturation, brightness],
  );

  const handleClick = useCallback((e) => e.stopPropagation(), []);

  const handlePickingColor = useCallback(() => onPickingColor(!picking), [picking, onPickingColor]);

  return (
    <Tooltip
      clickable
      placement="bottom"
      className={styles.colorTooltip}
      onHide={useCallback(() => setTimeout(() => onPickingColor(false), 50), [onPickingColor])}
      content={
        <>
          <div className={styles.tooltipItem}>
            <span className={styles.tooltipItemLabel}>
              <Text
                id="paint.colorPicker.color"
                defaultMessage="Color"
              />
            </span>
            <span className={styles.tooltipItemReadout}>{Math.round((color / 360) * 100)}</span>
          </div>
          <div
            className={classNames(styles.tooltipItem, styles.tooltipItemSlider)}
            style={{
              background: `linear-gradient(to left, ${hueBackgrounds[0]} 0px, ${hueBackgrounds[1]} 13px, ${hueBackgrounds[2]}, ${hueBackgrounds[3]}, ${hueBackgrounds[4]}, ${hueBackgrounds[5]}, ${hueBackgrounds[6]}, ${hueBackgrounds[7]}, ${hueBackgrounds[8]}, ${hueBackgrounds[9]}, ${hueBackgrounds[10]}, ${hueBackgrounds[11]} 137px, ${hueBackgrounds[12]} 100%)`,
            }}
            onClick={handleColorClick}
          >
            <div
              className={styles.tooltipItemSliderHandler}
              style={{
                left: `${Math.round((color / 360) * SLIDER_MAX_WIDTH)}px`,
              }}
              onPointerDown={handleColorMouseDown}
              onClick={handleClick}
            ></div>
          </div>

          <div className={styles.tooltipItem}>
            <span className={styles.tooltipItemLabel}>
              <Text
                id="paint.colorPicker.saturation"
                defaultMessage="Saturation"
              />
            </span>
            <span className={styles.tooltipItemReadout}>{Math.round(saturation * 100)}</span>
          </div>
          <div
            className={classNames(styles.tooltipItem, styles.tooltipItemSlider)}
            style={{
              background: `linear-gradient(to right, ${getColorObject(color, 0, brightness).hex} 0px, ${
                getColorObject(color, 1, brightness).hex
              } 100%)`,
            }}
            onClick={handleSaturationClick}
          >
            <div
              className={styles.tooltipItemSliderHandler}
              style={{
                left: `${Math.round(saturation * SLIDER_MAX_WIDTH)}px`,
              }}
              onPointerDown={handleSaturationMouseDown}
              onClick={handleClick}
            ></div>
          </div>

          <div className={styles.tooltipItem}>
            <span className={styles.tooltipItemLabel}>
              <Text
                id="paint.colorPicker.brightness"
                defaultMessage="Brightness"
              />
            </span>
            <span className={styles.tooltipItemReadout}>{Math.round(brightness * 100)}</span>
          </div>
          <div
            className={classNames(styles.tooltipItem, styles.tooltipItemSlider)}
            style={{
              background: `linear-gradient(to right, ${getColorObject(color, saturation, 0).hex} 0px, ${
                getColorObject(color, saturation, 1).hex
              } 100%)`,
            }}
            onClick={handleBrightnessClick}
          >
            <div
              className={styles.tooltipItemSliderHandler}
              style={{
                left: `${Math.round(brightness * SLIDER_MAX_WIDTH)}px`,
              }}
              onPointerDown={handleBrightnessMouseDown}
              onClick={handleClick}
            ></div>
          </div>

          <div className={classNames(styles.tooltipItem, styles.tooltipItemToolbar)}>
            <div
              className={classNames(styles.tooltipItemToolbarButton, {
                [styles.selected]: defaultColor.clear,
              })}
              onClick={handleClear}
            >
              <img
                src={clearIcon}
                className={styles.buttonIcon}
              />
            </div>
            <div
              className={classNames(styles.tooltipItemToolbarButton, {
                [styles.selected]: picking,
              })}
              onClick={handlePickingColor}
            >
              <img
                src={pickerIcon}
                className={styles.buttonIcon}
              />
            </div>
          </div>
        </>
      }
    >
      <div className={styles.colorPickerWrapper}>
        <div
          className={classNames(styles.colorSwatch, { [styles.colorSwatchOutline]: outline })}
          style={{
            background: defaultColor.clear ? 'var(--ui-white)' : getColorObject(color, saturation, brightness).hex,
          }}
        >
          {defaultColor.clear && <img src={clearIcon} />}
        </div>
        <div className={styles.pickerArrow}>▾</div>
      </div>
    </Tooltip>
  );
}
