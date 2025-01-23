import { useRef, useEffect, useCallback } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { classNames } from '@blockcode/utils';

import { Text, Button, Modal, BufferedInput } from '@blockcode/core';
import styles from './data-prompt-modal.module.css';

export function DataPromptModal({
  title,
  label,
  defaultValue,
  enableLocalVariable,
  showListMessage,
  showVariableOptions,
  showCloudOption,
  onSubmit,
  onClose,
}) {
  const ref = useRef(null);

  const dataValue = useSignal(defaultValue);
  const options = useSignal({
    scope: 'global',
    isCloud: false,
  });

  const handleSubmit = useCallback(() => {
    onSubmit(dataValue.value, options.value);
  }, [onSubmit]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Enter') {
        onSubmit(ref.current.base.value, options.value);
      }
    },
    [onClose, onSubmit],
  );

  useEffect(() => {
    if (ref.current) {
      ref.current.base.focus();
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [ref]);

  return (
    <Modal
      title={title}
      className={styles.promptModal}
      onClose={onClose}
    >
      <div className={styles.promptContent}>
        <div className={styles.label}>{label}</div>
        <BufferedInput
          autoFocus
          forceFocus
          ref={ref}
          className={styles.variableNameTextInput}
          defaultValue={defaultValue}
          onSubmit={useCallback((val) => (dataValue.value = val), [])}
        />
        {showVariableOptions && (
          <div>
            {enableLocalVariable ? (
              <div className={styles.options}>
                <label>
                  <input
                    checked={options.value.scope === 'global'}
                    name="variableScopeOption"
                    type="radio"
                    value="global"
                    onChange={useCallback(() => (options.value.scope = 'global'), [])}
                  />
                  <Text
                    id="blocks.dataPrompt.forAllTargets"
                    defaultMessage="For all targets"
                  />
                </label>
                <label>
                  <input
                    checked={options.value.scope === 'local'}
                    name="variableScopeOption"
                    type="radio"
                    value="local"
                    onChange={useCallback(() => (options.value.scope = 'local'), [])}
                  />
                  <Text
                    id="blocks.dataPrompt.forThisTarget"
                    defaultMessage="For this target only"
                  />
                </label>
              </div>
            ) : (
              <div className={styles.infoMessage}>
                {showListMessage ? (
                  <Text
                    id={'blocks.dataPrompt.listAvailableToAllTargets'}
                    defaultMessage="This list will be available to all targets."
                  />
                ) : (
                  <Text
                    id={'blocks.dataPrompt.availableToAllTargets'}
                    defaultMessage="This variable will be available to all targets."
                  />
                )}
              </div>
            )}
          </div>
        )}

        <div className={styles.buttonRow}>
          <Button
            className={styles.button}
            onClick={onClose}
          >
            <Text
              id="blocks.prompt.cancel"
              defaultMessage="Cancel"
            />
          </Button>
          <Button
            className={classNames(styles.button, styles.okButton)}
            onClick={handleSubmit}
          >
            <Text
              id="blocks.prompt.ok"
              defaultMessage="OK"
            />
          </Button>
        </div>
      </div>
    </Modal>
  );
}
