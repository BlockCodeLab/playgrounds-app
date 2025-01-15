import { Mp3Encoder } from '@breezystack/lamejs';

const MAX_AMPLITUDE = 0x7fff;

// can be anything but make it a multiple of 576 to make encoders life easier
const BLOCK_SIZE = 1152;

export function mp3Encode(audioBuffer, bitrate, onProgress) {
  let nChannels = audioBuffer.numberOfChannels;

  if (nChannels !== 1 && nChannels !== 2) {
    throw new Error('Expecting mono or stereo audioBuffer');
  }

  bitrate = bitrate ?? 128;
  if (bitrate < 96) {
    // lame fails to encode stereo audio if bitrate is lower than 96.
    // in which case, we force sound to be mono (use only channel 0)
    nChannels = 1;
  }

  const bufferLength = audioBuffer.length;

  // convert audioBuffer to sample buffers
  const buffers = [];

  // TODO: 混合两个通道数据
  let buffer, samples, sample;
  for (let channel = 0; channel < nChannels; channel++) {
    buffer = audioBuffer.getChannelData(channel);
    samples = new Int16Array(bufferLength);

    for (let i = 0; i < bufferLength; ++i) {
      sample = buffer[i];

      // clamp and convert to 16bit number
      sample = Math.min(1, Math.max(-1, sample));
      sample = Math.round(sample * MAX_AMPLITUDE);

      samples[i] = sample;
    }

    buffers.push(samples);
  }

  const mp3encoder = new Mp3Encoder(nChannels, audioBuffer.sampleRate, bitrate);

  return new Promise((resolve, reject) => {
    const mp3Data = [];

    let blockIndex = 0;

    const update = () => {
      let mp3buf;

      if (blockIndex >= bufferLength) {
        // finish writing mp3
        mp3buf = mp3encoder.flush();

        if (mp3buf.length > 0) {
          mp3Data.push(mp3buf);
        }

        const mp3Blob = new Blob(mp3Data, { type: 'audio/mp3' });
        return resolve(mp3Blob);
      }

      let chunkL, chunkR;
      let start = performance.now();

      try {
        while (blockIndex < bufferLength && performance.now() - start < 15) {
          if (nChannels === 1) {
            chunkL = buffers[0].subarray(blockIndex, blockIndex + BLOCK_SIZE);
            mp3buf = mp3encoder.encodeBuffer(chunkL);
          } else {
            chunkL = buffers[0].subarray(blockIndex, blockIndex + BLOCK_SIZE);
            chunkR = buffers[1].subarray(blockIndex, blockIndex + BLOCK_SIZE);
            mp3buf = mp3encoder.encodeBuffer(chunkL, chunkR);
          }

          if (mp3buf.length > 0) {
            mp3Data.push(mp3buf);
          }

          blockIndex += BLOCK_SIZE;
        }
      } catch (err) {
        reject(err);
      }

      onProgress && onProgress(blockIndex / bufferLength);
      setTimeout(update, 16.7);
    };

    update();
  });
}
