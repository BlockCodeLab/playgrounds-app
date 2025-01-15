import { nanoid } from '@blockcode/utils';

const PngType = 'image/png';
const PngDataURLHeadLength = `data:${PngType};base64,`.length;

export const BlankImageData =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAAtJREFUGFdjYAACAAAFAAGq1chRAAAAAElFTkSuQmCC';

const loadedImages = new Map();

// 从文件载入图片
// 图片宽高超出给定尺寸的，等比例缩小
export function loadImageFromFile(file, maxSize) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.addEventListener('load', () => {
      const id = nanoid();
      const image = new Image();
      loadedImages.set(id, image);

      image.id = id;
      image.src = reader.result;
      image.addEventListener('load', () => {
        if (image.dataset.data) {
          return resolve(image);
        }

        let width = image.width;
        let height = image.height;

        if (image.width > maxSize.width || image.height > maxSize.height) {
          width = maxSize.width;
          height = maxSize.height;

          const sw = image.width / maxSize.width;
          const sh = image.height / maxSize.height;
          if (sw > sh) {
            height = image.height / sw;
          } else {
            width = image.width / sh;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, width, height);

        const dataUrl = canvas.toDataURL(PngType);
        if (dataUrl === 'data:,') {
          return resolve(null);
        }
        image.dataset.data = dataUrl.slice(PngDataURLHeadLength);
        image.src = dataUrl;
      });
    });
  });
}

// 从项目资源载入图片
export function loadImageFromAsset(asset) {
  return new Promise((resolve) => {
    // 缓存图片
    let image = loadedImages.get(asset.id);
    if (!image) {
      image = new Image();
      loadedImages.set(asset.id, image);
    }
    const dataUrlHead = `data:${asset.type};base64,`;
    image.src = `${dataUrlHead}${asset.data}`;
    image.addEventListener('load', () => {
      image.dataset.data = image.src.slice(dataUrlHead.length);
      resolve(image);
    });
  });
}

// 从 URL 在图片
// 通常是从 Library 载入图片
export function loadImageFromURL(url) {
  return new Promise((resolve) => {
    const id = nanoid();
    const image = new Image();
    loadedImages.set(id, image);

    image.id = id;
    image.src = url;
    image.addEventListener('load', () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0, image.width, image.height);
      const dataUrl = canvas.toDataURL(PngType);
      image.dataset.data = dataUrl.slice(PngDataURLHeadLength);
      resolve(image);
    });
  });
}
