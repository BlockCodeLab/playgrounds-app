import { useRef, useEffect } from 'preact/hooks';
import { useAppContext, useProjectContext, hideSplash, setFile } from '@blockcode/core';
import Vditor from 'vditor';
import DefaultConfig from './default-config';

import { Toolbox } from '../toolbox/toolbox';
import { scratchRender } from '../../lib/scratch-render';

import styles from './markdown-editor.module.css';

export function MarkdownEditor({ options, customRenders, onLoad, onInput }) {
  const ref = useRef();

  const { appState, splashVisible } = useAppContext();

  const { file } = useProjectContext();

  useEffect(() => {
    if (!ref.vditor) return;
    const { vditor } = ref.vditor;
    vditor.outline.toggle(vditor, appState.value?.outline);
  }, [appState.value?.outline, appState.value?.advancedMode]);

  useEffect(() => {
    if (ref.vditor && splashVisible.value) {
      ref.vditor.setValue(file.value.content);
      setTimeout(hideSplash, 500);
    }
  }, [splashVisible.value]);

  useEffect(() => {
    if (ref.current) {
      const vditor = new Vditor(ref.current, {
        ...DefaultConfig,
        ...options,
        cache: {
          id: `vditor-${file.value.id}`,
        },
        after() {
          vditor.setValue(file.value.content);
          vditor.focus();
          hideSplash();
          // 编辑器创建完成
          ref.vditor = vditor;
          onLoad?.(vditor);
        },
        input(content) {
          // 保存
          setFile({ content });
          onInput?.(content);
        },
        // 自定义渲染
        customRenders: [].concat(scratchRender, options?.customRenders, customRenders).filter(Boolean),
      });
      // 全局当前编辑器
      window.currentVditor = vditor;
    }

    return () => {
      ref.vditor?.destroy();
      ref.vditor = null;
      window.currentVditor = null;
    };
  }, [ref]);

  return (
    <div className={styles.editorWrapper}>
      <div className={styles.markdownWrapper}>
        <div ref={ref} />
      </div>

      <div className={styles.toolboxWrapper}>
        <Toolbox />
      </div>
    </div>
  );
}
