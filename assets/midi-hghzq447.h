#pragma once
#include <Arduino.h>
#include <Stream.h>

#include "midi_timbre.h"

namespace em {

struct EqualizerParameter {
  uint8_t low_frequency_gain = 64;
  uint8_t medium_low_frequency_gain = 64;
  uint8_t medium_high_frequency_gain = 64;
  uint8_t high_frequency_gain = 64;
  uint8_t low_frequency = 64;
  uint8_t medium_low_frequency = 64;
  uint8_t medium_high_frequency = 64;
  uint8_t high_frequency = 64;
};

struct ScaleTuningParameter {
  uint8_t note_c = 64;
  uint8_t note_c_sharp = 64;
  uint8_t note_d = 64;
  uint8_t note_d_sharp = 64;
  uint8_t note_e = 64;
  uint8_t note_f = 64;
  uint8_t note_f_sharp = 64;
  uint8_t note_g = 64;
  uint8_t note_g_sharp = 64;
  uint8_t note_a = 64;
  uint8_t note_a_sharp = 64;
  uint8_t note_b = 64;
};

struct ModulationWheelParameter {
  uint8_t high_pitch_volume = 64;
  uint8_t time_varying_timbre_cutoff = 64;
  uint8_t amplitude = 64;
  uint8_t low_frequency_oscillator_rate = 64;
  uint8_t pitch_depth = 64;
  uint8_t time_varying_filter_depth = 64;
  uint8_t time_varying_amplifier_depth = 64;
};

class Midi {
public:
  Midi(Stream &stream);

  void NoteOn(const uint8_t channel, const uint8_t midi_note, const uint8_t z);

  void NoteOff(const uint8_t channel, const uint8_t midi_note);

  void SetChannelTimbre(const uint8_t channel, const uint8_t bank,
                        const uint8_t timbre);

  void PitchBend(const uint8_t channel, uint16_t pitch_bend_value);

  void PitchBendRange(const uint8_t channel,
                      const uint8_t pitch_bend_range_value);

  void MidiReset();

  void ChannelAllNotesOff(const uint8_t channel);

  void SetChannelVolume(const uint8_t channel, const uint8_t volume);

  void SetAllChannelVolume(const uint8_t volume);

  void SetReverberation(const uint8_t channel, const uint8_t reverberation_type,
                        const uint8_t reverberation_volume,
                        const uint8_t delay_feedback);

  void SetChorus(const uint8_t channel, const uint8_t chorus_effect_type,
                 const uint8_t chorus_effect_volume,
                 const uint8_t chorus_effect_feedback,
                 const uint8_t chorus_delay_time);

  void SetPanPosition(const uint8_t channel, const uint8_t pan_position_value);

  void SetEqualizer(const uint8_t channel,
                    const EqualizerParameter &equalizer_parameter);

  void SetTuning(const uint8_t channel, const uint8_t fine_tuning,
                 const uint8_t coarse_tuning);

  void SetVibrato(const uint8_t channel, const uint8_t vibrato_rate,
                  const uint8_t vibrato_depth,
                  const uint8_t vibrato_delay_modify);

  void SetTimeVaryingFilter(const uint8_t channel, const uint8_t cutoff,
                            const uint8_t resonance);

  void SetEnvelope(const uint8_t channel, const uint8_t attack_time,
                   const uint8_t attenuation_time, const uint8_t release_time);

  void SetScaleTuning(const uint8_t channel,
                      const ScaleTuningParameter &scale_tuning_parameter);

  void SetModulationWheel(
      const uint8_t channel,
      const ModulationWheelParameter &modulation_wheel_parameter);

  void AllDrums();

private:
  Midi(const Midi &) = delete;

  Midi &operator=(const Midi &) = delete;

  void Write(const uint8_t data);

  void Write(const uint8_t *buffer, const size_t size);

  void SendNrpnOrRpnParameter(const uint8_t channel,
                              const uint8_t most_significant_byte_controller,
                              const uint8_t most_significant_byte,
                              const uint8_t least_significant_byte_controller,
                              const uint8_t least_significant_byte,
                              const uint8_t value);

  void NullNrpnOrRpn(const uint8_t channel,
                     const uint8_t most_significant_byte_controller,
                     const uint8_t least_significant_byte_controller);

  Stream &stream_;
};

} // namespace em
