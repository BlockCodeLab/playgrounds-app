import { useRef, useEffect, useCallback } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { classNames, keyMirror } from '@blockcode/utils';
import { ScratchBlocks } from '../../lib/scratch-blocks';
import myBlocksConfig from './myblock-config';

import { Text, Button, Modal } from '@blockcode/core';
import styles from './myblock-prompt-modal.module.css';

import booleanInputIcon from './icons/icon-boolean-input.svg';
import textInputIcon from './icons/icon-text-input.svg';
import labelIcon from './icons/icon-label.svg';

export function MyBlockPromptModal({ mutator, enableTypes, enableWarp, onClose, onSubmit }) {
  const ref = useRef(null);

  const blockWarp = useSignal(false);

  const handleChangeType = () => {};

  const handleAddLabel = useCallback(() => {
    if (ref.mutationRoot) {
      ref.mutationRoot.addLabelExternal();
    }
  }, []);

  const handleAddBoolean = useCallback(() => {
    if (ref.mutationRoot) {
      ref.mutationRoot.addBooleanExternal();
    }
  }, []);

  const handleAddTextNumber = useCallback(() => {
    if (ref.mutationRoot) {
      ref.mutationRoot.addStringNumberExternal();
    }
  }, []);

  const handleAddText = useCallback(() => {
    if (ref.mutationRoot) {
      ref.mutationRoot.addStringExternal();
    }
  }, []);

  const handleAddNumber = useCallback(() => {
    if (ref.mutationRoot) {
      ref.mutationRoot.addNumberExternal();
    }
  }, []);

  const handleSetWarp = useCallback(() => {
    const isWarp = !ref.mutationRoot.getWarp();
    ref.mutationRoot.setWarp(isWarp);
    blockWarp.value = isWarp;
  }, []);

  const handleSubmit = useCallback(() => {
    onSubmit(ref.mutationRoot?.mutationToDom?.(true));
  }, [onSubmit]);

  useEffect(() => {
    if (ref.current) {
      const oldDefaultToolbox = ScratchBlocks.Blocks.defaultToolbox;
      ScratchBlocks.Blocks.defaultToolbox = null;
      ref.workspace = ScratchBlocks.inject(
        ref.current,
        Object.assign({}, myBlocksConfig, {
          media: './assets/blocks-media/',
        }),
      );
      ScratchBlocks.Blocks.defaultToolbox = oldDefaultToolbox;

      // Create the procedure declaration block for editing the mutation.
      ref.mutationRoot = ref.workspace.newBlock('procedures_declaration');
      // Make the declaration immovable, undeletable and have no context menu
      ref.mutationRoot.setMovable(false);
      ref.mutationRoot.setDeletable(false);
      ref.mutationRoot.contextMenu = false;

      ref.workspace.addChangeListener(() => {
        ref.mutationRoot.onChangeFn();
        // Keep the block centered on the workspace
        const metrics = ref.workspace.getMetrics();
        const { x, y } = ref.mutationRoot.getRelativeToSurfaceXY();
        const dy = metrics.viewHeight / 2 - ref.mutationRoot.height / 2 - y;
        let dx = metrics.viewWidth / 2 - ref.mutationRoot.width / 2 - x;
        // If the procedure declaration is wider than the view width,
        // keep the right-hand side of the procedure in view.
        if (ref.mutationRoot.width > metrics.viewWidth) {
          dx = metrics.viewWidth - ref.mutationRoot.width - x;
        }
        ref.mutationRoot.moveBy(dx, dy);
      });
      ref.mutationRoot.domToMutation(mutator);
      ref.mutationRoot.initSvg();
      ref.mutationRoot.render();
      blockWarp.value = ref.mutationRoot.getWarp();
      // Allow the initial events to run to position this block, then focus.
      setTimeout(() => {
        ref.mutationRoot.focusLastEditor_();
      });
    }
    return () => {
      if (ref.workspace) {
        ref.workspace.dispose();
        ref.workspace = null;
      }
    };
  }, [ref]);

  return (
    <Modal
      title={
        <Text
          id="blocks.myBlockPrompt.title"
          defaultMessage="Make a Block"
        />
      }
      className={styles.promptModal}
      onClose={onClose}
    >
      <div
        ref={ref}
        className={styles.workspace}
      />
      <div className={styles.body}>
        <div className={styles.optionsRow}>
          {enableTypes ? (
            <>
              <div
                role="button"
                className={styles.optionCard}
                onClick={handleAddNumber}
              >
                <img
                  className={styles.optionIcon}
                  src={textInputIcon}
                />
                <div className={styles.optionTitle}>
                  <Text
                    id="blocks.myBlockPrompt.addAnInput"
                    defaultMessage="Add an input"
                  />
                </div>
                <div className={styles.optionDescription}>
                  <Text
                    id="blocks.myBlockPrompt.numberType"
                    defaultMessage="number"
                  />
                </div>
              </div>
              <div
                role="button"
                className={styles.optionCard}
                onClick={handleAddText}
              >
                <img
                  className={styles.optionIcon}
                  src={textInputIcon}
                />
                <div className={styles.optionTitle}>
                  <Text
                    id="blocks.myBlockPrompt.addAnInput"
                    defaultMessage="Add an input"
                  />
                </div>
                <div className={styles.optionDescription}>
                  <Text
                    id="blocks.myBlockPrompt.textType"
                    defaultMessage="text"
                  />
                </div>
              </div>
            </>
          ) : (
            <div
              role="button"
              className={styles.optionCard}
              onClick={handleAddTextNumber}
            >
              <img
                className={styles.optionIcon}
                src={textInputIcon}
              />
              <div className={styles.optionTitle}>
                <Text
                  id="blocks.myBlockPrompt.addAnInput"
                  defaultMessage="Add an input"
                />
              </div>
              <div className={styles.optionDescription}>
                <Text
                  id="blocks.myBlockPrompt.numberTextType"
                  defaultMessage="number or text"
                />
              </div>
            </div>
          )}
          <div
            role="button"
            className={styles.optionCard}
            onClick={handleAddBoolean}
          >
            <img
              className={styles.optionIcon}
              src={booleanInputIcon}
            />
            <div className={styles.optionTitle}>
              <Text
                id="blocks.myBlockPrompt.addAnInput"
                defaultMessage="Add an input"
              />
            </div>
            <div className={styles.optionDescription}>
              <Text
                id="blocks.myBlockPrompt.booleanType"
                defaultMessage="boolean"
              />
            </div>
          </div>
          <div
            role="button"
            className={styles.optionCard}
            onClick={handleAddLabel}
          >
            <img
              className={styles.optionIcon}
              src={labelIcon}
            />
            <div className={styles.optionTitle}>
              <Text
                id="blocks.myBlockPrompt.addALabel"
                defaultMessage="Add a label"
              />
            </div>
          </div>
        </div>
        {enableWarp && (
          <div className={styles.checkboxRow}>
            <label>
              <input
                checked={blockWarp.value}
                type="checkbox"
                onChange={handleSetWarp}
              />
              <Text
                id="blocks.myBlockPrompt.warpLabel"
                defaultMessage="Run Turbo Mode"
              />
            </label>
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
