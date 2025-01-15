import { sleepMs } from '@blockcode/utils';
import { ScratchBlocks } from './scratch-blocks';

const BLANK_XML = '<xml xmlns="http://www.w3.org/1999/xhtml"><variables></variables></xml>';

export function loadXmlToWorkspace(xmlDom, globalVariables, workspace) {
  if (!xmlDom || typeof xmlDom === 'string') {
    xmlDom = ScratchBlocks.Xml.textToDom(xmlDom ?? BLANK_XML);
  }
  if (!xmlDom) return;

  // 移除 xml 中的旧全局变量
  if (globalVariables) {
    const varDom = xmlDom.querySelector('variables');
    if (varDom) {
      varDom.querySelectorAll('[islocal=false]').forEach((child) => varDom.removeChild(child));
    }
  }

  // 载入 xml 到工作
  ScratchBlocks.Xml.clearWorkspaceAndLoadFromXml(xmlDom, workspace);

  // 添加工作区中的新全局变量
  if (globalVariables) {
    const varDom = ScratchBlocks.Xml.variablesToDom(globalVariables);
    if (varDom) {
      ScratchBlocks.Xml.domToVariables(varDom, workspace);
    }
  }
}
