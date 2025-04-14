// 从网络（projecthub）加载案例
const PROJECTHUB_URL = 'https://hub.blockcode.fun';

export default async function (editors) {
  const hub = await fetch(`${PROJECTHUB_URL}/home.json`).then((res) => res.json());
  return Promise.all(
    hub
      // 案例根据可用的编辑器进行过滤
      .filter((item) => (item.editor ? editors.find((editor) => editor.id === item.editor) : true))
      .map(async (item) => {
        const editor = editors.find((editor) => editor.id === item.editor);
        const examples = await fetch(`${PROJECTHUB_URL}/${item.import}`).then((res) => res.json());
        return {
          name: editor?.name,
          examples: examples
            // 案例根据可用的编辑器进行过滤
            .filter((item) => editors.find((editor) => editor.id === item.editor))
            .map((item) => ({
              ...item,
              file: `${PROJECTHUB_URL}/${item.file}`,
              thumb: `${PROJECTHUB_URL}/${item.thumb}`,
            })),
        };
      }),
  );
}
