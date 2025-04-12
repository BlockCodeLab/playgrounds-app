import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

import { useRef, useCallback, useEffect } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { mime, classNames } from '@blockcode/utils';
import { useLocalesContext, useProjectContext, setFile } from '@blockcode/core';
import { createEditor } from '../../lib/create-monaco';
import { registerCompletionProvider } from '../../lib/register-completion-provider';
import styles from './code-editor.module.css';

let completionProvider;

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
      setFile({ content });
    });
  }
  const oldModel = editor.getModel();
  editor.setModel(model);
  oldModel.dispose();
  return extname;
};

export function CodeEditor({ className, options, readOnly, onLoad, onRegisterCompletionItems }) {
  const { language } = useLocalesContext();

  const { file, modified } = useProjectContext();

  const ref = useRef(null);

  const modelname = useSignal(null);

  const updateContent = useCallback(() => {
    if (!ref.editor) return;
    const extname = mime.getExtension(file.value.type ?? 'text/plain');
    if (extname && modelname.value !== extname) {
      modelname.value = setModel(ref.editor, file.value);
    }
    const model = ref.editor.getModel();
    model.setValue(file.value.content);
  }, []);

  useEffect(() => {
    if (!ref.editor) return;
    ref.editor.updateOptions({ readOnly });
  }, [ref.editor, readOnly]);

  useEffect(async () => {
    if (!ref.editor) return;

    // 过去当前语言的自动完成设置
    const languageId = ref.editor.getModel().getLanguageId();
    const completionItems = onRegisterCompletionItems?.(languageId);
    if (!completionItems) return;

    // 取消之前的自动完成设置
    completionProvider?.dispose?.();
    // 设置当前语言的自动完成设置
    completionProvider = await registerCompletionProvider(languageId, completionItems);
  }, [ref.editor, modelname.value, language.value, onRegisterCompletionItems]);

  // 切换文件时更新
  useEffect(updateContent, [file.value]);

  // 只读时自动更新
  useEffect(() => {
    if (!readOnly) return;
    updateContent();
  }, [readOnly, modified.value]);

  useEffect(async () => {
    if (ref.current) {
      ref.editor = await createEditor(ref.current, options);
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
