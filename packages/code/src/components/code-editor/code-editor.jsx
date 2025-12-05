import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

import { useRef, useEffect } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { mime, classNames } from '@blockcode/utils';
import { useLocalesContext, useProjectContext, setFile } from '@blockcode/core';
import { createEditor } from '../../lib/create-monaco';
import { registerCompletionProvider } from '../../lib/register-completion-provider';
import styles from './code-editor.module.css';

const setModel = (editor, file, keyName = 'content') => {
  const extname = mime.getExtension(file.type ?? 'text/plain');
  const fileUri = monaco.Uri.file(`${editor.getId()}/${file.id}.${extname}`);
  const modelId = fileUri.toString();
  let model = monaco.editor.getModel(modelId);
  if (!model) {
    model = monaco.editor.createModel(file[keyName], undefined, fileUri);
    model;
    model.onDidChangeContent(() => {
      if (editor.getRawOptions().readOnly) return;
      const content = model.getValue();
      setFile({ [keyName]: content });
    });
  }
  const oldModel = editor.getModel();
  editor.setModel(model);
  oldModel.dispose();
  return extname;
};

const updateContent = (editor, modelname, file, keyName = 'content') => {
  if (!editor || !file) return;
  const extname = mime.getExtension(file.type ?? 'text/plain');
  if (extname && modelname !== extname) {
    modelname = setModel(editor, file, keyName);
  }
  if (file[keyName]) {
    const model = editor.getModel();
    model.setValue(file[keyName]);
  }
  return modelname;
};

export function CodeEditor({ className, keyName, options, readOnly, onLoad, onRegisterCompletionItems }) {
  const { language } = useLocalesContext();

  const { file, modified } = useProjectContext();

  const ref = useRef(null);

  const modelname = useSignal(null);

  const completionProvider = useSignal(null);

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
    completionProvider.value?.dispose();
    // 设置当前语言的自动完成设置
    completionProvider.value = await registerCompletionProvider(languageId, completionItems);
  }, [ref.editor, modelname.value, language.value, onRegisterCompletionItems]);

  // 切换文件时更新
  useEffect(() => {
    modelname.value = updateContent(ref.editor, modelname.value, file.value, keyName);
  }, [keyName, file.value]);

  // 只读时自动更新
  useEffect(() => {
    if (!readOnly) return;
    modelname.value = updateContent(ref.editor, modelname.value, file.value, keyName);
  }, [readOnly, keyName, modified.value]);

  useEffect(async () => {
    if (ref.current) {
      ref.editor = await createEditor(ref.current, options);
      if (file.value) {
        modelname.value = setModel(ref.editor, file.value, keyName);
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
    />
  );
}
