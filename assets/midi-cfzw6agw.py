import time

from micropython import const

MIDI_TIMBRE_BANK_0: int = const(0)
MIDI_TIMBRE_BANK_127: int = const(127)


class Midi:
    def __init__(self, stream):

        self._stream = stream

        time.sleep_ms(50)

    def _write(self, command: list[int]) -> None:

        self._stream.write(bytearray(command))

    def _send_nrpn_or_rpn_parameter(
        self,
        channel: int,
        most_significant_byte_controller: int,
        most_significant_byte: int,
        least_significant_byte_controller: int,
        least_significant_byte: int,
        value: int,
    ) -> None:

        command_most_significant_byte = [
            0xB0 | (channel & 0x0F),
            most_significant_byte_controller,
            most_significant_byte,
        ]
        self._write(command_most_significant_byte)

        command_least_significant_byte = [
            0xB0 | (channel & 0x0F),
            least_significant_byte_controller,
            least_significant_byte,
        ]
        self._write(command_least_significant_byte)

        command_set_value = [0xB0 | (channel & 0x0F), 0x06, value & 0x7F]
        self._write(command_set_value)

    def _null_nrpn_or_rpn(
        self,
        channel: int,
        most_significant_byte_controller: int,
        least_significant_byte_controller: int,
    ) -> None:

        command_most_significant_byte = [
            0xB0 | (channel & 0x0F),
            most_significant_byte_controller,
            0x7F,
        ]
        self._write(command_most_significant_byte)

        command_least_significant_byte = [
            0xB0 | (channel & 0x0F),
            least_significant_byte_controller,
            0x7F,
        ]
        self._write(command_least_significant_byte)

    def note_on(self, channel: int, midi_note: int, note_velocity: int) -> None:

        command = [0x90 | (channel & 0x0F), midi_note & 0x7F, note_velocity & 0x7F]
        self._write(command)

    def note_off(self, channel: int, midi_note: int) -> None:

        command = [0x80 | (channel & 0x0F), midi_note & 0x7F, 0x00]
        self._write(command)

    def set_channel_timbre(self, channel: int, bank: int, timbre: int) -> None:

        if bank != MIDI_TIMBRE_BANK_0 and bank != MIDI_TIMBRE_BANK_127:
            print(
                "Error: bank parameter error, can only be MIDI_TIMBRE_BANK_0 or MIDI_TIMBRE_BANK_127."
            )
            return

        command_bank = [0xB0 | (channel & 0x0F), 0x00, bank]
        self._write(command_bank)

        command_timbre = [0xC0 | (channel & 0x0F), timbre & 0x7F]
        self._write(command_timbre)

    def pitch_bend(self, channel: int, pitch_bend_value: int) -> None:

        mapped_value = int(min(pitch_bend_value, 1023) * 0x3FFF / 1023)
        command = [0xE0 | (channel & 0x0F), mapped_value & 0x7F, mapped_value >> 7]
        self._write(command)

    def pitch_bend_range(self, channel: int, pitch_bend_range_value: int) -> None:

        self._send_nrpn_or_rpn_parameter(
            channel, 0x65, 0x00, 0x64, 0x00, pitch_bend_range_value
        )

        self._null_nrpn_or_rpn(channel, 0x65, 0x64)

    def midi_reset(self) -> None:

        self._write([0xFF])

    def channel_all_notes_off(self, channel: int) -> None:

        command = [0xB0 | (channel & 0x0F), 0x7B, 0x00]
        self._write(command)

    def set_channel_volume(self, channel: int, volume: int) -> None:

        command = [0xB0 | (channel & 0x0F), 0x07, volume & 0x7F]
        self._write(command)

    def set_all_channel_volume(self, volume: int) -> None:

        command = [0xF0, 0x7F, 0x7F, 0x04, 0x01, 0x00, volume & 0x7F, 0xF7]
        self._write(command)

    def set_reverberation(
        self,
        channel: int,
        reverberation_type: int,
        reverberation_volume: int,
        delay_feedback: int,
    ) -> None:

        command = [0xB0 | (channel & 0x0F), 0x50, reverberation_type & 0x07]
        self._write(command)

        command[1] = 0x5B
        command[2] = reverberation_volume & 0x7F
        self._write(command)

        command_delay = [
            0xF0,
            0x41,
            0x10,
            0x42,
            0x12,
            0x40,
            0x01,
            0x35,
            delay_feedback & 0x7F,
            0x00,
            0xF7,
        ]
        self._write(command_delay)

    def set_chorus(
        self,
        channel: int,
        chorus_effect_type: int,
        chorus_effect_volume: int,
        chorus_effect_feedback: int,
        chorus_delay_time: int,
    ) -> None:

        command = [0xB0 | (channel & 0x0F), 0x51, chorus_effect_type & 0x07]
        self._write(command)

        command[1] = 0x5D
        command[2] = chorus_effect_volume & 0x7F
        self._write(command)

        command_feedback = [
            0xF0,
            0x41,
            0x10,
            0x42,
            0x12,
            0x40,
            0x01,
            0x3B,
            chorus_effect_feedback & 0x7F,
            0x00,
            0xF7,
        ]
        self._write(command_feedback)

        command_chorus_delay = [
            0xF0,
            0x41,
            0x10,
            0x42,
            0x12,
            0x40,
            0x01,
            0x3C,
            chorus_delay_time & 0x7F,
            0x00,
            0xF7,
        ]
        self._write(command_chorus_delay)

    def set_pan_position(self, channel: int, pan_position_value: int) -> None:

        command = [0xB0 | (channel & 0x0F), 0x0A, pan_position_value & 0x7F]
        self._write(command)

    def set_equalizer(
        self,
        channel: int,
        low_frequency_gain: int,
        medium_low_frequency_gain: int,
        medium_high_frequency_gain: int,
        high_frequency_gain: int,
        low_frequency: int,
        medium_low_frequency: int,
        medium_high_frequency: int,
        high_frequency: int,
    ) -> None:

        params = [
            (0x00, low_frequency_gain),
            (0x01, medium_low_frequency_gain),
            (0x02, medium_high_frequency_gain),
            (0x03, high_frequency_gain),
            (0x08, low_frequency),
            (0x09, medium_low_frequency),
            (0x0A, medium_high_frequency),
            (0x0B, high_frequency),
        ]

        for param, value in params:
            self._send_nrpn_or_rpn_parameter(channel, 0x63, 0x37, 0x62, param, value)

        self._null_nrpn_or_rpn(channel, 0x63, 0x62)

    def set_tuning(self, channel: int, fine_tuning: int, coarse_tuning: int) -> None:

        self._send_nrpn_or_rpn_parameter(channel, 0x65, 0x00, 0x64, 0x01, fine_tuning)
        self._send_nrpn_or_rpn_parameter(channel, 0x65, 0x00, 0x64, 0x02, coarse_tuning)

        self._null_nrpn_or_rpn(channel, 0x65, 0x64)

    def set_vibrato(
        self,
        channel: int,
        vibrato_rate: int,
        vibrato_depth: int,
        vibrato_delay_modify: int,
    ) -> None:

        self._send_nrpn_or_rpn_parameter(channel, 0x63, 0x01, 0x62, 0x08, vibrato_rate)
        self._send_nrpn_or_rpn_parameter(channel, 0x63, 0x01, 0x62, 0x09, vibrato_depth)
        self._send_nrpn_or_rpn_parameter(
            channel, 0x63, 0x01, 0x62, 0x0A, vibrato_delay_modify
        )

        self._null_nrpn_or_rpn(channel, 0x63, 0x62)

    def set_time_varying_filter(
        self, channel: int, cutoff: int, resonance: int
    ) -> None:

        self._send_nrpn_or_rpn_parameter(channel, 0x63, 0x01, 0x62, 0x20, cutoff)
        self._send_nrpn_or_rpn_parameter(channel, 0x63, 0x01, 0x62, 0x21, resonance)

        self._null_nrpn_or_rpn(channel, 0x63, 0x62)

    def set_envelope(
        self, channel: int, attack_time: int, attenuation_time: int, release_time: int
    ) -> None:

        self._send_nrpn_or_rpn_parameter(channel, 0x63, 0x01, 0x62, 0x63, attack_time)
        self._send_nrpn_or_rpn_parameter(
            channel, 0x63, 0x01, 0x62, 0x64, attenuation_time
        )
        self._send_nrpn_or_rpn_parameter(channel, 0x63, 0x01, 0x62, 0x66, release_time)

        self._null_nrpn_or_rpn(channel, 0x63, 0x62)

    def set_scale_tuning(
        self,
        channel: int,
        note_c: int,
        note_c_sharp: int,
        note_d: int,
        note_d_sharp: int,
        note_e: int,
        note_f: int,
        note_f_sharp: int,
        note_g: int,
        note_g_sharp: int,
        note_a: int,
        note_a_sharp: int,
        note_b: int,
    ) -> None:

        command = [
            0xF0,
            0x41,
            0x00,
            0x42,
            0x12,
            0x40,
            0x10 | (channel & 0x0F),
            0x40,
            note_c & 0x7F,
            note_c_sharp & 0x7F,
            note_d & 0x7F,
            note_d_sharp & 0x7F,
            note_e & 0x7F,
            note_f & 0x7F,
            note_f_sharp & 0x7F,
            note_g & 0x7F,
            note_g_sharp & 0x7F,
            note_a & 0x7F,
            note_a_sharp & 0x7F,
            note_b & 0x7F,
            0xF7,
        ]
        self._write(command)

    def set_modulation_wheel(
        self,
        channel: int,
        high_pitch_volume: int,
        time_varying_timbre_cutoff: int,
        amplitude: int,
        low_frequency_oscillator_rate: int,
        pitch_depth: int,
        time_varying_filter_depth: int,
        time_varying_amplifier_depth: int,
    ) -> None:

        command = [
            0xF0,
            0x41,
            0x00,
            0x42,
            0x12,
            0x40,
            0x20 | (channel & 0x0F),
            0x00,
            high_pitch_volume & 0x7F,
            0x00,
            0xF7,
        ]
        self._write(command)

        command[8] = 0x01
        command[9] = time_varying_timbre_cutoff & 0x7F
        self._write(command)

        command[8] = 0x02
        command[9] = amplitude & 0x7F
        self._write(command)

        command[8] = 0x03
        command[9] = low_frequency_oscillator_rate & 0x7F
        self._write(command)

        command[8] = 0x04
        command[9] = pitch_depth & 0x7F
        self._write(command)

        command[8] = 0x05
        command[9] = time_varying_filter_depth & 0x7F
        self._write(command)

        command[8] = 0x06
        command[9] = time_varying_amplifier_depth & 0x7F
        self._write(command)

    def all_drums(self) -> None:

        command = [0xF0, 0x41, 0x00, 0x42, 0x12, 0x40, 0x00, 0x15, 0x01, 0x00, 0xF7]

        for i in range(16):
            command[6] = 0x10 | (i & 0x0F)
            self._write(command)
