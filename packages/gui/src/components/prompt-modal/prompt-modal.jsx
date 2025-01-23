import { classNames } from '@blockcode/utils';
import { maybeTranslate, Text, Button, Modal } from '@blockcode/core';
import styles from './prompt-modal.module.css';
import { useCallback } from 'preact/hooks';

export function PromptModal({ title, label, content, redStyle, children, onClose, onSubmit }) {
  const handleSubmit = useCallback(() => {
    onSubmit();
    onClose();
  }, [onClose, onSubmit]);

  return (
    <Modal
      title={title}
      redStyle={redStyle}
      className={classNames(styles.promptModal, {
        [styles.wide]: content,
        [styles.auto]: children,
      })}
      onClose={onClose}
    >
      <div className={styles.promptContent}>
        {label && <div className={styles.label}>{label}</div>}

        {content ? (
          <div
            className={styles.content}
            dangerouslySetInnerHTML={{ __html: maybeTranslate(content) }}
          />
        ) : (
          <div className={styles.content}>{children}</div>
        )}

        <div className={styles.buttonRow}>
          {onSubmit ? (
            <>
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
            </>
          ) : (
            <Button
              className={styles.button}
              onClick={onClose}
            >
              <Text
                id="gui.prompt.close"
                defaultMessage="Close"
              />
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
