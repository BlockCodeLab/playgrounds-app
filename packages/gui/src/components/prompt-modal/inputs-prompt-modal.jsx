import { useCallback, useEffect } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { classNames } from '@blockcode/utils';
import { maybeTranslate, Text, BufferedInput, Button, Modal } from '@blockcode/core';
import styles from './prompt-modal.module.css';

export function InputsPromptModal({ title, inputItems, content, onClose, onSubmit }) {
  const data = useSignal(Object.fromEntries(inputItems.map(({ name, defaultValue }) => [name, defaultValue])));

  const handleKeyDown = useCallback(
    (e) => {
      e.stopPropagation();
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  const handleSubmit = useCallback(() => {
    onSubmit(data.value);
    onClose();
  }, [onClose, onSubmit]);

  const wrapInputSubmit = useCallback(
    (name) => (value) => {
      data.value = {
        ...data.value,
        [name]: value,
      };
    },
    [],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <Modal
      title={title}
      className={styles.promptModal}
      onClose={onClose}
    >
      <div className={styles.promptContent}>
        {inputItems.map(({ name, label, placeholder, defaultValue }, index) => (
          <>
            {label && <div className={classNames(styles.label, styles.inputLabel)}>{label}</div>}
            <BufferedInput
              key={index}
              autoFocus={index === 0}
              className={styles.textInput}
              placeholder={maybeTranslate(placeholder)}
              defaultValue={defaultValue}
              onSubmit={wrapInputSubmit(name)}
            />
          </>
        ))}

        {content && (
          <div
            className={styles.content}
            dangerouslySetInnerHTML={{ __html: maybeTranslate(content) }}
          />
        )}

        <div className={styles.buttonRow}>
          <Button
            className={styles.button}
            onClick={onClose}
          >
            <Text
              id="gui.prompt.cancel"
              defaultMessage="Cancel"
            />
          </Button>
          <Button
            className={classNames(styles.button, styles.okButton)}
            onClick={handleSubmit}
          >
            <Text
              id="gui.prompt.ok"
              defaultMessage="OK"
            />
          </Button>
        </div>
      </div>
    </Modal>
  );
}
