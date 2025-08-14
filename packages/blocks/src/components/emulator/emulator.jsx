import { useRef, useEffect } from 'preact/hooks';
import { Konva } from '@blockcode/utils';
import { useAppContext, setAppState } from '@blockcode/core';
import styles from './emulator.module.css';

export function Emulator({ id, zoom, width, height, onRuntime }) {
  const ref = useRef(null);

  const { splashVisible } = useAppContext();

  useEffect(() => {
    if (ref.stage) {
      ref.stage.width(width);
      ref.stage.height(height);
      ref.stage.offsetX(-width / 2);
      ref.stage.offsetY(height / 2);
    }
  }, [width, height]);

  useEffect(() => {
    if (splashVisible.value) {
      setAppState('running', false);
    }
  }, [splashVisible.value]);

  useEffect(() => {
    if (ref.stage) {
      ref.stage.content.style.zoom = zoom;
    }
  }, [ref.stage, zoom]);

  useEffect(() => {
    if (ref.current) {
      ref.stage = new Konva.Stage({
        container: ref.current,
        width,
        height,
        offsetX: -width / 2,
        offsetY: height / 2,
        scaleY: -1, // 转换Y轴方向，使Y轴往上为正
      });
      ref.stage.content.style.position = 'absolute';
      ref.stage.content.style.right = 0;
      ref.stage.content.style.top = 0;
      onRuntime(ref.stage);
    }
    return () => {
      ref.stage.destroy();
      ref.stage = null;
    };
  }, [ref]);

  return (
    <div
      id={id}
      className={styles.emulator}
      ref={ref}
    />
  );
}
