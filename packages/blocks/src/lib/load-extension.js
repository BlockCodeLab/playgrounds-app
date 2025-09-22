import { xmlEscape, Konva } from '@blockcode/utils';
import { themeColors, maybeTranslate } from '@blockcode/core';
import { Runtime } from './runtime/runtime';
import { ScratchBlocks } from '../lib/scratch-blocks';
import { blockSeparator, categorySeparator } from '../lib/make-toolbox-xml';

const THEME_COLOR = themeColors.blocks.primary;
const INPUT_COLOR = themeColors.blocks.secondary;
const OTHER_COLOR = themeColors.blocks.tertiary;

const ShadowTypes = {
  broadcast: 'event_broadcast_menu',
  number: 'math_number',
  integer: 'math_integer',
  angle: 'math_angle',
  text: 'text',
  string: 'text',
  color: 'colour_picker',
  matrix: 'matrix',
  note: 'note',
};

const FieldNames = {
  broadcast: 'BROADCAST_INPUT',
  number: 'NUM',
  integer: 'NUM',
  angle: 'NUM',
  text: 'TEXT',
  string: 'TEXT',
  matrix: 'MATRIX',
  note: 'NOTE',
};

export function loadExtension(extObj, options, meta) {
  const extId = extObj.id;
  const extName = maybeTranslate(extObj.name);
  const { generator, emulator } = options;

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
      Runtime.currentRuntime._extensions.set(extEmu.key, extEmu);
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

  const blocks = typeof extObj.blocks === 'function' ? extObj.blocks(meta) : extObj.blocks;

  categoryXML += blocks
    .filter((block, index) => {
      // 不显示排在最后的空白分割线
      if (block === '---') {
        return index < blocks.length - 1;
      }
      // block.hidden 不用于过滤，只用于是否需要显示在积木栏
      return true;
    })
    .reduce((blocksXML, block) => {
      // 空白分割线
      if (block === '---') {
        if (!blocksXML.length) return blocksXML;
        return blocksXML + blockSeparator;
      }

      if (!block.hidden) {
        // 文本标签
        if (block.label) {
          return blocksXML + `<label text="${block.label}"/>`;
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
          return blocksXML + `<button text="${maybeTranslate(block.text)}" callbackKey="${block.button}"/>`;
        }
      }

      // 构建积木
      // xml用于在工具栏显示
      // json用于代码转换，有可能不显示的积木也存在代码转换
      const blockId = `${extId}_${block.id}`;
      let blockXML = '';

      // 显示特殊定义的积木
      if (block.custom) {
        blockXML = `<block type="${xmlEscape(blockId)}">`;
        if (typeof custom === 'string') {
          blockXML += custom;
        }
        blockXML += '</block>';
      }

      // 创建新的积木（内部连接或可显示）
      else if (block.inline || block.text) {
        blockXML = `<block type="${xmlEscape(blockId)}">`;

        const blockJson = {
          message0: block.text ? maybeTranslate(block.text) : '%1',
          category: extId,
          outputShape: ScratchBlocks.OUTPUT_SHAPE_SQUARE,
          colour: extObj.themeColor || THEME_COLOR,
          colourSecondary: extObj.inputColor || INPUT_COLOR,
          colourTertiary: extObj.otherColor || OTHER_COLOR,
        };

        let argsIndexStart = 1;
        if (!block.inline && extObj.icon) {
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
        //
        if (block.hat) {
          blockJson.nextStatement = null;
        } else if (block.end) {
          blockJson.previousStatement = null;
        } else if (block.output) {
          if (block.output === 'boolean') {
            blockJson.output = 'Boolean';
            blockJson.outputShape = ScratchBlocks.OUTPUT_SHAPE_HEXAGONAL;
          } else {
            blockJson.output = block.output === 'number' ? 'Number' : 'String';
            blockJson.outputShape = ScratchBlocks.OUTPUT_SHAPE_ROUND;
          }
          blockJson.checkboxInFlyout = block.monitoring === true;
        } else {
          blockJson.previousStatement = null;
          blockJson.nextStatement = null;
        }
        if (block.substack) {
          blockJson.message1 = '%1';
          blockJson.args1 = [
            {
              type: 'input_statement',
              name: 'SUBSTACK',
            },
          ];
        } else if (block.repeat) {
          blockJson.message1 = '%1'; // Statement
          blockJson.message2 = '%1'; // Icon
          blockJson.lastDummyAlign2 = 'RIGHT';
          blockJson.args1 = [
            {
              type: 'input_statement',
              name: 'SUBSTACK',
            },
          ];
          blockJson.args2 = [
            {
              type: 'field_image',
              src: './assets/blocks-media/repeat.svg',
              width: 24,
              height: 24,
              alt: '*',
              flip_rtl: true,
            },
          ];
        }

        // 积木参数项
        if (block.inputs) {
          blockJson.checkboxInFlyout = false;
          blockJson.args0 = [].concat(
            blockJson.args0 || [],
            Object.entries(block.inputs).map(([name, arg]) => {
              const argObject = { name };
              switch (arg.type) {
                case 'image':
                  argObject.type = 'field_image';
                  argObject.src = arg.src;
                  argObject.width = 24;
                  argObject.height = 24;
                  break;

                case 'variable':
                  argObject.type = 'field_variable';
                  argObject.variableTypes = arg.variables;
                  argObject.variable = arg.defaultValue;
                  break;

                case 'slider':
                  argObject.type = 'field_slider';
                  argObject.value = arg.defaultValue ?? 0;
                  argObject.min = arg.min ?? 0;
                  argObject.max = arg.max ?? 100;
                  argObject.precision = arg.step ?? 1;
                  blockJson.colour = ScratchBlocks.Colours.textField;
                  blockJson.colourSecondary = ScratchBlocks.Colours.textField;
                  blockJson.colourTertiary = ScratchBlocks.Colours.textField;
                  blockJson.colourQuaternary = ScratchBlocks.Colours.textField;
                  break;

                case 'matrix':
                  argObject.type = 'field_matrix';
                  argObject.width = arg.width ?? 5;
                  argObject.height = arg.height ?? 5;
                  break;

                default:
                  argObject.type = 'input_value';

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
                        blockXML += `<field name="${xmlEscape(name)}">${xmlEscape(
                          maybeTranslate(arg.defaultValue),
                        )}</field>`;
                      }
                    }
                  } else {
                    blockXML += `<value name="${xmlEscape(name)}">`;
                    const shadowType = arg.shadowType ?? ShadowTypes[arg.type] ?? `${extId}_${arg.shadow}`;
                    if (shadowType) {
                      blockXML += `<shadow ${arg.id ? `id="${arg.id}" ` : ''}type="${shadowType}">`;
                      const fieldName = arg.fieldName ?? FieldNames[arg.type] ?? xmlEscape(name);
                      if (arg.defaultValue != null && fieldName) {
                        blockXML += `<field name="${fieldName}">${xmlEscape(maybeTranslate(arg.defaultValue))}</field>`;
                      }
                      blockXML += '</shadow>';
                    }
                    blockXML += '</value>';
                  }
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
        if (block.inline) {
          blockXML = '';
        }
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

      // 将需要显示的积木添加到工具栏
      if (!block.hidden) {
        blocksXML += blockXML;
      }
      return blocksXML;
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
        if (menu.type === 'integer') {
          value = parseInt(value);
        } else if (menu.type === 'number') {
          value = Number(value);
        } else {
          value = generator.quote_(value);
        }
        return [value, generator.ORDER_ATOMIC];
      };
    }
    if (emulator) {
      emulator[menuBlockId] = (block) => {
        let value = block.getFieldValue(menuName) || menu.defaultValue;
        if (menu.type === 'integer') {
          value = parseInt(value);
        } else if (menu.type === 'number') {
          value = Number(value);
        } else {
          value = generator.quote_(value);
        }
        return [value, emulator.ORDER_ATOMIC];
      };
    }
  });

  categoryXML += `${categorySeparator}</category>`;
  return categoryXML;
}
