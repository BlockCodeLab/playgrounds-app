import { readExtensions } from '../../lib/read-extensions' with { type: 'macro' };

const extensions = readExtensions();

export default function () {
  return Promise.all(
    extensions.map(async (id) => {
      const { default: info } = await import(`@blockcode/blocks-${id}/info`);
      info.id = id;
      return info;
    }),
  );
}
