import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { useRef, useEffect, useState } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { mime } from '@blockcode/utils';
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
    model.onDidChangeContent(() => setFile({ content: model.getValue() }));
  }
  const oldModel = editor.getModel();
  editor.setModel(model);
  oldModel.dispose();
  return extname;
};

export function CodeEditor({ readOnly, onLoading }) {
  const ref = useRef(null);

  const modelname = useSignal(null);

  const { file } = useProjectContext();

  useEffect(() => {
    ref.editor.updateOptions({ readOnly });
  }, [readOnly]);

  useEffect(() => {
    if (ref.editor) {
      const extname = mime.getExtension(file.value.type ?? 'text/plain');
      if (extname && modelname.value !== extname) {
        modelname.value = setModel(ref.editor, file.value);
      }
      ref.editor.getModel().setValue(file.value.content);
    }
  }, [file.value]);

  useEffect(async () => {
    if (ref.current) {
      ref.editor = await createEditor(ref.current);
      ref.editor.updateOptions({ readOnly });
      if (file.value) {
        modelname.value = setModel(ref.editor, file.value);
      }
      if (onLoading) {
        onLoading(ref.editor);
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
      className={styles.editorWrapper}
    ></div>
  );
}
