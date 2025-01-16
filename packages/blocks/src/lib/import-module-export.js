export async function importModuleExport(file) {
  const code = await Bun.file(Bun.resolveSync(file, import.meta.dir)).text();
  return code;
}
