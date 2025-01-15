import { ScratchBlocks } from './scratch-blocks';
import { importExtension } from './import-extension';

const BlankXML = '<xml xmlns="http://www.w3.org/1999/xhtml"><variables></variables></xml>';

export async function preloadProjectBlocks(meta, files) {
  const extensions = new Map();
  const xmls = new Map();

  if (meta.extensions) {
    for (const extId of meta.extensions) {
      const extObj = await importExtension(extId);
      extensions.set(extId, extObj);
    }
  }

  if (files) {
    for (const file of files) {
      const xml = file.xml ?? BlankXML;
      const xmlDom = ScratchBlocks.Xml.textToDom(xml);
      xmls.set(file.id, { xml, xmlDom });
    }
  }

  return {
    xmls,
    extensions: extensions.entries(),
  };
}
