import { getBoundingBox } from './get-bounding-box';

const PngType = 'image/png';
const PngDataURLHeadLength = `data:${PngType};base64,`.length;

export async function createImageFromLayer(layer, center) {
  const canvas = await layer.toCanvas({
    pixelRatio: 1,
  });
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, layer.width(), layer.height());
  const boundingBox = getBoundingBox(imageData);

  const dataUrl = layer.toDataURL({
    ...boundingBox,
    mimeType: PngType,
  });
  const data = dataUrl.slice(PngDataURLHeadLength);

  const centerX = center.x - boundingBox.x;
  const centerY = center.y - boundingBox.y;
  const width = boundingBox.width;
  const height = boundingBox.height;
  return { data, centerX, centerY, width, height };
}
