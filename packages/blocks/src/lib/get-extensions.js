import { readExtensions } from './read-extensions' with { type: 'macro' };

const extensions = readExtensions();

export default function () {
  return Promise.all(
    extensions.map(async (id) => {
      const { default: info } = await import(`${id}/info`);
      info.id = id;
      return info;
    }),
  );
}
