#include "tone.h"

#define ARTICULATION_MS (10)

const int Tone::FREQ[12] = {262, 277, 294, 311, 330, 349,
                            370, 392, 415, 440, 466, 494};
const char Tone::NOTE_NAMES[12][3] = {"c",  "c#", "d",  "d#", "e",  "f",
                                      "f#", "g",  "g#", "a",  "a#", "b"};

Tone::Tone(int pin, int ticks, int bpm)
    : _pin(pin), _ticks(ticks), _bpm(bpm), _octave(4), _duration(4),
      _playing(false) {
  pinMode(_pin, OUTPUT);
}

void Tone::stop() {
  _playing = false;
  noTone(_pin);
}

void Tone::play(const char *music) {
  if (!music || music[0] == '\0')
    return;

  // 初始化状态
  _octave = 4;
  _duration = 4;
  _playing = true;

  const char *start = music;
  const char *current = music;

  while (*current && _playing) {
    if (*current == ',' || *(current + 1) == '\0') {
      int noteLength = current - start;
      if (*(current + 1) == '\0' && *current != ',') {
        noteLength++;
      }

      if (noteLength > 0 && noteLength < 20) {
        char note[20];
        strncpy(note, start, noteLength);
        note[noteLength] = '\0';

        int freq = parseNote(note);
        int duration = (60000 / _bpm / _ticks) * _duration;

        if (freq > 0) {
          tone(_pin, freq, duration - ARTICULATION_MS);
          delay(duration);
        } else {
          delay(duration);
        }

        if (_playing) {
          noTone(_pin);
          delay(ARTICULATION_MS);
        }
      }
      start = current + 1;
    }
    current++;
  }

  stop();
}

int Tone::parseNote(const char *note) {
  if (!note || note[0] == '\0')
    return 0;

  const char *colon = strchr(note, ':');
  if (colon) {
    // 更新持续时间
    _duration = atoi(colon + 1);

    char notePart[20];
    int noteLen = colon - note;
    if (noteLen > 0 && noteLen < sizeof(notePart)) {
      strncpy(notePart, note, noteLen);
      notePart[noteLen] = '\0';
      return getFreq(notePart);
    }
    return 0;
  }

  return getFreq(note);
}

void Tone::parseNoteName(const char *note, char &baseNote, bool &sharp) {
  baseNote = '\0';
  sharp = false;

  if (!note || note[0] == '\0')
    return;

  // 基础音符
  if (note[0] >= 'a' && note[0] <= 'g') {
    baseNote = note[0];
  } else if (note[0] == 'r') {
    baseNote = 'r';
    return;
  } else {
    return;
  }

  int pos = 1;

  // 升降号处理
  if (note[pos] == '#' || note[pos] == 's') {
    sharp = true;
    pos++;
  } else if (note[pos] == 'b') {
    // 降号转换
    sharp = true;
    switch (baseNote) {
    case 'b':
      baseNote = 'a';
      break;
    case 'd':
      baseNote = 'c';
      break;
    case 'e':
      baseNote = 'd';
      break;
    case 'g':
      baseNote = 'f';
      break;
    case 'a':
      baseNote = 'g';
      break;
    default:
      sharp = false;
      break;
    }
    pos++;
  }

  // 八度解析 - 直接修改 _octave
  if (isdigit(note[pos])) {
    int newOctave = note[pos] - '0';
    if (newOctave >= 0 && newOctave <= 8) {
      _octave = newOctave;
    }
  }
}

int Tone::findNoteIndex(char baseNote, bool sharp) {
  char search[3] = {baseNote, '\0', '\0'};
  if (sharp) {
    search[1] = '#';
  }

  for (int i = 0; i < 12; i++) {
    if (NOTE_NAMES[i][0] == search[0] && NOTE_NAMES[i][1] == search[1]) {
      return i;
    }
  }

  return -1;
}

int Tone::getFreq(const char *note) {
  if (!note || note[0] == '\0' || note[0] == 'r')
    return 0;

  char baseNote;
  bool sharp;

  parseNoteName(note, baseNote, sharp);

  if (baseNote == '\0' || baseNote == 'r')
    return 0;

  int index = findNoteIndex(baseNote, sharp);
  if (index < 0 || index >= 12)
    return 0;

  int frequency = FREQ[index];
  int shift = _octave - 4;

  if (shift != 0) {
    frequency = (shift > 0) ? frequency << shift : frequency >> (-shift);
  }

  return frequency;
}
