import { createContext } from 'preact';
import { useContext } from 'preact/hooks';
import { batch, computed, signal } from '@preact/signals';
import { nanoid } from '@blockcode/utils';
import { maybeTranslate } from './locales-context';

// 项目元数据
// editor: 编辑器ID
// version: 编辑器版本
// ...其他数据
//
const meta = signal(null);

// 项目唯一ID和本地Key
//
const id = signal(null); // 服务器储存唯一标识
const key = signal(null); // 本地储存唯一标识

// 项目修改标签
//
const modified = signal(0);

// 修改类型
export const ModifyTypes = {
  Saved: 0,
  Rename: 1,
  AddFile: 2,
  SetFile: 3,
  DelFile: 4,
  AddAsset: 5,
  SetAsset: 6,
  DelAsset: 7,
};

// 根据修改类型设置
export const setModified = (type = ModifyTypes.Saved) => {
  if (type === ModifyTypes.Saved) {
    modified.value = ModifyTypes.Saved;
  } else {
    modified.value = (Math.floor(modified.value / 10) + 1) * 10 + type;
  }
};

// 检查修改类型
export const isModifyType = (type = ModifyTypes.Saved) => {
  return modified.value % 10 === type;
};

// 项目可见名称
//
const name = signal('');

export function renameProject(value) {
  name.value = value;
  setModified(ModifyTypes.Rename);
}

// 项目文件库
//
const files = signal(null);
// 当前编辑的项目文件
const fileId = signal(null);
const fileIndex = computed(() => files.value?.findIndex?.((f) => f.id === fileId.value) ?? -1);
const file = computed(() => files.value?.find?.((f) => f.id === fileId.value) ?? null);

export function openFile(id) {
  fileId.value = id;
}

export function addFile(res) {
  if (!res.id) {
    res.id = nanoid();
  }
  if (files.value.find((f) => f.id === res.id)) {
    setFile(res);
    return;
  }
  batch(() => {
    files.value.push(res);
    fileId.value = res.id;
    setModified(ModifyTypes.AddFile);
  });
}

export function setFile(res) {
  let found = file.value;
  let foundIndex = fileIndex.value;
  if (res.id) {
    found = files.value.find((f) => f.id === res.id);
    foundIndex = files.value.findIndex((f) => f.id === res.id);
  }
  if (!found) return;
  batch(() => {
    files.value[foundIndex] = Object.assign(found, res);
    setModified(ModifyTypes.SetFile);
  });
}

export function getFile(idOrIndex) {
  if (fileIndex === idOrIndex) {
    return files.value[idOrIndex];
  }
  if (fileId.value !== idOrIndex) {
    return files.value.find((f) => f.id === idOrIndex);
  }
  return file;
}

export function delFile(id) {
  let foundIndex = fileIndex.value;
  if (fileId.value !== id) {
    foundIndex = files.value.findIndex((f) => f.id === id);
  }
  if (foundIndex === -1) return;

  batch(() => {
    if (id === fileId.value) {
      if (foundIndex + 1 < files.value.length) {
        openFile(files.value[foundIndex + 1]?.id);
      } else if (foundIndex - 1 > -1) {
        openFile(files.value[foundIndex - 1]?.id);
      } else {
        openFile(null);
      }
    }
    files.value.splice(foundIndex, 1);
    setModified(ModifyTypes.DelFile);
  });
}

// 资源文件库
//
const assets = signal(null);
// 当前编辑的资源文件
const assetId = signal(null);
const assetIndex = computed(() => assets.value?.findIndex?.((f) => f.id === assetId.value) ?? -1);
const asset = computed(() => assets.value?.find?.((f) => f.id === assetId.value) ?? null);

export function openAsset(id) {
  assetId.value = id;
}

export function addAsset(res) {
  if (!res.id) {
    res.id = nanoid();
  }
  if (assets.value.find((f) => f.id === res.id)) {
    setAsset(res);
    return;
  }
  batch(() => {
    assets.value.push(res);
    openAsset(res.id);
    setModified(ModifyTypes.AddAsset);
  });
}

export function setAsset(res) {
  let found = asset.value;
  let foundIndex = assetIndex.value;
  if (res.id) {
    found = assets.value.find((f) => f.id === res.id);
    foundIndex = assets.value.findIndex((f) => f.id === res.id);
  }
  if (!found) return;
  batch(() => {
    assets.value[foundIndex] = Object.assign(found, res);
    setModified(ModifyTypes.SetAsset);
  });
}

export function getAsset(idOrIndex) {
  if (assetIndex === idOrIndex) {
    return assets.value[idOrIndex];
  }
  if (assetId.value !== idOrIndex) {
    return assets.value.find((res) => res.id === idOrIndex);
  }
  return asset;
}

export function delAsset(id) {
  let foundIndex = assetIndex.value;
  if (assetId.value !== id) {
    foundIndex = assets.value.findIndex((res) => res.id === id);
  }
  if (foundIndex === -1) return;

  batch(() => {
    openAsset(null);
    assets.value.splice(foundIndex, 1);
    setModified(ModifyTypes.DelAsset);
  });
}

// 载入管理
const nameTranslateMapper = (translator) => (res) =>
  Object.assign(res, {
    name: maybeTranslate(res.name, translator),
  });

export function openProject(res, translator) {
  batch(() => {
    meta.value = res.meta;
    id.value = res.id;
    key.value = res.key ?? nanoid();
    name.value = maybeTranslate(res.name, translator);
    files.value = res.files?.map?.(nameTranslateMapper(translator));
    fileId.value = res.fileId;
    assets.value = res.assets?.map?.(nameTranslateMapper(translator));
    assetId.value = res.assetId;
  });
}

// 关闭项目
export function closeProject() {
  batch(() => {
    meta.value = null;
    id.value = null;
    key.value = null;
    name.value = '';
    files.value = null;
    fileId.value = null;
    assets.value = null;
    assetId.value = null;
    modified.value = 0;
  });
}

// 项目上下文组件
//
const ProjectContext = createContext();

export const useProjectContext = () => useContext(ProjectContext);

export function ProjectProvider({ children }) {
  return (
    <ProjectContext.Provider
      value={{
        meta,
        id,
        key,
        name,
        file,
        files,
        fileId,
        fileIndex,
        asset,
        assets,
        assetId,
        assetIndex,
        modified,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}
