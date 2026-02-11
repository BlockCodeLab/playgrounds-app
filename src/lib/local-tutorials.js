import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { ipcMain } from 'electron';
import { escape } from './escape';

import * as localPath from './local-path';

const getTutorialsInfo = (path, editorOrBlockId, lang = '') => {
  // 检查语言版本，不存在则使用默认语言版本
  if (lang && !existsSync(join(path, editorOrBlockId, lang))) {
    lang = '';
  }

  // 检查教程是否存在
  const tutorialPath = join(path, editorOrBlockId, lang, 'tutorials.json');
  if (!existsSync(tutorialPath)) {
    return null;
  }

  const tutorial = require(tutorialPath);
  const lessons = Object.entries(tutorial.lessons).map(([id, lesson]) => {
    if (typeof lesson === 'string') {
      lesson = require(join(path, editorOrBlockId, lang, lesson));
    }
    return [
      id,
      {
        ...lesson,
        id,
        image: lesson.image && join(path, editorOrBlockId, lang, lesson.image),
        project: lesson.project && join(path, editorOrBlockId, lang, lesson.project),
        pages: lesson.pages.map((page) => ({
          ...page,
          image: page.image && join(path, editorOrBlockId, lang, page.image),
        })),
      },
    ];
  });
  return {
    ...tutorial,
    lessons: Object.fromEntries(lessons),
  };
};

export const readLoaclTutorials = () => {
  ipcMain.on('local:tutorials', (event, editorOrBlockId, lang) => {
    try {
      event.returnValue = getTutorialsInfo(localPath.tutorials, escape(editorOrBlockId), lang);
    } catch (err) {
      event.returnValue = null;
    }
  });
};
