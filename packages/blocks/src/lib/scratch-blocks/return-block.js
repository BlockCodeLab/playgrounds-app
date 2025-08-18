import { translate } from '@blockcode/core';
import { ScratchBlocks } from './scratch-blocks';

const PROCEDURES_CALL_TYPE_STATEMENT = 0;
const PROCEDURES_CALL_TYPE_BOOLEAN = 1;
const PROCEDURES_CALL_TYPE_REPORTER = 2;
const PROCEDURES_CALL_TYPE_REPORTER_STRING = 3;

// 返回值积木
ScratchBlocks.Blocks['procedures_return'] = {
  init() {
    this.jsonInit({
      message0: translate('blocks.myblock.return', 'return %1'),
      args0: [
        {
          type: 'input_value',
          name: 'VALUE',
        },
      ],
      category: ScratchBlocks.Categories.more,
      extensions: ['colours_more', 'shape_end'],
    });
  },
};

// 返回字符串
ScratchBlocks.Blocks['procedures_return_string'] = {
  init() {
    this.jsonInit({
      message0: translate('blocks.myblock.returnString', 'return string %1'),
      args0: [
        {
          type: 'input_value',
          name: 'STR',
        },
      ],
      category: ScratchBlocks.Categories.more,
      extensions: ['colours_more', 'shape_end'],
    });
  },
};

// 调用自制积木
//
ScratchBlocks.Blocks['procedures_call'].init = function () {
  this.jsonInit({
    extensions: ['colours_more', 'procedure_call_contextmenu'],
  });
  this.procCode_ = '';
  this.argumentIds_ = [];
  this.warp_ = false;
  this.return_ = PROCEDURES_CALL_TYPE_STATEMENT;
};

ScratchBlocks.Blocks['procedures_call'].updateDisplay_ = function () {
  const wasRendered = this.rendered;
  this.rendered = false;

  const connectionMap = this.disconnectOldBlocks_();
  this.removeAllInputs_();

  this.createAllInputs_(connectionMap);
  this.deleteShadows_(connectionMap);

  if (!wasRendered) {
    if (this.return_ === PROCEDURES_CALL_TYPE_STATEMENT) {
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
    } else {
      if (this.return_ === PROCEDURES_CALL_TYPE_BOOLEAN) {
        this.setOutput(true, null);
        this.setOutputShape(ScratchBlocks.OUTPUT_SHAPE_HEXAGONAL);
      } else {
        this.setOutput(true, ScratchBlocks.Procedures.ENFORCE_TYPES ? 'Number' : null);
        this.setOutputShape(ScratchBlocks.OUTPUT_SHAPE_ROUND);
      }
    }
  }

  this.rendered = wasRendered;
  if (wasRendered && !this.isInsertionMarker()) {
    this.initSvg();
    this.render();
  }
};

ScratchBlocks.Blocks['procedures_call'].domToMutation = function (xmlElement) {
  this.procCode_ = xmlElement.getAttribute('proccode');
  this.generateShadows_ = JSON.parse(xmlElement.getAttribute('generateshadows'));
  this.argumentIds_ = JSON.parse(xmlElement.getAttribute('argumentids'));
  this.warp_ = JSON.parse(xmlElement.getAttribute('warp'));
  this.return_ = parseReturnMutation(xmlElement);
  this.updateDisplay_();
};

ScratchBlocks.Blocks['procedures_call'].mutationToDom = function () {
  const container = document.createElement('mutation');
  container.setAttribute('proccode', this.procCode_);
  container.setAttribute('argumentids', JSON.stringify(this.argumentIds_));
  container.setAttribute('warp', JSON.stringify(this.warp_));
  if (this.return_ !== PROCEDURES_CALL_TYPE_STATEMENT) {
    container.setAttribute('return', this.return_);
  }
  return container;
};

function parseReturnMutation(xmlElement) {
  if (xmlElement.hasAttribute('return')) {
    const type = +xmlElement.getAttribute('return');
    if (
      type === PROCEDURES_CALL_TYPE_STATEMENT ||
      type === PROCEDURES_CALL_TYPE_BOOLEAN ||
      type === PROCEDURES_CALL_TYPE_REPORTER ||
      type === PROCEDURES_CALL_TYPE_REPORTER_STRING
    ) {
      return type;
    }
  }
  return PROCEDURES_CALL_TYPE_STATEMENT;
}

// 列出所有自制积木
// 在自制积木前显示返回值积木
//
ScratchBlocks.Procedures.flyoutCategory = function (workspace) {
  let xmlList = [];

  ScratchBlocks.Procedures.addCreateButton_(workspace, xmlList);

  // Create call blocks for each procedure defined in the workspace
  let mutations = ScratchBlocks.Procedures.allProcedureMutations(workspace);
  mutations = ScratchBlocks.Procedures.sortProcedureMutations_(mutations);

  // 初始时启用返回值积木，如果有自制积木，显示返回值积木
  if (workspace.procedureReturnsEnabled_ && mutations.length > 0) {
    // 返回字符串积木
    const returnStringText =
      '<block type="procedures_return_string">' +
      '<value name="STR">' +
      '<shadow type="text">' +
      '<field name="TEXT"/>' +
      '</shadow>' +
      '</value>' +
      '</block>';
    const returnStringBlock = ScratchBlocks.Xml.textToDom(returnStringText);

    let shadowValue = '<shadow type="text">' + '<field name="TEXT"/>' + '</shadow>';
    if (workspace.procedureReturnsEnabled_ === 2) {
      xmlList.push(returnStringBlock);
      shadowValue = '<shadow type="math_number">' + '<field name="NUM">1</field>' + '</shadow>';
    }

    // 返回值积木
    const returnText =
      '<block type="procedures_return">' + '<value name="VALUE">' + shadowValue + '</value>' + '</block>';
    const returnBlock = ScratchBlocks.Xml.textToDom(returnText);

    xmlList.push(returnBlock);

    // 分割线
    const sep = ScratchBlocks.Xml.textToDom('<sep gap="36"/>');
    xmlList.push(sep);
  }

  // 列出所有自制积木
  for (let i = 0; i < mutations.length; i++) {
    const mutation = mutations[i].cloneNode(false);
    // 从工作区获取自制积木返回值类型
    const procCode = mutation.getAttribute('proccode');
    const returnType = getProcedureReturnType(procCode, workspace);
    if (returnType !== PROCEDURES_CALL_TYPE_STATEMENT) {
      mutation.setAttribute('return', returnType);
    }
    // <block type="procedures_call">
    //   <mutation ...></mutation>
    // </block>
    const blockText = '<block type="procedures_call" gap="16"></block>';
    const block = ScratchBlocks.Xml.textToDom(blockText);
    block.appendChild(mutation);
    xmlList.push(block);
  }

  return xmlList;
};

function getProcedureReturnType(procCode, workspace) {
  const defineBlock = ScratchBlocks.Procedures.getDefineBlock(procCode, workspace);
  if (!defineBlock) {
    return PROCEDURES_CALL_TYPE_STATEMENT;
  }
  return getBlockReturnType(defineBlock);
}

function getBlockReturnType(block) {
  let hasSeenBooleanReturn = false;
  const descendants = block.getDescendants();
  const myBlock = block.childBlocks_[0];
  for (let i = 0; i < descendants.length; i++) {
    if (descendants[i].type === 'procedures_return_string') {
      myBlock.return_ = PROCEDURES_CALL_TYPE_REPORTER_STRING;
      return myBlock.return_;
    } else if (descendants[i].type === 'procedures_return') {
      if (i + 1 < descendants.length && descendants[i + 1].outputShape_ === ScratchBlocks.OUTPUT_SHAPE_HEXAGONAL) {
        hasSeenBooleanReturn = true;
      } else {
        myBlock.return_ = PROCEDURES_CALL_TYPE_REPORTER;
        return myBlock.return_;
      }
    }
  }
  if (hasSeenBooleanReturn) {
    myBlock.return_ = PROCEDURES_CALL_TYPE_BOOLEAN;
  } else {
    myBlock.return_ = PROCEDURES_CALL_TYPE_STATEMENT;
  }
  return myBlock.return_;
}

// 积木断开连接时
// 根据断开的返回值积木自动切换自制积木的外形
//
ScratchBlocks.Connection.prototype.disconnectInternal_ = function (parentBlock, childBlock) {
  if (ScratchBlocks.Events.isEnabled() && !childBlock.isInsertionMarker()) {
    childBlock.workspace.procedureReturnsWillChange();
  }

  let event;
  if (ScratchBlocks.Events.isEnabled()) {
    event = new ScratchBlocks.Events.BlockMove(childBlock);
  }

  const otherConnection = this.targetConnection;
  otherConnection.targetConnection = null;
  this.targetConnection = null;
  childBlock.setParent(null);
  if (event) {
    event.recordNew();
    ScratchBlocks.Events.fire(event);
  }
};

// 积木连接时
// 根据是否使用返回值积木自动切换自制积木的外形
//
ScratchBlocks.Connection.prototype.connect_ = function (childConnection) {
  const parentConnection = this;
  const parentBlock = parentConnection.getSourceBlock();
  const childBlock = childConnection.getSourceBlock();
  let isSurroundingC = false;
  if (parentConnection == parentBlock.getFirstStatementConnection()) {
    isSurroundingC = true;
  }

  // 连接返回积木
  if (ScratchBlocks.Events.isEnabled() && !childBlock.isInsertionMarker()) {
    childBlock.workspace.procedureReturnsWillChange();
  }

  // Disconnect any existing parent on the child connection.
  let previousParentConnection;
  if (childConnection.isConnected()) {
    // Scratch-specific behaviour:
    // If we're using a c-shaped block to surround a stack, remember where the
    // stack used to be connected.
    if (isSurroundingC) {
      previousParentConnection = childConnection.targetConnection;
    }
    childConnection.disconnect();
  }
  if (parentConnection.isConnected()) {
    // Other connection is already connected to something.
    // Disconnect it and reattach it or bump it as needed.
    let orphanBlock = parentConnection.targetBlock();
    let shadowDom = parentConnection.getShadowDom();
    // Temporarily set the shadow DOM to null so it does not respawn.
    parentConnection.setShadowDom(null);
    // Displaced shadow blocks dissolve rather than reattaching or bumping.
    if (orphanBlock.isShadow()) {
      // Save the shadow block so that field values are preserved.
      shadowDom = ScratchBlocks.Xml.blockToDom(orphanBlock);
      orphanBlock.dispose();
      orphanBlock = null;
    } else if (parentConnection.type == ScratchBlocks.NEXT_STATEMENT) {
      // Statement connections.
      // Statement blocks may be inserted into the middle of a stack.
      // Split the stack.
      if (!orphanBlock.previousConnection) {
        throw 'Orphan block does not have a previous connection.';
      }
      // Attempt to reattach the orphan at the bottom of the newly inserted
      // block.  Since this block may be a stack, walk down to the end.
      let newBlock = childBlock;
      while (newBlock.nextConnection) {
        const nextBlock = newBlock.getNextBlock();
        if (nextBlock && !nextBlock.isShadow()) {
          newBlock = nextBlock;
        } else {
          if (orphanBlock.previousConnection.checkType_(newBlock.nextConnection)) {
            newBlock.nextConnection.connect(orphanBlock.previousConnection);
            orphanBlock = null;
          }
          break;
        }
      }
    }
    if (orphanBlock) {
      // Unable to reattach orphan.
      parentConnection.disconnect();
      if (ScratchBlocks.Events.recordUndo) {
        // Bump it off to the side after a moment.
        const group = ScratchBlocks.Events.getGroup();
        setTimeout(function () {
          // Verify orphan hasn't been deleted or reconnected (user on meth).
          if (orphanBlock.workspace && !orphanBlock.getParent()) {
            ScratchBlocks.Events.setGroup(group);
            if (orphanBlock.outputConnection) {
              orphanBlock.outputConnection.bumpAwayFrom_(parentConnection);
            } else if (orphanBlock.previousConnection) {
              orphanBlock.previousConnection.bumpAwayFrom_(parentConnection);
            }
            ScratchBlocks.Events.setGroup(false);
          }
        }, ScratchBlocks.BUMP_DELAY);
      }
    }
    // Restore the shadow DOM.
    parentConnection.setShadowDom(shadowDom);
  }

  if (isSurroundingC && previousParentConnection) {
    previousParentConnection.connect(parentBlock.previousConnection);
  }

  let event;
  if (ScratchBlocks.Events.isEnabled()) {
    event = new ScratchBlocks.Events.BlockMove(childBlock);
  }
  // Establish the connections.
  ScratchBlocks.Connection.connectReciprocally_(parentConnection, childConnection);
  // Demote the inferior block so that one is a child of the superior one.
  childBlock.setParent(parentBlock);
  if (event) {
    event.recordNew();
    ScratchBlocks.Events.fire(event);
  }
};

ScratchBlocks.WorkspaceSvg.prototype.procedureReturnsWillChange = function () {
  if (this.initialProcedureReturnTypes_) {
    // Already queued.
    return;
  }

  this.initialProcedureReturnTypes_ = getAllProcedureReturnTypes(this);

  if (this.currentGesture_) {
    this.checkProcedureReturnAfterGesture_ = true;
  } else {
    this.procedureReturnChangeTimeout_ = setTimeout(this.processProcedureReturnsChanged_.bind(this));
  }
};

ScratchBlocks.WorkspaceSvg.prototype.processProcedureReturnsChanged_ = function () {
  const initialTypes = this.initialProcedureReturnTypes_;
  const finalTypes = getAllProcedureReturnTypes(this);

  this.initialProcedureReturnTypes_ = null;
  this.checkProcedureReturnAfterGesture_ = false;
  this.procedureReturnChangeTimeout_ = null;

  ScratchBlocks.Events.setGroup(true);
  const topBlocks = this.getTopBlocks(false);
  for (let i = 0; i < topBlocks.length; i++) {
    const block = topBlocks[i];
    if (block.type !== 'procedures_call') continue;

    // After a gesture, we are called early enough that there could still be insertion markers.
    if (block.isInsertionMarker()) continue;

    // Because this block is a top block, it by definition won't have a parent, but if another
    // block is connected below, we should leave it unchanged instead of unplugging.
    if (block.getNextBlock()) continue;

    const procCode = block.getProcCode();
    // If the procedure doesn't exist or is new, ignore it.
    if (
      !Object.prototype.hasOwnProperty.call(initialTypes, procCode) ||
      !Object.prototype.hasOwnProperty.call(finalTypes, procCode)
    )
      continue;

    const actualReturnType = finalTypes[procCode];
    if (
      block.return_ !== actualReturnType &&
      // If user is allowed to override call block shape, only update the shape if the definition's
      // shape has actually changed.
      (!ScratchBlocks.Procedures.USER_CAN_CHANGE_CALL_TYPE || initialTypes[procCode] !== actualReturnType)
    ) {
      changeReturnType(block, actualReturnType);
    }
  }
  ScratchBlocks.Events.setGroup(false);

  // Toolbox refresh can be slow, so only do when needed.
  let toolboxOutdated = false;
  for (const procCode in finalTypes) {
    // If a current procedure existed but its type has changed, the toolbox must be updated.
    // If a new procedure was created, the toolbox is already updated elsewhere.
    if (
      Object.prototype.hasOwnProperty.call(initialTypes, procCode) &&
      initialTypes[procCode] !== finalTypes[procCode]
    ) {
      toolboxOutdated = true;
      break;
    }
  }
  if (toolboxOutdated) {
    this.refreshToolboxSelection_();
  }
};

ScratchBlocks.WorkspaceSvg.prototype.clearGesture = function () {
  this.currentGesture_ = null;

  if (this.checkProcedureReturnAfterGesture_) {
    this.processProcedureReturnsChanged_();
  }
};

function getAllProcedureReturnTypes(workspace) {
  const result = Object.create(null);
  const blocks = workspace.getTopBlocks(false);
  for (let i = 0; i < blocks.length; i++) {
    if (blocks[i].type == ScratchBlocks.PROCEDURES_DEFINITION_BLOCK_TYPE) {
      const procCode = blocks[i].getInput('custom_block').connection.targetBlock()?.getProcCode?.();
      // To match behavior of getDefineBlock, if multiple instances of this procedure are
      // defined, only use the first one.
      if (procCode && !Object.prototype.hasOwnProperty.call(result, procCode)) {
        result[procCode] = getBlockReturnType(blocks[i]);
      }
    }
  }
  return result;
}

function changeReturnType(block, returnType) {
  block.unplug(true);
  const workspace = block.workspace;
  const xml = ScratchBlocks.Xml.blockToDom(block);
  const xy = block.getRelativeToSurfaceXY();
  block.dispose();

  const mutation = xml.querySelector('mutation');
  mutation.setAttribute('return', returnType);

  const newBlock = ScratchBlocks.Xml.domToBlock(xml, workspace);
  newBlock.moveBy(xy.x, xy.y);
}
