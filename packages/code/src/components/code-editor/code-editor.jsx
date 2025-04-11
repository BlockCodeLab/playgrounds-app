import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

import { useRef, useCallback, useEffect } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { mime, classNames } from '@blockcode/utils';
import { useProjectContext, setFile } from '@blockcode/core';
import createEditor from '../../lib/create-monaco';
import styles from './code-editor.module.css';

const setModel = (editor, file) => {
  if (!file) return;
  const extname = mime.getExtension(file.type ?? 'text/plain');
  const fileUri = monaco.Uri.file(`${file.name}.${extname}`);
  const modelId = fileUri.toString();
  let model = monaco.editor.getModel(modelId);
  if (!model) {
    model = monaco.editor.createModel(file.content, undefined, fileUri);
    model.onDidChangeContent(() => {
      if (editor.getRawOptions().readOnly) return;
      const content = model.getValue();
      onChange?.(content);
      setFile({ content });
    });
  }
  const oldModel = editor.getModel();
  editor.setModel(model);
  oldModel.dispose();
  return extname;
};

export function CodeEditor({ className, readOnly, fontSize, onLoad }) {
  const ref = useRef(null);

  const modelname = useSignal(null);

  const { file, modified } = useProjectContext();

  const updateContent = useCallback(() => {
    if (ref.editor) {
      const extname = mime.getExtension(file.value.type ?? 'text/plain');
      if (extname && modelname.value !== extname) {
        modelname.value = setModel(ref.editor, file.value);
      }
      const model = ref.editor.getModel();
      model.setValue(file.value.content);
    }
  }, []);

  useEffect(() => {
    if (ref.editor) {
      ref.editor.updateOptions({ fontSize });
    }
  }, [fontSize]);

  useEffect(() => {
    if (ref.editor) {
      ref.editor.updateOptions({ readOnly });
    }
  }, [readOnly]);

  // 切换文件时更新
  useEffect(updateContent, [file.value]);

  // 只读时自动更新
  useEffect(() => {
    if (readOnly) {
      updateContent();
    }
  }, [readOnly, modified.value]);

  useEffect(async () => {
    if (ref.current) {
      ref.editor = await createEditor(ref.current, {
        fontSize: fontSize ?? 16,
        readOnly: readOnly ?? false,
      });
      if (file.value) {
        modelname.value = setModel(ref.editor, file.value);
        ref.editor.getModel().setValue(file.value.content);
      }
      if (onLoad) {
        onLoad(ref.editor);
      }
    }
    return () => {
      if (ref.editor) {
        ref.editor.dispose();
        ref.editor = null;
      }
    };
  }, [ref]);

  return (
    <div
      ref={ref}
      className={classNames(styles.editorWrapper, className)}
    ></div>
  );
}
