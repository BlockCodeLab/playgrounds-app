const encoder = new TextEncoder();

export class Base64Utils {
  static base64ToUint8Array(base64) {
    const raw = atob(base64);
    return Uint8Array.from(Array.prototype.map.call(raw, (x) => x.charCodeAt(0)));
  }

  static uint8ArrayToBase64(array) {
    return btoa(String.fromCharCode.apply(null, array));
  }

  static arrayBufferToBinaryString(buffer) {
    const bytes = new Uint8Array(buffer);
    return bytes.reduce((string, byte) => string + String.fromCharCode(byte), '');
  }

  static arrayBufferToBase64(buffer) {
    return btoa(Base64Utils.arrayBufferToBinaryString(buffer));
  }

  static stringToBase64(str) {
    const buffer = encoder.encode(str).buffer;
    return Base64Utils.arrayBufferToBase64(buffer);
  }
}
