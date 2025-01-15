import { batch } from '@preact/signals';
import { addAsset } from '@blockcode/core';

export async function importExtension(id) {
  const { default: extObj } = await import(`@blockcode/blocks-${id}`);
  extObj.id = id;

  // 载入扩展附带的静态文件（库文件）
  if (extObj.files) {
    const assets = [];
    for (const file of extObj.files) {
      const content = await fetch(file.uri).then((res) => res.arrayBuffer());
      assets.push(
        Object.assign(file, {
          id: `ext/${id}/${file.name}`,
          content,
        }),
      );
    }
    batch(() => {
      for (const asset of assets) {
        addAsset(asset);
      }
    });
  }

  return extObj;
}
