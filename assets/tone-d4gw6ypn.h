#pragma once
#include <Arduino.h>

class Tone {
private:
  int _pin;
  int _ticks;
  int _bpm;
  int _octave;
  int _duration;
  bool _playing;

  static const int FREQ[12];
  static const char NOTE_NAMES[12][3];

  int parseNote(const char *note);
  int getFreq(const char *note);
  void parseNoteName(const char *note, char &baseNote, bool &sharp);
  int findNoteIndex(char baseNote, bool sharp);

public:
  Tone(int pin, int ticks = 4, int bpm = 120);

  void stop();
  void play(const char *music);

  void setBpm(int bpm) { _bpm = bpm; }
  void setTicks(int ticks) { _ticks = ticks; }
  int getBpm() const { return _bpm; }
  int getTicks() const { return _ticks; }
};
