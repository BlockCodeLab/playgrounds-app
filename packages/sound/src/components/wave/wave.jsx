import { useRef, useEffect, useCallback } from 'preact/hooks';
import { classNames } from '@blockcode/utils';
import { useLocalesContext, useProjectContext, translate, maybeTranslate, setAsset } from '@blockcode/core';
import { loadSoundFromBlob } from '../../lib/load-sound';

import WaveSurfer from 'wavesurfer.js';
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.js';

import { Label, BufferedInput, Button } from '@blockcode/core';
import styles from './wave.module.css';

import recordIcon from '../selector/icons/icon-record.svg';
import playIcon from './icon-play.svg';
import stopIcon from './icon-stop.svg';

const waveRecorder = RecordPlugin.create();

let recordTimer;

export function Wave() {
  const ref = useRef();
  const playRef = useRef();
  const recordRef = useRef();

  const { translator } = useLocalesContext();
  const { asset } = useProjectContext();

  const sound = asset.value;
  const disabled = !sound || !/^audio\//.test(sound.type);

  useEffect(() => {
    if (!ref.ws) return;

    if (ref.ws.isPlaying()) {
      ref.ws.stop();
    }

    ref.ws.setTime(0);
    setTimeout(() => {
      ref.ws.setOptions({
        cursorColor: 'hsla(215, 100%, 65%, 0)',
        cursorWidth: 0,
      });
    });

    ref.ws.empty();
    if (sound?.sampleCount > 0) {
      ref.ws.load(`data:${sound.type};base64,${sound.data}`);
    }
    ref.record.sound = sound;

    if (playRef.current) {
      playRef.current.src = playIcon;
      playRef.current.title = translate('sound.play', 'Play', translator);
    }

    if (recordRef.current) {
      recordRef.current.src = recordIcon;
      recordRef.current.title = translate('sound.record', 'Record', translator);
    }
  }, [sound, disabled]);

  const handleChange = useCallback((key, value) => {
    setAsset({
      [key]: value,
    });
  }, []);

  const handlePlayOrStop = useCallback(() => {
    if (ref.ws) {
      if (ref.ws.isPlaying()) {
        ref.ws.stop();
      } else if (sound.sampleCount > 0) {
        ref.ws.play();
      }
    }
    if (recordRef.current) {
      setTimeout(() => {
        const recordButton = recordRef.current.parentElement.parentElement;
        recordButton.disabled = ref.ws.isPlaying();
        if (ref.ws.isPlaying()) {
          recordButton.classList.add(styles.groupButtonToggledOff);
        } else {
          recordButton.classList.remove(styles.groupButtonToggledOff);
        }
      });
    }
  }, [sound]);

  const handlePlay = useCallback(() => {
    if (playRef.current) {
      playRef.current.src = stopIcon;
      playRef.current.title = translate('sound.stop', 'Stop', translator);
    }
    if (ref.ws) {
      ref.ws.setOptions({
        cursorColor: 'hsla(215, 100%, 65%, 1)',
        cursorWidth: 1,
      });
    }
    if (recordRef.current) {
      const recordButton = recordRef.current.parentElement.parentElement;
      recordButton.disabled = false;
      recordButton.classList.remove(styles.groupButtonToggledOff);
    }
  }, []);

  const handlePause = useCallback(() => {
    if (playRef.current) {
      playRef.current.src = playIcon;
      playRef.current.title = translate('sound.play', 'Play', translator);
      if (ref.ws) {
        ref.ws.setTime(0);
        setTimeout(() => {
          ref.ws.setOptions({
            cursorColor: 'hsla(215, 100%, 65%, 0)',
            cursorWidth: 0,
          });
        });
      }
    }
    if (recordRef.current) {
      recordRef.current.src = recordIcon;
      recordRef.current.title = translate('sound.record', 'Record', translator);

      const recordButton = recordRef.current.parentElement.parentElement;
      recordButton.disabled = false;
      recordButton.classList.remove(styles.groupButtonToggledOff);
    }
  }, []);

  const handleSeeking = useCallback(() => {
    if (ref.ws && !ref.record.isRecording()) {
      ref.ws.setOptions({
        cursorColor: 'hsla(215, 100%, 65%, 1)',
        cursorWidth: 1,
      });
    }
  }, []);

  const handleRecord = useCallback(() => {
    if (recordRef.current) {
      recordRef.current.src = stopIcon;
      recordRef.current.title = translate('sound.stop', 'Stop', translator);
    }
    if (playRef.current) {
      const playButton = playRef.current.parentElement.parentElement;
      playButton.disabled = true;
      playButton.classList.add(styles.groupButtonToggledOff);
    }
  }, []);

  const handleRecordOrStop = useCallback(() => {
    if (ref.record) {
      if (ref.record.isRecording()) {
        ref.record.stopRecording();
        ref.record.stopMic();
        clearTimeout(recordTimer);
      } else {
        ref.record.startRecording();
        recordTimer = setTimeout(handleRecordOrStop, 10000);
      }
    }
  }, []);

  const handleRecordEnd = useCallback(async (blob) => {
    const asset = await loadSoundFromBlob(blob);
    setAsset(asset);

    if (playRef.current) {
      const playButton = playRef.current.parentElement.parentElement;
      playButton.disabled = false;
      playButton.classList.remove(styles.groupButtonToggledOff);
    }
  }, []);

  useEffect(() => {
    if (ref.current) {
      ref.ws = WaveSurfer.create({
        container: ref.current,
        dragToSeek: true,
        height: 'auto',
        waveColor: 'hsla(300, 48%, 50%, 1)',
        progressColor: 'hsla(300, 48%, 50%, 0.8)',
        cursorColor: 'hsla(215, 100%, 65%, 0)',
        cursorWidth: 0,
      });
      ref.record = ref.ws.registerPlugin(waveRecorder);
      ref.record.on('record-start', handleRecord);
      ref.record.on('record-end', handleRecordEnd);
      ref.ws.on('play', handlePlay);
      ref.ws.on('pause', handlePause);
      ref.ws.on('finish', handlePause);
      ref.ws.on('seeking', handleSeeking);
      if (sound?.sampleCount > 0) {
        ref.ws.empty();
        ref.ws.load(`data:${sound.type};base64,${sound.data}`);
      }
      ref.record.sound = sound;
    }
    return () => {
      if (ref.ws) {
        ref.ws.destroy();
      }
    };
  }, [ref]);

  return (
    <div
      className={classNames(styles.waveWrapper, {
        [styles.disabled]: disabled,
      })}
    >
      <div className={styles.row}>
        <div className={styles.group}>
          <Label text={translate('sound.sound', 'Sound')}>
            <BufferedInput
              disabled={disabled}
              className={styles.nameInput}
              placeholder={translate('sound.name', 'name')}
              onSubmit={(value) => handleChange('name', value)}
              value={disabled || !sound ? translate('sound.sound', 'Sound') : maybeTranslate(sound.name)}
            />
          </Label>
        </div>
      </div>

      <div className={styles.row}>
        <div
          ref={ref}
          className={classNames(styles.waveBoxWrapper, {
            [styles.hidden]: disabled,
          })}
        />
      </div>

      <div className={styles.row}>
        <Button
          className={classNames(styles.button, styles.playButton, {
            [styles.groupButtonToggledOff]: disabled,
          })}
          onClick={handlePlayOrStop}
        >
          <img
            ref={playRef}
            src={playIcon}
            className={styles.buttonIcon}
            title={translate('sound.play', 'Play')}
          />
        </Button>

        {sound?.record && (
          <Button
            className={classNames(styles.button, styles.recordButton, {
              [styles.groupButtonToggledOff]: disabled,
            })}
            onClick={handleRecordOrStop}
          >
            <img
              ref={recordRef}
              src={recordIcon}
              className={styles.buttonIcon}
              title={translate('sound.record', 'Record')}
            />
          </Button>
        )}
      </div>
    </div>
  );
}
