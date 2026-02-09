#include "midi.h"

namespace em {

Midi::Midi(Stream &stream) : stream_(stream) {}

void Midi::NoteOn(const uint8_t channel, const uint8_t midi_note,
                  const uint8_t note_velocity) {
  const uint8_t command[] = {0x90 | (channel & 0x0F), midi_note & 0x7F,
                             note_velocity & 0x7F};
  Write(command, sizeof(command) / sizeof(command[0]));
}

void Midi::NoteOff(const uint8_t channel, const uint8_t midi_note) {
  const uint8_t command[] = {0x80 | (channel & 0x0F), midi_note & 0x7F, 0x00};
  Write(command, sizeof(command) / sizeof(command[0]));
}

void Midi::SetChannelTimbre(const uint8_t channel, const uint8_t bank,
                            const uint8_t timbre) {
  if (bank != EM_MIDI_TIMBRE_BANK_0 && bank != EM_MIDI_TIMBRE_BANK_127) {
    printf("Error: bank parameter error, can only be EM_MIDI_TIMBRE_BANK_0 or "
           "EM_MIDI_TIMBRE_BANK_127.\n");
    return;
  }

  const uint8_t command_bank[] = {0xB0 | (channel & 0x0F), 0x00, bank};
  Write(command_bank, sizeof(command_bank) / sizeof(command_bank[0]));

  const uint8_t command_timbre[] = {0xC0 | (channel & 0x0F), timbre & 0x7F};
  Write(command_timbre, sizeof(command_timbre) / sizeof(command_timbre[0]));
}

void Midi::PitchBend(const uint8_t channel, uint16_t pitch_bend_value) {
  if (pitch_bend_value > 1023) {
    pitch_bend_value = 1023;
  }
  pitch_bend_value = map(pitch_bend_value, 0, 1023, 0, 0x3FFF);
  const uint8_t command[] = {0xE0 | (channel & 0x0F), pitch_bend_value & 0x7F,
                             pitch_bend_value >> 7};
  Write(command, sizeof(command) / sizeof(command[0]));
}

void Midi::PitchBendRange(const uint8_t channel,
                          const uint8_t pitch_bend_range_value) {
  SendNrpnOrRpnParameter(channel, 0x65, 0x00, 0x64, 0x00,
                         pitch_bend_range_value);

  NullNrpnOrRpn(channel, 0x65, 0x64);
}

void Midi::MidiReset() { Write(0xFF); }

void Midi::ChannelAllNotesOff(const uint8_t channel) {
  const uint8_t command[] = {0xB0 | (channel & 0x0F), 0x7B, 0x00};
  Write(command, sizeof(command) / sizeof(command[0]));
}

void Midi::SetChannelVolume(const uint8_t channel, const uint8_t volume) {
  const uint8_t command[] = {0xB0 | (channel & 0x0F), 0x07, volume & 0x7F};
  Write(command, sizeof(command) / sizeof(command[0]));
}

void Midi::SetAllChannelVolume(const uint8_t volume) {
  const uint8_t command[] = {0xF0, 0x7F, 0x7F,          0x04,
                             0x01, 0x00, volume & 0x7F, 0xF7};
  Write(command, sizeof(command) / sizeof(command[0]));
}

void Midi::SetReverberation(const uint8_t channel,
                            const uint8_t reverberation_type,
                            const uint8_t reverberation_volume,
                            const uint8_t delay_feedback) {
  uint8_t command[] = {0xB0 | (channel & 0x0F), 0x50,
                       reverberation_type & 0x07};
  Write(command, sizeof(command) / sizeof(command[0]));

  command[1] = 0x5B;
  command[2] = reverberation_volume & 0x7F;
  Write(command, sizeof(command) / sizeof(command[0]));

  const uint8_t command_delay_feedback[] = {
      0xF0, 0x41, 0x10, 0x42, 0x12, 0x40, 0x01, 0x35, delay_feedback & 0x7F,
      0x00, 0xF7};
  Write(command_delay_feedback,
        sizeof(command_delay_feedback) / sizeof(command_delay_feedback[0]));
}

void Midi::SetChorus(const uint8_t channel, const uint8_t chorus_effect_type,
                     const uint8_t chorus_effect_volume,
                     const uint8_t chorus_effect_feedback,
                     const uint8_t chorus_delay_time) {
  uint8_t command[] = {0xB0 | (channel & 0x0F), 0x51,
                       chorus_effect_type & 0x07};
  Write(command, sizeof(command) / sizeof(command[0]));

  command[1] = 0x5D;
  command[2] = chorus_effect_volume & 0x7F;
  Write(command, sizeof(command) / sizeof(command[0]));

  const uint8_t command_feedback[] = {0xF0, 0x41, 0x10,
                                      0x42, 0x12, 0x40,
                                      0x01, 0x3B, chorus_effect_feedback & 0x7F,
                                      0x00, 0xF7};
  Write(command_feedback,
        sizeof(command_feedback) / sizeof(command_feedback[0]));

  const uint8_t command_chorus_delay[] = {
      0xF0, 0x41, 0x10, 0x42, 0x12, 0x40, 0x01, 0x3C, chorus_delay_time & 0x7F,
      0x00, 0xF7};
  Write(command_chorus_delay,
        sizeof(command_chorus_delay) / sizeof(command_chorus_delay[0]));
}

void Midi::SetPanPosition(const uint8_t channel,
                          const uint8_t pan_position_value) {
  const uint8_t command[] = {0xB0 | (channel & 0x0F), 0x0A,
                             pan_position_value & 0x7F};
  Write(command, sizeof(command) / sizeof(command[0]));
}

void Midi::SetEqualizer(const uint8_t channel,
                        const EqualizerParameter &equalizer_parameter) {
  SendNrpnOrRpnParameter(channel, 0x63, 0x37, 0x62, 0x00,
                         equalizer_parameter.low_frequency_gain);
  SendNrpnOrRpnParameter(channel, 0x63, 0x37, 0x62, 0x01,
                         equalizer_parameter.medium_low_frequency_gain);
  SendNrpnOrRpnParameter(channel, 0x63, 0x37, 0x62, 0x02,
                         equalizer_parameter.medium_high_frequency_gain);
  SendNrpnOrRpnParameter(channel, 0x63, 0x37, 0x62, 0x03,
                         equalizer_parameter.high_frequency_gain);
  SendNrpnOrRpnParameter(channel, 0x63, 0x37, 0x62, 0x08,
                         equalizer_parameter.low_frequency);
  SendNrpnOrRpnParameter(channel, 0x63, 0x37, 0x62, 0x09,
                         equalizer_parameter.medium_low_frequency);
  SendNrpnOrRpnParameter(channel, 0x63, 0x37, 0x62, 0x0A,
                         equalizer_parameter.medium_high_frequency);
  SendNrpnOrRpnParameter(channel, 0x63, 0x37, 0x62, 0x0B,
                         equalizer_parameter.high_frequency);

  NullNrpnOrRpn(channel, 0x63, 0x62);
}

void Midi::SetTuning(const uint8_t channel, const uint8_t fine_tuning,
                     const uint8_t coarse_tuning) {
  SendNrpnOrRpnParameter(channel, 0x65, 0x00, 0x64, 0x01, fine_tuning);
  SendNrpnOrRpnParameter(channel, 0x65, 0x00, 0x64, 0x02, coarse_tuning);

  NullNrpnOrRpn(channel, 0x65, 0x64);
}

void Midi::SetVibrato(const uint8_t channel, const uint8_t vibrato_rate,
                      const uint8_t vibrato_depth,
                      const uint8_t vibrato_delay_modify) {
  SendNrpnOrRpnParameter(channel, 0x63, 0x01, 0x62, 0x08, vibrato_rate);
  SendNrpnOrRpnParameter(channel, 0x63, 0x01, 0x62, 0x09, vibrato_depth);
  SendNrpnOrRpnParameter(channel, 0x63, 0x01, 0x62, 0x0A, vibrato_delay_modify);

  NullNrpnOrRpn(channel, 0x63, 0x62);
}

void Midi::SetTimeVaryingFilter(const uint8_t channel, const uint8_t cutoff,
                                const uint8_t resonance) {
  SendNrpnOrRpnParameter(channel, 0x63, 0x01, 0x62, 0x20, cutoff);
  SendNrpnOrRpnParameter(channel, 0x63, 0x01, 0x62, 0x21, resonance);

  NullNrpnOrRpn(channel, 0x63, 0x62);
}

void Midi::SetEnvelope(const uint8_t channel, const uint8_t attack_time,
                       const uint8_t attenuation_time,
                       const uint8_t release_time) {
  SendNrpnOrRpnParameter(channel, 0x63, 0x01, 0x62, 0x63, attack_time);
  SendNrpnOrRpnParameter(channel, 0x63, 0x01, 0x62, 0x64, attenuation_time);
  SendNrpnOrRpnParameter(channel, 0x63, 0x01, 0x62, 0x66, release_time);

  NullNrpnOrRpn(channel, 0x63, 0x62);
}

void Midi::SetScaleTuning(const uint8_t channel,
                          const ScaleTuningParameter &scale_tuning_parameter) {
  const uint8_t command[] = {0xF0,
                             0x41,
                             0x10,
                             0x42,
                             0x12,
                             0x40,
                             0x10 | (channel & 0x0F),
                             0x40,
                             scale_tuning_parameter.note_c & 0x7F,
                             scale_tuning_parameter.note_c_sharp & 0x7F,
                             scale_tuning_parameter.note_d & 0x7F,
                             scale_tuning_parameter.note_d_sharp & 0x7F,
                             scale_tuning_parameter.note_e & 0x7F,
                             scale_tuning_parameter.note_f & 0x7F,
                             scale_tuning_parameter.note_f_sharp & 0x7F,
                             scale_tuning_parameter.note_g & 0x7F,
                             scale_tuning_parameter.note_g_sharp & 0x7F,
                             scale_tuning_parameter.note_a & 0x7F,
                             scale_tuning_parameter.note_a_sharp & 0x7F,
                             scale_tuning_parameter.note_b & 0x7F,
                             0xF7};

  Write(command, sizeof(command) / sizeof(command[0]));
}

void Midi::SetModulationWheel(
    const uint8_t channel,
    const ModulationWheelParameter &modulation_wheel_parameter) {
  uint8_t command[] = {0xF0,
                       0x41,
                       0x10,
                       0x42,
                       0x12,
                       0x40,
                       0x20 | (channel & 0x0F),
                       0x00,
                       modulation_wheel_parameter.high_pitch_volume & 0x7F,
                       0x00,
                       0xF7};
  Write(command, sizeof(command) / sizeof(command[0]));

  command[8] = 0x01;
  command[9] = modulation_wheel_parameter.time_varying_timbre_cutoff & 0x7F;
  Write(command, sizeof(command) / sizeof(command[0]));

  command[8] = 0x02;
  command[9] = modulation_wheel_parameter.amplitude & 0x7F;
  Write(command, sizeof(command) / sizeof(command[0]));

  command[8] = 0x03;
  command[9] = modulation_wheel_parameter.low_frequency_oscillator_rate & 0x7F;
  Write(command, sizeof(command) / sizeof(command[0]));

  command[8] = 0x04;
  command[9] = modulation_wheel_parameter.pitch_depth & 0x7F;
  Write(command, sizeof(command) / sizeof(command[0]));

  command[8] = 0x05;
  command[9] = modulation_wheel_parameter.time_varying_filter_depth & 0x7F;
  Write(command, sizeof(command) / sizeof(command[0]));

  command[8] = 0x06;
  command[9] = modulation_wheel_parameter.time_varying_amplifier_depth & 0x7F;
  Write(command, sizeof(command) / sizeof(command[0]));
}

void Midi::AllDrums() {
  uint8_t command[] = {0xF0, 0x41, 0x10, 0x42, 0x12, 0x40,
                       0x00, 0x15, 0x01, 0x00, 0xF7};
  for (uint8_t i = 0; i <= 15; i++) {
    command[6] = 0x10 | (i & 0x0F);
    Write(command, sizeof(command) / sizeof(command[0]));
  }
}

void Midi::Write(const uint8_t data) { stream_.write(data); }

void Midi::Write(const uint8_t *buffer, const size_t size) {
  if (!buffer || size == 0) {
    printf("Error: Invalid buffer\n");
    return;
  }
  stream_.write(buffer, size);
}

void Midi::SendNrpnOrRpnParameter(
    const uint8_t channel, const uint8_t most_significant_byte_controller,
    const uint8_t most_significant_byte,
    const uint8_t least_significant_byte_controller,
    const uint8_t least_significant_byte, const uint8_t value) {
  const uint8_t command_most_significant_byte[] = {
      0xB0 | (channel & 0x0F), most_significant_byte_controller,
      most_significant_byte};
  Write(command_most_significant_byte,
        sizeof(command_most_significant_byte) /
            sizeof(command_most_significant_byte[0]));

  const uint8_t command_least_significant_byte[] = {
      0xB0 | (channel & 0x0F), least_significant_byte_controller,
      least_significant_byte};
  Write(command_least_significant_byte,
        sizeof(command_least_significant_byte) /
            sizeof(command_least_significant_byte[0]));

  const uint8_t command_set_value[] = {0xB0 | (channel & 0x0F), 0x06,
                                       value & 0x7F};
  Write(command_set_value,
        sizeof(command_set_value) / sizeof(command_set_value[0]));
}

void Midi::NullNrpnOrRpn(const uint8_t channel,
                         const uint8_t most_significant_byte_controller,
                         const uint8_t least_significant_byte_controller) {
  const uint8_t command_most_significant_byte[] = {
      0xB0 | (channel & 0x0F), most_significant_byte_controller, 0x7F};
  Write(command_most_significant_byte,
        sizeof(command_most_significant_byte) /
            sizeof(command_most_significant_byte[0]));

  const uint8_t command_least_significant_byte[] = {
      0xB0 | (channel & 0x0F), least_significant_byte_controller, 0x7F};
  Write(command_least_significant_byte,
        sizeof(command_least_significant_byte) /
            sizeof(command_least_significant_byte[0]));
}

} // namespace em
