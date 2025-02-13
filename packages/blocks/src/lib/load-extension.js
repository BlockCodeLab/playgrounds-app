import { xmlEscape, Konva } from '@blockcode/utils';
import { themeColors, maybeTranslate } from '@blockcode/core';
import { Runtime } from './runtime/runtime';
import { ScratchBlocks } from '../lib/scratch-blocks';
import { blockSeparator, categorySeparator } from '../lib/make-toolbox-xml';

const OUTPUT_SHAPE_HEXAGONAL = 1;
const OUTPUT_SHAPE_ROUND = 2;
const OUTPUT_SHAPE_SQUARE = 3;

const THEME_COLOR = themeColors.blocks.primary;
const INPUT_COLOR = themeColors.blocks.secondary;
const OTHER_COLOR = themeColors.blocks.tertiary;

const ShadowTypes = {
  number: 'math_number',
  angle: 'math_angle',
  text: 'text',
  string: 'text',
  color: 'colour_picker',
  matrix: 'matrix',
  note: 'note',
};

const FieldTypes = {
  number: 'NUM',
  angle: 'NUM',
  text: 'TEXT',
  string: 'TEXT',
  matrix: 'MATRIX',
  note: 'NOTE',
};

export function loadExtension(generator, emulator, extObj, translator, blockFilter) {
  const extId = extObj.id;
  const extName = maybeTranslate(extObj.name, translator);

  // 扩展模拟器
  if (emulator && extObj.emulator && Runtime.currentRuntime) {
    if (!Runtime.currentRuntime._extensions.has(extId)) {
      const runtime = new Proxy(Runtime.currentRuntime, {
        get(target, prop, receiver) {
          if (prop === 'on') {
            return (eventName, listener) => {
              // 扩展硬件连接
              if (eventName === 'connecting') {
                eventName = `${extId}.connecting`;
              }
              target.on(eventName, listener);
            };
          }
          if (prop === 'emit') {
            return (eventName, ...args) => {
              // 扩展硬件断开连接
              if (eventName === 'disconnect') {
                eventName = `${extId}.disconnect`;
              }
              target.emit(eventName, ...args);
            };
          }
          return Reflect.get(target, prop, target);
        },
      });
      const extEmu = extObj.emulator(runtime, Konva, translator);
      Runtime.currentRuntime._extensions.set(extId, extEmu);
    }
  }

  let categoryXML = `<category name="${xmlEscape(extName)}" id="${xmlEscape(extId)}"`;
  categoryXML += ` colour="${xmlEscape(extObj.themeColors || THEME_COLOR)}"`;
  categoryXML += ` secondaryColour="${xmlEscape(extObj.inputColor || INPUT_COLOR)}"`;
  if (extObj.statusButton) {
    categoryXML += ` showStatusButton="true"`;
  }
  if (extObj.icon) {
    categoryXML += ` iconURI="${xmlEscape(extObj.icon)}"`;
  }
  categoryXML += `>`;

  extObj.menus = extObj.menus || {};
  extObj.blocks
    .filter((block) => !block.hidden)
    .forEach((block) => {
      if (block === '---') {
        categoryXML += `${blockSeparator}`;
        return;
      }

      if (block.button) {
        categoryXML += `<button text="${maybeTranslate(block.text, translator)}" callbackKey="${
          block.button
        }"></button>`;
        const workspace = ScratchBlocks.getMainWorkspace();
        if (workspace) {
          const flyout = workspace.getFlyout();
          if (flyout) {
            const toolboxWorkspace = flyout.getWorkspace();
            if (toolboxWorkspace) {
              toolboxWorkspace.registerButtonCallback(block.button, block.onClick);
            }
          }
        }
        return;
      }

      // 运行积木过滤器
      if (blockFilter && !blockFilter(block)) return;

      const blockId = `${extId}_${block.id}`;
      const blockJson = {
        message0: maybeTranslate(block.text, translator),
        category: extId,
        outputShape: OUTPUT_SHAPE_SQUARE,
        colour: extObj.themeColors || THEME_COLOR,
        colourSecondary: extObj.inputColor || INPUT_COLOR,
        colourTertiary: extObj.otherColor || OTHER_COLOR,
      };

      let argsIndexStart = 1;
      if (extObj.icon) {
        blockJson.message0 = `%1 %2 ${blockJson.message0}`;
        blockJson.args0 = [
          {
            type: 'field_image',
            src: extObj.icon,
            width: 40,
            height: 40,
          },
          {
            type: 'field_vertical_separator',
          },
        ];
        blockJson.extensions = ['scratch_extension'];
        argsIndexStart += 2;
      }

      if (block.hat) {
        blockJson.nextStatement = null;
      } else if (block.output) {
        if (block.output === 'boolean') {
          blockJson.output = 'Boolean';
          blockJson.outputShape = OUTPUT_SHAPE_HEXAGONAL;
        } else {
          blockJson.output = 'String'; // TODO: text or nubmer
          blockJson.outputShape = OUTPUT_SHAPE_ROUND;
        }
        blockJson.checkboxInFlyout = block.monitoring !== false;
      } else {
        blockJson.previousStatement = null;
        blockJson.nextStatement = null;
      }

      let blockXML = `<block type="${xmlEscape(blockId)}">`;

      if (block.inputs) {
        blockJson.checkboxInFlyout = false;
        blockJson.args0 = [].concat(
          blockJson.args0 || [],
          Object.entries(block.inputs).map(([name, arg]) => {
            const argObject = {
              name,
              type: 'input_value',
            };

            if (arg.menu) {
              let menu = arg.menu;
              let menuName = arg.name || name;
              let inputMode = arg.inputMode || false;
              let inputType = arg.type || 'string';
              let inputDefault = arg.defaultValue || '';
              if (typeof menu === 'string') {
                menuName = arg.menu;
                menu = extObj.menus[menuName];
              }
              if (!Array.isArray(menu)) {
                inputMode = menu.inputMode || inputMode;
                inputType = menu.type || inputType;
                inputDefault = menu.defaultValue || inputDefault;
                menu = menu.items;
              }
              if (inputMode) {
                if (!extObj.menus[menuName]) {
                  extObj.menus[menuName] = {
                    inputMode,
                    type: inputType,
                    items: menu,
                  };
                }
                blockXML += `<value name="${xmlEscape(name)}">`;
                blockXML += `<shadow type="${extId}_menu_${menuName}">`;
                if (inputDefault) {
                  blockXML += `<field name="${menuName}">${xmlEscape(inputDefault)}</field>`;
                }
                blockXML += '</shadow></value>';
              } else if (menu) {
                argObject.type = 'field_dropdown';
                argObject.options = menu.map((item) => {
                  if (Array.isArray(item)) {
                    const [text, value] = item;
                    return [maybeTranslate(text, translator), value];
                  }
                  item = `${item}`;
                  return [item, item];
                });
              }
            } else if (arg.type === 'boolean') {
              argObject.check = 'Boolean';
            } else {
              blockXML += `<value name="${xmlEscape(name)}">`;
              if (ShadowTypes[arg.type]) {
                blockXML += `<shadow type="${ShadowTypes[arg.type]}">`;
                if (arg.defaultValue && FieldTypes[arg.type]) {
                  blockXML += `<field name="${FieldTypes[arg.type]}">${xmlEscape(
                    maybeTranslate(arg.defaultValue, translator),
                  )}</field>`;
                }
                blockXML += '</shadow>';
              }
              blockXML += '</value>';
            }

            blockJson.message0 = blockJson.message0.replace(`[${name}]`, `%${argsIndexStart++}`);
            return argObject;
          }),
        );
      }

      // 合并积木
      ScratchBlocks.Blocks[blockId] = {
        init() {
          this.jsonInit(blockJson);
        },
      };

      // 合并扩展积木代码生成器
      if (generator) {
        let codeName = generator.name_.toLowerCase();
        if (block[codeName]) {
          generator[blockId] = block[codeName].bind(generator);
        } else {
          generator[blockId] = () => '';
        }
      }

      // 模拟器
      if (emulator) {
        let codeName = emulator.name_.toLowerCase();
        if (block[codeName]) {
          emulator[blockId] = block[codeName].bind(emulator);
        } else {
          emulator[blockId] = () => '';
        }
      }

      blockXML += '</block>';
      categoryXML += blockXML;
    });

  // 选项菜单输入
  Object.entries(extObj.menus).forEach(([menuName, menu]) => {
    if (!menu.inputMode) return;

    const blockId = `${extId}_menu_${menuName}`;
    const outputType = menu.type === 'number' ? 'output_number' : 'output_string';
    const blockJson = {
      message0: '%1',
      args0: [
        {
          type: 'field_dropdown',
          name: menuName,
          options: menu.items.map((item) => {
            if (Array.isArray(item)) {
              const [text, value] = item;
              return [xmlEscape(maybeTranslate(text, translator)), value];
            }
            item = `${item}`;
            return [item, item];
          }),
        },
      ],
      category: extId,
      colour: extObj.themeColors || THEME_COLOR,
      colourSecondary: extObj.inputColor || INPUT_COLOR,
      colourTertiary: extObj.otherColor || OTHER_COLOR,
      extensions: [outputType],
    };

    ScratchBlocks.Blocks[blockId] = {
      init() {
        this.jsonInit(blockJson);
      },
    };

    if (generator) {
      generator[blockId] = (block) => {
        const value = block.getFieldValue(menuName);
        return [value, generator.ORDER_ATOMIC];
      };
    }

    // 模拟器
    if (emulator) {
      emulator[blockId] = (block) => {
        const value = block.getFieldValue(menuName);
        return [value, emulator.ORDER_ATOMIC];
      };
    }
  });

  categoryXML += `${categorySeparator}</category>`;
  return categoryXML;
}
