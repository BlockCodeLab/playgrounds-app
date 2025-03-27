export class Base64Utils {
  static base64ToUint8Array(base64) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const array = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      array[i] = binaryString.charCodeAt(i);
    }
    return array;
  }

  static uint8ArrayToBase64(array) {
    const base64 = btoa(String.fromCharCode.apply(null, array));
    return base64;
  }

  static arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
}
