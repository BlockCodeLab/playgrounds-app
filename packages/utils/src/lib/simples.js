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
  const raw = atob(base64);
  return Uint8Array.from(Array.prototype.map.call(raw, (x) => x.charCodeAt(0)));
}

export function uint8ArrayToBase64(array) {
  return btoa(String.fromCharCode.apply(null, array));
}

export function arrayBufferToBinaryString(buffer) {
  const bytes = new Uint8Array(buffer);
  return bytes.reduce((string, byte) => string + String.fromCharCode(byte), '');
}

export function arrayBufferToBase64(buffer) {
  return btoa(arrayBufferToBinaryString(buffer));
}
