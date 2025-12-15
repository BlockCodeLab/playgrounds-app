import '@xterm/xterm/css/xterm.css';

import { useRef, useEffect, useCallback } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { keyMirror } from '@blockcode/utils';
import {
  useAppContext,
  translate,
  setAlert,
  Text,
  ToggleButtons,
  BufferedInput,
  Button,
  Dropdown,
  Keys,
} from '@blockcode/core';
import { Terminal as Xterm } from '@xterm/xterm';
import { WebglAddon } from '@xterm/addon-webgl';
import { FitAddon } from '@xterm/addon-fit';
import { defaultOptions } from './terminal-options';

import styles from './terminal.module.css';
import sendIcon from './icon-send.svg';

const webglAddon = new WebglAddon();
const fitAddon = new FitAddon();

const InputModes = keyMirror({
  REPL: null,
  Text: null,
  HEX: null,
});

export function Terminal({ miniMode, disabledREPL, options }) {
  const ref = useRef(null);
  const inputRef = useRef(null);

  const { appState } = useAppContext();

  const terminalMode = useSignal(miniMode || disabledREPL ? InputModes.Text : InputModes.REPL);

  const handleModeChange = useCallback((mode) => {
    terminalMode.value = mode;
    if (ref.xterm) {
      if (mode === InputModes.REPL) {
        ref.xterm.focus();
        ref.xterm.options.cursorStyle = 'block';
        ref.xterm.options.cursorBlink = !!appState.value?.device;
        ref.xterm.options.disableStdin = false;
        inputRef.current.base.value = '';
      } else {
        ref.xterm.blur();
        ref.xterm.options.cursorStyle = 'bar';
        ref.xterm.options.cursorBlink = false;
        ref.xterm.options.disableStdin = true;
      }
    }
  }, []);

  const handleTermData = useCallback((data) => ref.xterm?.write(data), []);

  const bindDevice = useCallback(() => {
    const device = appState.value?.device;
    const xterm = ref.xterm;
    if (device && xterm) {
      const dataEvent = xterm.onData((data) => device.serial.write(data));
      device.on('data', handleTermData);
      device.on('disconnect', () => {
        dataEvent.dispose();
        device.off('data', handleTermData);
      });
    }
  }, []);

  const wrapSendValue = useCallback(
    (value) => () => {
      appState.value.device?.serial.write(value);
      if (terminalMode.value === InputModes.REPL) {
        ref.xterm.focus();
      }
    },
    [],
  );

  const handleSubmit = useCallback((value, crlf) => {
    if (!value) return;

    if (terminalMode.value === InputModes.REPL) {
      crlf = true;
    }

    if (terminalMode.value === InputModes.HEX) {
      const hex = value.replace(/\s+/g, '');
      if (/^[0-9A-Fa-f]+$/.test(hex) && hex.length % 2 === 0) {
        const data = [];
        for (let i = 0; i < hex.length; i = i + 2) {
          data.push(parseInt(hex.substring(i, i + 2), 16));
        }
        if (crlf === true) {
          data.push(0x0d, 0x0a);
        }
        value = Uint8Array.from(data);
      } else {
        setAlert(
          {
            mode: 'warn',
            message: translate('code.terminalHexError', 'HEX data format error.'),
          },
          2000,
        );
        return;
      }
    } else if (crlf === true) {
      value += '\r\n';
    }
    appState.value?.device?.serial.write(value, typeof value === 'string' ? 'text' : 'binary');
  }, []);

  const handleSend = useCallback((value) => {
    inputRef.current.base.blur();
    handleSubmit(inputRef.current.base.value);
    inputRef.current.base.focus();
  }, []);

  const handleSendEnter = useCallback(() => {
    inputRef.current.base.blur();
    handleSubmit(inputRef.current.base.value, true);
    inputRef.current.base.focus();
  }, []);

  useEffect(() => {
    if (!appState.value?.device) return;
    if (!ref.xterm) return;
    if (terminalMode.value === InputModes.REPL) {
      ref.xterm.focus();
      ref.xterm.options.cursorStyle = 'block';
      ref.xterm.options.cursorBlink = true;
    }
    bindDevice();
  }, [appState.value?.device]);

  useEffect(() => {
    if (ref.current) {
      const xterm = new Xterm(Object.assign(options || {}, defaultOptions));
      xterm.open(ref.current);
      xterm.loadAddon(webglAddon);
      xterm.loadAddon(fitAddon);

      fitAddon.fit();
      ref.xterm = xterm;
      ref.current.style.backgroundColor = xterm.options.theme.background;

      ref.resizeObserver = new ResizeObserver(() => fitAddon.fit());
      ref.resizeObserver.observe(ref.current);

      if (terminalMode.value === InputModes.REPL) {
        ref.xterm.focus();
        ref.xterm.options.cursorStyle = 'block';
        ref.xterm.options.cursorBlink = !!appState.value?.device;
        ref.xterm.options.disableStdin = false;
      }
      bindDevice();
    }
    return () => {
      if (ref.xterm) {
        ref.xterm.clear();
        ref.xterm.dispose();
        ref.xterm = null;
      }
    };
  }, []);

  return (
    <div className={styles.terminalWrapper}>
      <div
        ref={ref}
        className={styles.terminal}
      />

      <div className={styles.inputWrapper}>
        {!miniMode && (
          <ToggleButtons
            items={[
              !disabledREPL && {
                title: translate('code.terminalMode.repl', 'REPL'),
                value: InputModes.REPL,
              },
              {
                title: translate('code.terminalMode.hex', 'HEX'),
                value: InputModes.HEX,
              },
              {
                title: translate('code.terminalMode.text', 'Text'),
                value: InputModes.Text,
              },
            ].filter(Boolean)}
            value={terminalMode.value}
            onChange={handleModeChange}
          />
        )}

        <BufferedInput
          autoClear
          enterSubmit
          ref={inputRef}
          disabled={terminalMode.value === InputModes.REPL || !appState.value?.device}
          forceFocus={terminalMode.value !== InputModes.REPL}
          className={styles.input}
          onSubmit={handleSubmit}
        />

        <div className={styles.buttonWrapper}>
          <Button
            disabled={terminalMode.value === InputModes.REPL || !appState.value?.device}
            className={styles.sendButton}
            onClick={handleSend}
          >
            <img
              className={styles.icon}
              src={sendIcon}
            />
            <Text
              id="code.terminalSend"
              defaultMessage="Send"
            />
          </Button>
          <Dropdown
            placement="top-end"
            className={styles.dropdownButton}
            iconClassName={styles.dropdownIcon}
            items={[
              !miniMode && [
                {
                  label: translate('code.terminalSendChar', 'Send {char}', { char: 'Ctrl+A' }),
                  disabled: !appState.value?.device,
                  onClick: wrapSendValue(String.fromCharCode(1)),
                },
                {
                  label: translate('code.terminalSendChar', 'Send {char}', { char: 'Ctrl+B' }),
                  disabled: !appState.value?.device,
                  onClick: wrapSendValue(String.fromCharCode(2)),
                },
                {
                  label: translate('code.terminalSendChar', 'Send {char}', { char: 'Ctrl+C' }),
                  disabled: !appState.value?.device,
                  onClick: wrapSendValue(String.fromCharCode(3)),
                },
                {
                  label: translate('code.terminalSendChar', 'Send {char}', { char: 'Ctrl+D' }),
                  disabled: !appState.value?.device,
                  onClick: wrapSendValue(String.fromCharCode(4)),
                },
                {
                  label: translate('code.terminalSendChar', 'Send {char}', { char: 'Ctrl+E' }),
                  disabled: !appState.value?.device,
                  onClick: wrapSendValue(String.fromCharCode(5)),
                },
              ],
              [
                {
                  label: translate('code.terminalSendEnter', 'Send with Enter'),
                  hotkey: [Keys.CONTROL, Keys.ENTER],
                  disabled: terminalMode.value === InputModes.REPL || !appState.value?.device,
                  onClick: handleSendEnter,
                },
              ],
            ].filter(Boolean)}
          />
        </div>
      </div>
    </div>
  );
}
