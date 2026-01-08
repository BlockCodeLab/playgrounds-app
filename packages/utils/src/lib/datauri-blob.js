export function dataURItoBlob(dataURI) {
  const splitIndex = dataURI.indexOf(',');
  const mimeString = dataURI.substring(0, splitIndex).split(':')[1].split(';')[0];
  const base64String = dataURI.substring(splitIndex + 1);

  const byteString = atob(base64String);
  const byteArray = new Uint8Array(byteString.length);

  for (let i = 0; i < byteString.length; i++) {
    byteArray[i] = byteString.charCodeAt(i);
  }

  return new Blob([byteArray], { type: mimeString });
}
