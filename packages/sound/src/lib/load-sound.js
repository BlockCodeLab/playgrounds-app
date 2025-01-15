import { mp3Encode } from './mp3-encoder';

const SAMPLERATE = 22050;
const BITRATE = 32;

const Mp3DataURLHeadLength = 'data:audio/mp3;base64,'.length;

const audioContext = new AudioContext({
  sampleRate: SAMPLERATE,
});

const encode = (audioBuf) =>
  new Promise(async (resolve) => {
    const mp3Blob = await mp3Encode(audioBuf, BITRATE);
    const reader = new FileReader();
    reader.readAsDataURL(mp3Blob);
    reader.addEventListener('load', (e) =>
      resolve({
        data: e.target.result.slice(Mp3DataURLHeadLength),
        type: 'audio/mp3',
        rate: audioBuf.sampleRate,
        sampleCount: audioBuf.length,
      }),
    );
  });

// 从本地上传声音文件资源
export function loadSoundFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.addEventListener('load', async () => {
      try {
        const audioBuf = await audioContext.decodeAudioData(reader.result);
        const sound = encode(audioBuf);
        resolve(sound);
      } catch (err) {
        reject(err);
      }
    });
  });
}

// 通过 URL 获取声音资源
// 通常是来自 Library 的资源
export async function loadSoundFromURL(url) {
  const res = await fetch(url);
  const buffer = await res.arrayBuffer();
  const audioBuf = await audioContext.decodeAudioData(buffer);
  return encode(audioBuf);
}

// 从录制的 Blob 获取声音资源
export async function loadSoundFromBlob(blob) {
  const buffer = await blob.arrayBuffer();
  const audioBuf = await audioContext.decodeAudioData(buffer);
  return encode(audioBuf);
}
