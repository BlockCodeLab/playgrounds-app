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
  broadcast: 'event_broadcast_menu',
  number: 'math_number',
  angle: 'math_angle',
  text: 'text',
  string: 'text',
  color: 'colour_picker',
  matrix: 'matrix',
  note: 'note',
};

const FieldTypes = {
  broadcast: 'BROADCAST_INPUT',
  number: 'NUM',
  angle: 'NUM',
  text: 'TEXT',
  string: 'TEXT',
  matrix: 'MATRIX',
  note: 'NOTE',
};

export function loadExtension(extObj, options) {
  const extId = extObj.id;
  const extName = maybeTranslate(extObj.name);
  const { generator, emulator, onBlockFilter } = options;

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
      const extEmu = extObj.emulator(runtime, Konva);
      Runtime.currentRuntime._extensions.set(extId, extEmu);
    }
  }

  let categoryXML = `<category id="${xmlEscape(extId)}" name="${xmlEscape(extName)}"`;
  categoryXML += ` colour="${xmlEscape(extObj.themeColor || THEME_COLOR)}"`;
  categoryXML += ` secondaryColour="${xmlEscape(extObj.inputColor || INPUT_COLOR)}"`;
  if (extObj.statusButton) {
    categoryXML += ` showStatusButton="true"`;
  }
  if (extObj.icon) {
    categoryXML += ` iconURI="${xmlEscape(extObj.icon)}"`;
  }
  categoryXML += `>`;

  extObj.menus = extObj.menus || {};

  categoryXML += extObj.blocks
    .filter((block, index) => {
      if (block === '---') {
        return index < extObj.blocks.length - 1;
      }
      return !block.hidden;
    })
    .reduce((blocksXML, block) => {
      if (block === '---') {
        if (!blocksXML.length) return blocksXML;
        return blocksXML + blockSeparator;
      }

      // 按钮
      if (block.button) {
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
        return blocksXML + `<button text="${maybeTranslate(block.text)}" callbackKey="${block.button}"></button>`;
      }

      const blockId = `${extId}_${block.id}`;
      let blockXML = '';

      // 创建新的积木（显示）
      if (block.text) {
        blockXML = `<block type="${xmlEscape(blockId)}">`;

        const blockJson = {
          message0: maybeTranslate(block.text),
          category: extId,
          outputShape: OUTPUT_SHAPE_SQUARE,
          colour: extObj.themeColor || THEME_COLOR,
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

        // 积木外观
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
          // blockJson.checkboxInFlyout = block.monitoring !== false;
        } else {
          blockJson.previousStatement = null;
          blockJson.nextStatement = null;
        }

        // 积木参数项
        if (block.inputs) {
          // blockJson.checkboxInFlyout = false;
          blockJson.args0 = [].concat(
            blockJson.args0 || [],
            Object.entries(block.inputs).map(([name, arg]) => {
              if (arg.type === 'image') {
                return {
                  type: 'field_image',
                  src: arg.src,
                  width: 24,
                  height: 24,
                };
              }

              if (arg.type === 'variable') {
                return {
                  name,
                  type: 'field_variable',
                  variableTypes: arg.variables,
                  variable: arg.defaultValue,
                };
              }

              const argObject = {
                name,
                type: 'input_value',
              };

              if (arg.type === 'boolean') {
                argObject.check = 'Boolean';
              } else if (arg.menu) {
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
                      defaultValue: inputDefault,
                      items: menu,
                    };
                  }
                  blockXML += `<value name="${xmlEscape(name)}">`;
                  blockXML += `<shadow type="${extId}_menu_${menuName}">`;
                  if (inputDefault != null) {
                    blockXML += `<field name="${menuName}">${xmlEscape(maybeTranslate(inputDefault))}</field>`;
                  }
                  blockXML += '</shadow></value>';
                } else if (menu) {
                  argObject.type = 'field_dropdown';
                  argObject.options = menu.map((item) => {
                    if (Array.isArray(item)) {
                      const [text, value] = item;
                      return [maybeTranslate(text), value];
                    }
                    item = `${item}`;
                    return [item, item];
                  });
                  if (arg.defaultValue != null) {
                    blockXML += `<field name="${xmlEscape(name)}">${xmlEscape(maybeTranslate(arg.defaultValue))}</field>`;
                  }
                }
              } else {
                blockXML += `<value name="${xmlEscape(name)}">`;
                const shadowType = arg.shadow ?? ShadowTypes[arg.type];
                if (shadowType) {
                  blockXML += `<shadow ${arg.id ? `id="${arg.id}"` : ''} `;
                  blockXML += `type="${arg.shadow ?? ShadowTypes[arg.type]}">`;
                  const fieldType = FieldTypes[arg.type] ?? name;
                  if (arg.defaultValue != null && fieldType) {
                    blockXML += `<field name="${fieldType}">${xmlEscape(maybeTranslate(arg.defaultValue))}</field>`;
                  }
                  blockXML += '</shadow>';
                }
                blockXML += '</value>';
              }

              blockJson.message0 = blockJson.message0
                ? blockJson.message0.replace(`[${name}]`, `%${argsIndexStart++}`)
                : '';
              return argObject;
            }),
          );
        }

        // 如果积木已存在且没有备份则先进行备份
        if (ScratchBlocks.Blocks[blockId] && !ScratchBlocks.Blocks[`#${blockId}`]) {
          ScratchBlocks.Blocks[`#${blockId}`] = ScratchBlocks.Blocks[blockId];
        }
        // 加入扩展的积木
        ScratchBlocks.Blocks[blockId] = {
          init() {
            this.jsonInit(blockJson);
            block.onInit?.call(this);
          },
          onchange(e) {
            block.onChange?.call(this, e);
          },
        };

        blockXML += '</block>';
      }

      // 扩展积木代码生成器
      if (generator) {
        let codeName = generator.name_.toLowerCase();
        if (block[codeName]) {
          generator[blockId] = block[codeName].bind(generator);
        } else if (!generator[blockId]) {
          generator[blockId] = () => '';
        }
      }
      if (emulator) {
        let codeName = emulator.name_.toLowerCase();
        if (block[codeName]) {
          emulator[blockId] = block[codeName].bind(emulator);
        } else if (!emulator[blockId]) {
          emulator[blockId] = () => '';
        }
      }

      // 运行积木过滤器
      if (onBlockFilter && !onBlockFilter(block)) {
        return blocksXML;
      }
      return blocksXML + blockXML;
    }, '');

  if (extObj.skipXML) {
    return false;
  }

  // 选项菜单输入
  Object.entries(extObj.menus).forEach(([menuName, menu]) => {
    if (!menu.inputMode) return;

    const menuBlockId = `${extId}_menu_${menuName}`;
    const outputType = menu.type === 'number' ? 'output_number' : 'output_string';

    // 动态获取菜单项
    if (typeof menu.getItems === 'function') {
      menu.items = menu.getItems();
    }

    if (!menu.items) {
      menu.items = [''];
    }
    const blockJson = {
      message0: '%1',
      args0: [
        {
          type: 'field_dropdown',
          name: menuName,
          options: menu.items.map((item) => {
            if (Array.isArray(item)) {
              const [text, value] = item;
              return [xmlEscape(maybeTranslate(text)), value];
            }
            item = `${item}`;
            return [item, item];
          }),
        },
      ],
      category: extId,
      colour: extObj.themeColor || THEME_COLOR,
      colourSecondary: extObj.inputColor || INPUT_COLOR,
      colourTertiary: extObj.otherColor || OTHER_COLOR,
      extensions: [outputType],
    };

    // 自动生成菜单积木
    ScratchBlocks.Blocks[menuBlockId] = {
      init() {
        this.jsonInit(blockJson);
      },
    };

    // 自动转换菜单积木代码
    if (generator) {
      generator[menuBlockId] = (block) => {
        let value = block.getFieldValue(menuName) || menu.defaultValue;
        if (['text', 'string'].includes(menu.type)) {
          value = generator.quote_(value);
        } else if (menu.type === 'number') {
          value = Number(value);
        }
        return [value, generator.ORDER_ATOMIC];
      };
    }
    if (emulator) {
      emulator[menuBlockId] = (block) => {
        let value = block.getFieldValue(menuName) || menu.defaultValue;
        if (['text', 'string'].includes(menu.type)) {
          value = generator.quote_(value);
        } else if (menu.type === 'number') {
          value = Number(value);
        }
        return [value, emulator.ORDER_ATOMIC];
      };
    }
  });

  categoryXML += `${categorySeparator}</category>`;
  return categoryXML;
}
