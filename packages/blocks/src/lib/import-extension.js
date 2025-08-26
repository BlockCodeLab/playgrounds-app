import { batch } from '@preact/signals';
import { addAsset } from '@blockcode/core';

const escape = (name) => name.replaceAll(/[^a-z0-9]/gi, '_');

export async function importExtension(extId) {
  const { default: extObj } = await import(extId);
  extObj.id = extId;

  // 载入扩展附带的静态文件（库文件）
  if (extObj.files) {
    const assets = [];
    for (const file of extObj.files) {
      const content = await fetch(file.uri).then((res) => res.arrayBuffer());
      // python 库文件
      if (file.type === 'text/x-python') {
        assets.push(
          Object.assign(file, {
            id:
              file.name[0] === '_'
                ? `lib/${file.name}` // _filename 公共文件
                : `lib/${escape(extId)}/${file.name}`,
            content,
          }),
        );
      }
    }
    batch(() => {
      for (const asset of assets) {
        addAsset(asset);
      }
    });
  }

  return extObj;
}
