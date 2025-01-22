import localForage from 'localforage';
import { nanoid } from 'nanoid';

// 创建项目本地数据库
// INFO: 旧数据库名 blockcode-store
const projectStorage = localForage.createInstance({
  name: 'blockcode-storage',
});

export function getProject(key) {
  return projectStorage.getItem(key);
}

export async function putProject(project, onThumb) {
  const key = project.key || nanoid();
  const thumb = await onThumb();
  const data = {
    key,
    thumb,
    id: project.id,
    meta: project.meta,
    name: project.name,
    files: project.files,
    assets: project.assets,
    fileId: project.fileId,
    modifiedDate: Date.now(),
  };
  await projectStorage.setItem(key, data);
  return key;
}

export async function renameProject(key, name) {
  const project = await projectStorage.getItem(key);
  project.name = name;
  await projectStorage.setItem(project.key, project);
}

export async function cloneProject(key) {
  const project = await getProject(key);
  project.key = nanoid();
  project.modifiedDate = Date.now();
  await projectStorage.setItem(project.key, project);
}

export async function delProject(key) {
  await projectStorage.removeItem(key);
}

export async function getProjectsThumbs() {
  let result = [];
  await projectStorage.iterate((project, key) => {
    const data = {
      key,
      id: project.id,
      name: project.name,
      thumb: project.thumb,
      modifiedDate: project.modifiedDate,
      meta: project.meta,
    };
    result.push(data);
  });
  // 从新到旧排序
  result = result.sort((a, b) => b.modifiedDate - a.modifiedDate);
  return result;
}
