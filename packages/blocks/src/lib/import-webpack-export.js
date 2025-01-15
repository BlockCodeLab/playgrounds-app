export const importWebpackExport = async (file) => {
  const code = await Bun.file(import.meta.resolveSync(file)).text();
  return code;
};
