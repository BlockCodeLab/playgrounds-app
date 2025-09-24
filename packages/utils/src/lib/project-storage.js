import localForage from 'localforage';
import { nanoid } from 'nanoid';

// 创建项目本地数据库
// INFO: 旧数据库名 blockcode-store
const projectStorage = localForage.createInstance({
  name: 'blockcode-storage',
});

const oldProjectStorage = localForage.createInstance({
  name: 'blockcode-store',
});

// 转换旧项目数据格式
export function parseOldProject(project) {
  project.meta = {
    editor: `@blockcode/gui-${project.editor.package}`,
    extensions: project.editor.extensions?.map((extId) => `@blockcode/blocks-${extId}`),
    version: '0.0.0',
  };
  project.files = project.fileList.map((file) => {
    if (file.id === 'stage') {
      file.id = '_stage_';
    }
    if (project.editor.extensions) {
      for (const extId of project.editor.extensions) {
        file.xml = file.xml.replaceAll(`"${extId}_`, `"@blockcode/blocks-${extId}_`);
      }
    }
    return file;
  });
  project.assets = project.assetList;

  if (project.editor?.package === 'arcade') {
    project.fileId = project.files[1].id;
  }

  delete project.editor;
  delete project.fileList;
  delete project.assetList;
  return project;
}

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
  // 调试
  if (DEBUG) {
    console.log(data);
  }
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
  await oldProjectStorage.removeItem(key); // 同时删除旧项目
}

export async function getProjectsThumbs() {
  // 转移旧数据库数据
  const oldKeys = await oldProjectStorage.keys();
  for (const key of oldKeys) {
    if (await projectStorage.getItem(key)) continue;
    // 跳过已经存在的后转换旧项目数据
    const project = await oldProjectStorage.getItem(key);
    const data = parseOldProject(project);
    await projectStorage.setItem(key, data);
  }

  // 获取新数据库数据
  const result = [];
  const keys = await projectStorage.keys();
  for (const key of keys) {
    const project = await projectStorage.getItem(key);
    const data = {
      key,
      id: project.id,
      name: project.name,
      thumb: project.thumb,
      modifiedDate: project.modifiedDate,
      meta: project.meta,
    };
    result.push(data);
  }
  // 从新到旧排序
  return result.sort((a, b) => b.modifiedDate - a.modifiedDate);
}
