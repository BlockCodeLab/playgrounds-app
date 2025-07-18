import { useEffect, useCallback } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { useAppContext, useProjectContext, setAlert, delAlert, Text } from '@blockcode/core';
import { CodeEditor } from '@blockcode/code';

let modifiedAlertId;

const hideAlert = () => delAlert('manual-coding');

const showAlert = () =>
  setAlert({
    id: 'manual-coding',
    mode: 'warn',
    message: (
      <Text
        id="blocks.alert.manualCoding"
        defaultMessage="Warning: Manual coding will be reverted when leaving Code tab."
      />
    ),
    onClose: hideAlert,
  });

export function CodeReview({
  onRegisterCompletionItems,
}) {
  const { tabIndex } = useAppContext();

  const { modified } = useProjectContext();

  const modifiedAlerted = useSignal(false);

  useEffect(() => {
    if (tabIndex.value === 1) {
      if (!modifiedAlerted.value) {
        modifiedAlerted.value = true;
        showAlert();
      }
    } else {
      modifiedAlerted.value = false;
    }
  }, [modified.value]);

  useEffect(() => {
    return () => {
      hideAlert();
    };
  }, []);

  return (
    <CodeEditor
      options={{
        minimap: {
          enabled: true,
        },
      }}
      onRegisterCompletionItems={onRegisterCompletionItems}
    />
  );
}
