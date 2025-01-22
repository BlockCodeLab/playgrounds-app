import localForage from 'localforage';

// 创建二进制文件缓存数据库
const cacheStorage = localForage.createInstance({
  name: 'blockcode-cache',
});

export function getBinaryCache(key) {
  return cacheStorage.getItem(key);
}

export async function setBinaryCache(key, data) {
  await cacheStorage.setItem(key, data);
}
