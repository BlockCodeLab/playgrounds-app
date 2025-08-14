import { themeColors } from '@blockcode/core';
import { ScratchBlocks } from './scratch-blocks';

import '../blocks/blocks';

export const blockSeparator = '<sep gap="36"/>';

export const categorySeparator = '<sep gap="36"/>';

export const motionTheme = `
  colour="${themeColors.blocks.motion.primary}" secondaryColour="${themeColors.blocks.motion.secondary}"`;
export const looksTheme = `
  colour="${themeColors.blocks.looks.primary}" secondaryColour="${themeColors.blocks.looks.secondary}"`;
export const soundTheme = `
  colour="${themeColors.blocks.sounds.primary}" secondaryColour="${themeColors.blocks.sounds.secondary}"`;
export const eventsTheme = `
  colour="${themeColors.blocks.events.primary}" secondaryColour="${themeColors.blocks.events.secondary}"`;
export const controlTheme = `
  colour="${themeColors.blocks.control.primary}" secondaryColour="${themeColors.blocks.control.secondary}"`;
export const sensingTheme = `
  colour="${themeColors.blocks.sensing.primary}" secondaryColour="${themeColors.blocks.sensing.secondary}"`;
export const operatorsTheme = `
  colour="${themeColors.blocks.operators.primary}" secondaryColour="${themeColors.blocks.operators.secondary}"`;
export const variablesTheme = `
  colour="${themeColors.blocks.variables.primary}" secondaryColour="${themeColors.blocks.variables.secondary}"`;
export const myBlocksTheme = `
  colour="${themeColors.blocks.myblocks.primary}" secondaryColour="${themeColors.blocks.myblocks.secondary}"`;
export const monitorTheme = `
  colour="${themeColors.blocks.monitor.primary}" secondaryColour="${themeColors.blocks.monitor.secondary}"`;

const events = () => `
  <category name="%{BKY_CATEGORY_EVENTS}" id="event" ${eventsTheme}>
  <block type="event_whenflagclicked"/>
  ${categorySeparator}
  </category>
`;

// enableCloneBlocks = null 不允许克隆
// enableCloneBlocks = true 允许克隆并可控制克隆体
// enableCloneBlocks = false 仅允许克隆但不允许控制克隆体
const control = (enableCloneBlocks) => `
  <category name="%{BKY_CATEGORY_CONTROL}" id="control" ${controlTheme}>
    <block type="control_wait">
      <value name="DURATION">
        <shadow type="math_positive_number">
          <field name="NUM">1</field>
        </shadow>
      </value>
    </block>
    ${blockSeparator}
    <block type="control_repeat">
      <value name="TIMES">
        <shadow type="math_whole_number">
          <field name="NUM">10</field>
        </shadow>
      </value>
    </block>
    <block type="control_forever"/>
    ${blockSeparator}
    <block type="control_if"/>
    <block type="control_if_else"/>
    <block type="control_wait_until"/>
    <block type="control_repeat_until"/>
    <block type="control_while"/>
    ${blockSeparator}
    <block type="control_stop"/>
    ${
      enableCloneBlocks != null
        ? enableCloneBlocks
          ? `
            ${blockSeparator}
            <block type="control_start_as_clone"/>
            <block type="control_create_clone_of">
              <value name="CLONE_OPTION">
                <shadow type="control_create_clone_of_menu"/>
              </value>
            </block>
            <block type="control_delete_this_clone"/>
            `
          : `
            ${blockSeparator}
            <block type="control_create_clone_of">
              <value name="CLONE_OPTION">
                <shadow type="control_create_clone_of_menu"/>
              </value>
            </block>
            `
        : ''
    }
    ${categorySeparator}
  </category>
`;

const sensing = (disableSensingBlocks) =>
  disableSensingBlocks
    ? ''
    : `
      <category name="%{BKY_CATEGORY_SENSING}" id="sensing" ${sensingTheme}>
        <block type="sensing_timer"/>
        <block type="sensing_resettimer"/>
        ${categorySeparator}
      </category>
      `;

const operators = (enableStringBlocks) => `
  <category name="%{BKY_CATEGORY_OPERATORS}" id="operator" ${operatorsTheme}>
    <block type="operator_add">
      <value name="NUM1">
        <shadow type="math_number">
          <field name="NUM"/>
        </shadow>
      </value>
      <value name="NUM2">
        <shadow type="math_number">
          <field name="NUM"/>
        </shadow>
      </value>
    </block>
    <block type="operator_subtract">
      <value name="NUM1">
        <shadow type="math_number">
          <field name="NUM"/>
        </shadow>
      </value>
      <value name="NUM2">
        <shadow type="math_number">
          <field name="NUM"/>
        </shadow>
      </value>
    </block>
    <block type="operator_multiply">
      <value name="NUM1">
        <shadow type="math_number">
          <field name="NUM"/>
        </shadow>
      </value>
      <value name="NUM2">
        <shadow type="math_number">
          <field name="NUM"/>
        </shadow>
      </value>
    </block>
    <block type="operator_divide">
      <value name="NUM1">
        <shadow type="math_number">
          <field name="NUM"/>
        </shadow>
      </value>
      <value name="NUM2">
        <shadow type="math_number">
          <field name="NUM"/>
        </shadow>
      </value>
    </block>
    ${blockSeparator}
    <block type="operator_random">
      <value name="FROM">
        <shadow type="math_number">
          <field name="NUM">1</field>
        </shadow>
      </value>
      <value name="TO">
        <shadow type="math_number">
          <field name="NUM">10</field>
        </shadow>
      </value>
    </block>
    ${blockSeparator}
    <block type="operator_gt">
      <value name="OPERAND1">
        <shadow type="math_number">
          <field name="NUM"/>
        </shadow>
      </value>
      <value name="OPERAND2">
        <shadow type="math_number">
          <field name="NUM">50</field>
        </shadow>
      </value>
    </block>
    <block type="operator_lt">
      <value name="OPERAND1">
        <shadow type="math_number">
          <field name="NUM"/>
        </shadow>
      </value>
      <value name="OPERAND2">
        <shadow type="math_number">
          <field name="NUM">50</field>
        </shadow>
      </value>
    </block>
    <block type="operator_equals">
      <value name="OPERAND1">
        <shadow type="text">
          <field name="TEXT"/>
        </shadow>
      </value>
      <value name="OPERAND2">
        <shadow type="text">
          <field name="TEXT">50</field>
        </shadow>
      </value>
    </block>
    <block type="operator_gte">
      <value name="OPERAND1">
        <shadow type="math_number">
          <field name="NUM"/>
        </shadow>
      </value>
      <value name="OPERAND2">
        <shadow type="math_number">
          <field name="NUM">50</field>
        </shadow>
      </value>
    </block>
    <block type="operator_lte">
      <value name="OPERAND1">
        <shadow type="math_number">
          <field name="NUM"/>
        </shadow>
      </value>
      <value name="OPERAND2">
        <shadow type="math_number">
          <field name="NUM">50</field>
        </shadow>
      </value>
    </block>
    <block type="operator_notequals">
      <value name="OPERAND1">
        <shadow type="text">
          <field name="TEXT"/>
        </shadow>
      </value>
      <value name="OPERAND2">
        <shadow type="text">
          <field name="TEXT">50</field>
        </shadow>
      </value>
    </block>
    ${blockSeparator}
    <block type="operator_and"/>
    <block type="operator_or"/>
    <block type="operator_not"/>
    ${
      enableStringBlocks
        ? `
          ${blockSeparator}
          <block type="operator_join">
            <value name="STRING1">
              <shadow type="text">
                <field name="TEXT">${ScratchBlocks.Msg.OPERATORS_JOIN_APPLE}</field>
              </shadow>
            </value>
            <value name="STRING2">
              <shadow type="text">
                <field name="TEXT">${ScratchBlocks.Msg.OPERATORS_JOIN_BANANA}</field>
              </shadow>
            </value>
          </block>
          <block type="operator_letter_of">
            <value name="LETTER">
              <shadow type="math_whole_number">
                <field name="NUM">1</field>
              </shadow>
            </value>
            <value name="STRING">
            <shadow type="text">
                <field name="TEXT">${ScratchBlocks.Msg.OPERATORS_JOIN_APPLE}</field>
            </shadow>
            </value>
          </block>
          <block type="operator_length">
            <value name="STRING">
              <shadow type="text">
                <field name="TEXT">${ScratchBlocks.Msg.OPERATORS_JOIN_APPLE}</field>
              </shadow>
            </value>
          </block>
          <block type="operator_contains">
            <value name="STRING1">
              <shadow type="text">
                <field name="TEXT">${ScratchBlocks.Msg.OPERATORS_JOIN_APPLE}</field>
              </shadow>
            </value>
            <value name="STRING2">
              <shadow type="text">
                <field name="TEXT">${ScratchBlocks.Msg.OPERATORS_LETTEROF_APPLE}</field>
              </shadow>
            </value>
          </block>
          `
        : ''
    }
    ${blockSeparator}
    <block type="operator_mod">
      <value name="NUM1">
        <shadow type="math_number">
          <field name="NUM"/>
        </shadow>
      </value>
      <value name="NUM2">
        <shadow type="math_number">
          <field name="NUM"/>
        </shadow>
      </value>
    </block>
    <block type="operator_round">
      <value name="NUM">
        <shadow type="math_number">
          <field name="NUM"/>
        </shadow>
      </value>
    </block>
    ${blockSeparator}
    <block type="operator_mathop">
      <value name="NUM">
        <shadow type="math_number">
          <field name="NUM"/>
        </shadow>
      </value>
    </block>
    ${categorySeparator}
  </category>
`;

const variables = () => `
  <category name="%{BKY_CATEGORY_VARIABLES}" id="variables" ${variablesTheme} custom="VARIABLE">
  </category>
`;

const myBlocks = () => `
  <category name="%{BKY_CATEGORY_MYBLOCKS}" id="myBlocks" ${myBlocksTheme} custom="PROCEDURE">
  </category>
`;

const monitor = (disableMonitor) =>
  disableMonitor
    ? ''
    : `
      <category name="${ScratchBlocks.Msg.CATEGORY_MONITOR}" id="monitor" ${monitorTheme}>
        ${
          DEBUG
            ? `
              <block type="monitor_debug">
                <value name="VALUE">
                  <shadow type="text">
                    <field name="TEXT">debug</field>
                  </shadow>
                </value>
              </block>
              ${blockSeparator}`
            : ''
        }
        <block type="monitor_showvalue">
          <value name="VALUE">
            <shadow type="text">
            <field name="TEXT"/>
            </shadow>
          </value>
        </block>
        <block type="monitor_shownamedvalue">
          <value name="VALUE">
            <shadow type="text">
            <field name="TEXT"/>
            </shadow>
          </value>
          <value name="LABEL">
            <shadow type="text">
            <field name="TEXT"/>
            </shadow>
          </value>
        </block>
        ${categorySeparator}
      </category>
    `;

export function makeToolboxXML(categoriesXML = [], options = {}) {
  const moveCategory = (categoryId) => {
    const index = categoriesXML.findIndex((categoryInfo) => categoryInfo.id === categoryId);
    if (index >= 0) {
      // remove the category from categoriesXML and return its XML
      const [categoryInfo] = categoriesXML.splice(index, 1);
      return categoryInfo.xml;
    }
    // return `undefined`
  };
  const eventsXML = moveCategory('event') || events();
  const controlXML = moveCategory('control') || control(options.enableCloneBlocks);
  const sensingXML = moveCategory('sensing') || sensing(options.disableSensingBlocks);
  const operatorsXML = moveCategory('operator') || operators(options.enableStringBlocks);
  const variablesXML = variables();
  const myBlocksXML = myBlocks();
  const monitorXML = monitor(!options.enableMonitor);

  const everything = [eventsXML, controlXML, sensingXML, operatorsXML, variablesXML, myBlocksXML].filter(
    (s) => s && s.trim(),
  );

  categoriesXML.sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity));

  for (const extensionCategory of categoriesXML) {
    if (extensionCategory.xml) {
      if (Number.isInteger(extensionCategory.order)) {
        everything.splice(extensionCategory.order, 0, extensionCategory.xml);
      } else {
        everything.push(extensionCategory.xml);
      }
    }
  }
  return everything.join(`\n`);
}
