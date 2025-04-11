export function mergeUint8Arrays(...arrays) {
  const totalLength = arrays.reduce((acc, arr) => acc + arr.length, 0);
  const mergedArray = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    mergedArray.set(arr, offset);
    offset += arr.length;
  }
  return mergedArray;
}
