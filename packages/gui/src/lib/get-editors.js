import { readEditors } from './read-editors' with { type: 'macro' };

const editors = readEditors();

export default function () {
  return Promise.all(
    editors.map(async (id) => {
      const { default: info } = await import(`${id}/info`);
      info.id = id;
      return info;
    }),
  );
}
