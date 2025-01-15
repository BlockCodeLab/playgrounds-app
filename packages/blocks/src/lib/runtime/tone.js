import { sleepMs } from '@blockcode/utils';
import * as Music from './music';

const ARTICULATION_MS = 10;
const MIDDLE_FREQUENCIES = [440, 494, 262, 294, 330, 349, 392];
const MIDDLE_SHARPS_FREQUENCIES = [466, 0, 277, 311, 0, 370, 415];

export class Tone {
  constructor(option = {}) {
    this.ticks = option.ticks || 4;
    this.bpm = option.bpm || 120;
    this._type = option.type || 'sine';
    this._octave = 4;
    this._duration = 4;
    this._playing = false;
  }

  get Music() {
    return Music;
  }

  get duration() {
    return this._duration * (60000 / this.bpm / this.ticks);
  }

  _init() {
    if (this._audioContext) {
      this._clear();
    }
    this._audioContext = new AudioContext();
    this._oscillator = this._audioContext.createOscillator();
    this._oscillator.type = this._type;
    this._oscillator.connect(this._audioContext.destination);
  }

  _clear() {
    if (this._oscillator) {
      try {
        this._oscillator.stop();
      } catch (e) {}
      this._audioContext.close();
    }
    this._oscillator = null;
    this._audioContext = null;
  }

  stop() {
    this._playing = false;
    this._clear();
  }

  start() {
    this._init();
    this._oscillator.start();
    this._playing = true;
  }

  async play(musicStr) {
    this._octave = 4;
    this._duration = 4;

    const musicArr = musicStr.toLowerCase().split(',');

    this.start();
    for (const noteStr of musicArr) {
      if (!this._playing) break;
      const frequency = this._getFrequency(noteStr);
      await this._tone(frequency, this.duration);
    }
    this.stop();
  }

  async _tone(frequency, duration = -1) {
    if (!this._oscillator) return;
    this._oscillator.frequency.value = frequency;
    if (duration > 0) {
      duration -= ARTICULATION_MS;
      if (duration < 0) {
        duration = 10;
      }
      await sleepMs(duration);
      if (!this._oscillator) return;
      this._oscillator.frequency.value = 0;
      await sleepMs(ARTICULATION_MS);
    }
  }

  // noteStr = NOTE[octave][:duration]
  _getFrequency(noteStr) {
    const noteArr = noteStr.split(':');

    if (noteArr.length > 1) {
      const duration = parseInt(noteArr[1]);
      if (duration !== NaN) {
        this._duration = duration;
      }
    }

    const note = noteArr.length > 0 ? noteArr[0] : 'r';
    let noteIndex = note.charCodeAt(0) - 'a'.charCodeAt(0);

    // Like 'c4', 'c#', 'db'
    let sharp = false;
    if (note.length === 2) {
      const octave = parseInt(note[1]);
      if (octave !== NaN) {
        this._octave = octave;
      } else {
        sharp = true;
        if (note[1] === 'b' && noteIndex <= 6) {
          noteIndex -= 1;
        }
      }
    } else if (note.length === 3) {
      const octave = parseInt(note[2]);
      if (octave !== NaN) {
        this._octave = octave;
      }
      sharp = true;
      if (note[1] === 'b' && noteIndex <= 6) {
        noteIndex -= 1;
      }
    }

    let frequency = 0;
    if (noteIndex <= 6) {
      const shiftCount = self._octave - 4;
      if (sharp) {
        if (shiftCount > 0) {
          frequency = MIDDLE_SHARPS_FREQUENCIES[noteIndex] << shiftCount;
        } else {
          frequency = MIDDLE_SHARPS_FREQUENCIES[noteIndex] >> -shiftCount;
        }
      } else {
        if (shiftCount > 0) {
          frequency = MIDDLE_FREQUENCIES[noteIndex] << shiftCount;
        } else {
          frequency = MIDDLE_FREQUENCIES[noteIndex] >> -shiftCount;
        }
      }
    }
    return frequency;
  }
}
