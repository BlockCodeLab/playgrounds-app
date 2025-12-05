import JSZip from 'jszip';
import mime from 'mime/lite';
import { exportFile } from './export-file';
import { parseOldProject } from './project-storage';

export async function saveProjectToComputer(projectJson) {
  const zip = JSZip();

  if (projectJson.assets) {
    projectJson.assets = projectJson.assets.map(({ data, ...asset }) => {
      if (data) {
        const extname = mime.getExtension(asset.type);
        zip.file(`${asset.id}.${extname}`, data, { base64: true });
      }
      return asset;
    });
  }
  zip.file('project.json', JSON.stringify(projectJson));

  const blob = await zip.generateAsync({ type: 'blob' });
  return exportFile(blob, `${projectJson.name ?? 'BlockCode Project'}.bcp`);
}

export function openProjectFromComputer() {
  return new Promise((resolve, reject) => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.bcp';
    fileInput.multiple = false;
    fileInput.click();
    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      const zip = await JSZip.loadAsync(file);
      const projectRaw = await zip.file('project.json')?.async('string');
      if (!projectRaw) {
        return reject('not found "project.json"');
      }
      let projectJson;
      try {
        projectJson = JSON.parse(projectRaw);
      } catch (err) {
        return reject(err);
      }

      // 转换老版本数据
      if (projectJson.editor) {
        projectJson = parseOldProject(projectJson);
      }

      // 读取资源文件
      for (const key in projectJson.assets) {
        const asset = projectJson.assets[key];
        const extname = mime.getExtension(asset.type);
        const data = await zip.file(`${asset.id}.${extname}`)?.async('base64');
        if (data) {
          projectJson.assets[key] = { data, ...asset };
        }
      }
      if (!projectJson.name) {
        const nameParts = file.name.split('.');
        nameParts.pop();
        projectJson.name = nameParts.join('.');
      }
      resolve(projectJson);
    });
  });
}

export async function openProjectFromURL(url) {
  const blob = await fetch(url).then((res) => res.blob());
  const file = new File([blob], url);

  const zip = await JSZip.loadAsync(file);
  const projectRaw = await zip.file('project.json')?.async('string');
  if (!projectRaw) {
    throw new Error('not found "project.json"');
  }
  const projectJson = JSON.parse(projectRaw);

  // 读取资源文件
  for (const key in projectJson.assets) {
    const asset = projectJson.assets[key];
    const extname = mime.getExtension(asset.type);
    const data = await zip.file(`${asset.id}.${extname}`)?.async('base64');
    if (data) {
      projectJson.assets[key] = { data, ...asset };
    }
  }
  if (!projectJson.name) {
    const nameParts = file.name.split('.');
    nameParts.pop();
    projectJson.name = nameParts.join('.');
  }
  return projectJson;
}
