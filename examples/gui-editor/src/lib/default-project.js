import { nanoid } from '@blockcode/utils';

export const defaultProject = {
  // 附加资源文件
  assets: [],

  // 项目编辑文件
  files: [
    {
      id: nanoid(),
    },
  ],
};
