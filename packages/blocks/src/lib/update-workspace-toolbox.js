import { ScratchBlocks } from './scratch-blocks';

export function updateWorkspaceToolbox(workspace, toolboxXml) {
  // 更新工作区
  const xmlDom = ScratchBlocks.Xml.workspaceToDom(workspace);
  ScratchBlocks.Xml.clearWorkspaceAndLoadFromXml(xmlDom, workspace);

  // 记录工具栏位置
  const categoryId = workspace.toolbox_.getSelectedCategoryId();
  const offset = workspace.toolbox_.getCategoryScrollOffset();
  workspace.getFlyout().setRecyclingEnabled(false);

  // 更新积木栏
  workspace.updateToolbox(toolboxXml);

  // 滚动到之前的位置或选择的位置
  const currentCategoryPos = workspace.toolbox_.getCategoryPositionById(categoryId);
  const currentCategoryLen = workspace.toolbox_.getCategoryLengthById(categoryId);
  if (offset < currentCategoryLen) {
    workspace.toolbox_.setFlyoutScrollPos(currentCategoryPos + offset);
  } else {
    workspace.toolbox_.setFlyoutScrollPos(currentCategoryPos);
  }
  workspace.getFlyout().setRecyclingEnabled(true);
}
