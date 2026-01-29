import '@xterm/xterm/css/xterm.css';

import { useRef, useEffect, useCallback } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { keyMirror } from '@blockcode/utils';
import { useAppContext, translate, setAlert, setAppState } from '@blockcode/core';

import { Text, ToggleButtons, BufferedInput, Button, Dropdown, Keys } from '@blockcode/core';
import { Terminal as Xterm } from '@xterm/xterm';
import { WebglAddon } from '@xterm/addon-webgl';
import { FitAddon } from '@xterm/addon-fit';
import { defaultOptions } from './terminal-options';

import styles from './terminal.module.css';
import sendIcon from './icon-send.svg';

const InputModes = keyMirror({
  REPL: null,
  Text: null,
  HEX: null,
});

export function Terminal({ compactMode, textValue, disabledREPL, options }) {
  const ref = useRef(null);
  const inputRef = useRef(null);

  const { appState } = useAppContext();

  const textBuffer = useSignal(textValue);

  const terminalMode = useSignal(
    typeof textBuffer.value === 'string' || compactMode || disabledREPL ? InputModes.Text : InputModes.REPL,
  );

  useEffect(() => {
    if (ref.xterm && typeof textBuffer.value === 'string') {
      ref.xterm.write(textValue.replace(textBuffer.value, ''));
      textBuffer.value = textValue;
    }
  }, [textValue]);

  useEffect(() => {
    if (ref.xterm && !appState.value?.terminalCache) {
      ref.xterm.writeln(''); // newline
      setTimeout(() => ref.xterm.clear(), 0);
    }
  }, [appState.value?.terminalCache]);

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

  // 缓存
  const handleTermCache = useCallback((data) => {
    const cache = appState.value?.terminalCache ?? Uint8Array.from([]);
    const newCache = new Uint8Array(cache.length + data.length);
    newCache.set(cache);
    newCache.set(data, cache.length);
    setAppState('terminalCache', newCache);
  }, []);

  // 写入模拟终端
  const handleTermData = useCallback((data) => {
    ref.xterm?.write(data);
  }, []);

  const bindDevice = useCallback(() => {
    if (typeof textBuffer.value === 'string') return;
    const device = appState.value?.device;
    const xterm = ref.xterm;
    if (device && xterm) {
      const dataEvent = xterm.onData((data) => device.serial.write(data));
      device.on('data', handleTermData);
      device.on('disconnect', () => {
        dataEvent.dispose();
        device.off('data', handleTermData);
      });
      if (!appState.value?.terminalCache) {
        device.on('data', handleTermCache);
        device.on('disconnect', () => {
          setAppState('terminalCache', null);
          device.off('data', handleTermCache);
        });
      }
    }
  }, [textValue]);

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

  const handleClean = useCallback(() => {
    setAppState('terminalCache', null);
  }, []);

  useEffect(() => {
    if (typeof textBuffer.value === 'string') return;
    if (!ref.xterm) return;

    ref.xterm.reset();
    if (!appState.value?.device) {
      ref.xterm.write(translate('code.terminalWaitforConnect', 'Waiting for device connection...'));
      return;
    }

    if (terminalMode.value === InputModes.REPL) {
      ref.xterm.focus();
      ref.xterm.options.cursorStyle = 'block';
      ref.xterm.options.cursorBlink = true;
    }
    bindDevice();
  }, [appState.value?.device]);

  useEffect(() => {
    if (ref.current) {
      const theme = Object.assign({}, defaultOptions.theme, options?.theme);
      const xterm = new Xterm(Object.assign({}, defaultOptions, options, { theme }));
      xterm.open(ref.current);

      // 如果支持 WebGL 则启用
      try {
        const webglAddon = new WebglAddon();
        xterm.loadAddon(webglAddon);
      } catch (err) {}

      const fitAddon = new FitAddon();
      xterm.loadAddon(fitAddon);

      if (typeof textBuffer.value === 'string') {
        xterm.write(textValue);
      } else if (!appState.value?.device) {
        xterm.write(translate('code.terminalWaitforConnect', 'Waiting for device connection...'));
      } else if (appState.value?.terminalCache) {
        xterm.write(appState.value.terminalCache);
      }

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

      {typeof textBuffer.value !== 'string' && (
        <div className={styles.inputWrapper}>
          {compactMode !== true && (
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
                compactMode !== true && [
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

            {compactMode !== true && (
              <Button
                disabled={!appState.value?.device}
                className={styles.cleanButton}
                onClick={handleClean}
              >
                <Text
                  id="code.terminalClean"
                  defaultMessage="Clean"
                />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
