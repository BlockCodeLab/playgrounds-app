export const isMac = /Mac/i.test(navigator.platform || navigator.userAgent);
export const isDesktop = /Win|Mac|Linux/i.test(navigator.platform || navigator.userAgent);

export const sleep = (s) => new Promise((resolve) => setTimeout(resolve, s * 1000));
export const sleepMs = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function xmlEscape(unsafe) {
  if (typeof unsafe !== 'string') {
    if (Array.isArray(unsafe)) {
      unsafe = String(unsafe);
    } else {
      return unsafe;
    }
  }
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case "'":
        return '&apos;';
      case '"':
        return '&quot;';
    }
  });
}

export function base64ToUint8Array(base64) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const array = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    array[i] = binaryString.charCodeAt(i);
  }
  return array;
}

export function uint8ArrayToBase64(array) {
  const base64 = btoa(String.fromCharCode.apply(null, array));
  return base64;
}

export function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  let binary = '';
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
