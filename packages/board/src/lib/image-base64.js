export function getImageBase64(type, base64) {
  const base64Url = `data:${type};base64,${base64}`;
  return fetch(base64Url).then((res) => res.arrayBuffer());
}
