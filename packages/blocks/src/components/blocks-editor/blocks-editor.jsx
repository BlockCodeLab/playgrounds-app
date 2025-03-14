import { useRef, useEffect, useCallback, useMemo } from 'preact/hooks';
import { batch, useSignal } from '@preact/signals';
import { classNames } from '@blockcode/utils';
import {
  useLocalesContext,
  useAppContext,
  useProjectContext,
  setAppState,
  setModified,
  ModifyTypes,
  hideSplash,
  translate,
  setAlert,
  delAlert,
  setFile,
} from '@blockcode/core';

import { ScratchBlocks } from '../../lib/scratch-blocks';
import { makeToolboxXML } from '../../lib/make-toolbox-xml';
import { loadXmlToWorkspace } from '../../lib/load-xml-to-workspace';
import { updateWorkspaceToolbox } from '../../lib/update-workspace-toolbox';
import { preloadProjectBlocks } from '../../lib/preload-project-blocks';
import { importExtension } from '../../lib/import-extension';
import { loadExtension } from '../../lib/load-extension';
import { unifyLocale } from '../../lib/unify-locale';
import blocksConfig from './blocks-config';

import { Text, ContextMenu } from '@blockcode/core';
import { DataMonitor } from '../data-monitor/data-monitor';
import { DataPromptModal } from '../data-prompt-modal/data-prompt-modal';
import { MyBlockPromptModal } from '../myblock-prompt-modal/myblock-prompt-modal';
import { ExtensionsLibrary } from '../extensions-library/extensions-library';
import styles from './blocks-editor.module.css';

import extensionIcon from './icon-extension.svg';

// 支持更新的事件
const supportedEvents = new Set([
  ScratchBlocks.Events.BLOCK_CHANGE,
  ScratchBlocks.Events.BLOCK_CREATE,
  ScratchBlocks.Events.BLOCK_DELETE,
  ScratchBlocks.Events.BLOCK_MOVE,
  ScratchBlocks.Events.COMMENT_CHANGE,
  ScratchBlocks.Events.COMMENT_CREATE,
  ScratchBlocks.Events.COMMENT_DELETE,
  ScratchBlocks.Events.COMMENT_MOVE,
  ScratchBlocks.Events.VAR_CREATE,
  ScratchBlocks.Events.VAR_DELETE,
  ScratchBlocks.Events.VAR_RENAME,
]);

// 已经载入的扩展
export const loadedExtensions = new Map();

// 包装XML
const wrapToolboxXml = (xml) => `<xml style="display:none">\n${xml}\n</xml>`;

// 更新积木栏XML
const updateToolboxXml = (buildinExtensions, options) =>
  Array.from(loadedExtensions.values()).reduce(
    // 将外部扩展的xml合并到主xml中
    (xml, extObj) => xml + loadExtension(extObj, options),
    // 将默认扩展的xml合并到主xml中
    makeToolboxXML(
      buildinExtensions?.map((extObj) => ({
        id: extObj.id,
        order: extObj.order,
        xml: loadExtension(extObj, options),
      })),
      options,
    ),
  );

// 更新多语言文本
const updateScratchBlocksMsgs = (enableMultiTargets, enableVariableTypes) => {
  Object.entries(
    Object.assign(
      {
        OPERATORS_MULTIPLY: '%1 × %2',
        OPERATORS_DIVIDE: '%1 ÷ %2',
        OPERATORS_GTE: '%1 ≥ %2',
        OPERATORS_LTE: '%1 ≤ %2',
        OPERATORS_NOTEQUALS: '%1 ≠ %2',
        OPERATORS_AND: translate('blocks.operators.and', '%1 and %2'),
        UNSUPPORTED: translate('blocks.unsupported', 'unsupported block'),
        EVENT_WHENPROGRAMSTART: translate('blocks.events.programStart', 'when program start'),
        PROCEDURES_ADD_LABEL: translate('blocks.myblock.addLabel', ' label text'),
        PROCEDURES_ADD_BOOLEAN: translate('blocks.myblock.addBoolean', 'boolean'),
        PROCEDURES_ADD_STRING_NUMBER: translate('blocks.myblock.addNumbetText', 'number or text'),
        CATEGORY_MONITOR: translate('blocks.monitor', 'Monitor'),
        MONITOR_SHOWVALUE: translate('blocks.monitor.showValue', 'show value %1'),
        MONITOR_SHOWNAMEDVALUE: translate('blocks.monitor.showNamedValue', 'show value %1 named %2'),
      },
      enableMultiTargets
        ? {
            CONTROL_STOP_OTHER: translate('blocks.control.stopOtherInTarget', 'other scripts in sprite'),
          }
        : {
            CONTROL_STOP_OTHER: translate('blocks.control.stopOther', 'other scripts'),
          },
      enableVariableTypes
        ? {
            NEW_LIST: translate('blocks.dataPrompt.makeArray', 'Make a Array'),
            LIST_ALREADY_EXISTS: translate('blocks.dataPrompt.arrayExists', 'A array named "%1" already exists.'),
            LIST_MODAL_TITLE: translate('blocks.dataPrompt.newArray', 'New Array'),
            NEW_LIST_TITLE: translate('blocks.dataPrompt.arrayTitle', 'New array name:'),
          }
        : {
            NEW_LIST: translate('blocks.dataPrompt.makeList', 'Make a List'),
            LIST_ALREADY_EXISTS: translate('blocks.dataPrompt.listExists', 'A list named "%1" already exists.'),
            LIST_MODAL_TITLE: translate('blocks.dataPrompt.newList', 'New List'),
            NEW_LIST_TITLE: translate('blocks.dataPrompt.listTitle', 'New list name:'),
          },
    ),
  ).forEach(([key, value]) => (ScratchBlocks.Msg[key] = value));
};

export function BlocksEditor({
  emulator,
  generator,
  enableCloneBlocks,
  enableStringBlocks,
  enableMyBlockWarp,
  enableMultiTargets,
  enableLocalVariable,
  enableCloudVariables,
  enableMonitor,
  disableSensingBlocks,
  disableExtensionButton,
  monitorOffset,
  variableTypes,
  onBuildinExtensions,
  onExtensionsFilter,
  onExtensionBlockFilter,
  onExtensionLoad,
  onDefinitions,
  onLoading,
}) {
  const { language } = useLocalesContext();

  const { appState, splashVisible, tabIndex } = useAppContext();

  const { meta, files, fileId, fileIndex, file, modified } = useProjectContext();

  const ref = useRef(null);

  const dataPrompt = useSignal(null);

  const myBlockPrompt = useSignal(null);

  const extensionsLibraryVisible = useSignal(false);

  const extensionStatusMenu = useSignal(null);

  const options = useMemo(
    () => ({
      generator,
      emulator,
      enableCloneBlocks,
      enableStringBlocks,
      enableMonitor,
      disableSensingBlocks,
      onBlockFilter: onExtensionBlockFilter,
    }),
    [
      generator,
      emulator,
      enableCloneBlocks,
      enableStringBlocks,
      enableMonitor,
      disableSensingBlocks,
      onExtensionBlockFilter,
    ],
  );

  // 变量设置确认
  //
  const handleDataPromptSubmit = useCallback((input, options) => {
    dataPrompt.value.callback(input, [], options);
    dataPrompt.value = null;
  }, []);

  // 自制积木设置确认
  //
  const handleMyBlockPromptSubmit = useCallback((myBlockXml) => {
    if (myBlockXml && ref.workspace) {
      myBlockPrompt.value.defCallback(myBlockXml);
      ref.workspace.refreshToolboxSelection_();
      ref.workspace.toolbox_.scrollToCategoryById('myBlocks');
    }
    myBlockPrompt.value = null;
  }, []);

  // 关闭设置对话框
  const handleClosePrompt = useCallback(() => {
    dataPrompt.value = null;
    myBlockPrompt.value = null;
  }, []);

  // 更新工作区积木
  //
  const updateWorkspace = useCallback(() => {
    const buildinExtensions = onBuildinExtensions?.();
    const xml = updateToolboxXml(buildinExtensions, options);
    if (ref.workspace?.toolbox_) {
      updateWorkspaceToolbox(ref.workspace, wrapToolboxXml(xml));
    }
    return xml;
  }, [options, onBuildinExtensions]);

  // 切换积木语言
  //
  useEffect(() => {
    const locale = unifyLocale(language.value);
    if (ScratchBlocks.ScratchMsgs.currentLocale_ !== locale) {
      ScratchBlocks.ScratchMsgs.setLocale(locale);
    }
    // 更新积木文本
    updateScratchBlocksMsgs(enableMultiTargets, !!variableTypes);
    updateWorkspace();
  }, [enableMultiTargets, variableTypes, updateWorkspace, language.value]);

  // 添加扩展XML
  //
  const handleSelectExtension = useCallback(
    async (extId) => {
      if (loadedExtensions.has(extId)) return;
      setAlert('importing', { id: extId });

      // 载入扩展
      const extObj = await importExtension(extId);
      loadedExtensions.set(extObj.id, extObj);
      if (onExtensionLoad) {
        onExtensionLoad(extObj);
      }

      // 选中扩展的积木栏
      if (ref.workspace) {
        setTimeout(() => {
          ref.workspace.toolbox_.setSelectedCategoryById(extId);
        }, 50); // 等待积木栏更新完毕后再滚动
      }

      delAlert(extId);
    },
    [generator, emulator, onExtensionLoad],
  );

  // 生成代码
  //
  const generateCodes = useCallback(
    (index) => {
      // 查询使用的扩展
      const extensions = Array.from(
        new Set(
          Object.values(ref.workspace.blockDB_)
            .filter((block) => loadedExtensions.has(block.category_))
            .map((block) => block.category_),
        ),
      );

      // 查询扩展附带的资源
      const resources = {};
      for (const extObj of loadedExtensions.values()) {
        if (extensions.includes(extObj.id) && extObj.files) {
          resources[extObj.id] = extObj.files.map((res) => ({
            name: res.name,
            type: res.type,
          }));
        }
      }

      let script;
      if (emulator) {
        if (onDefinitions) {
          emulator.onDefinitions = () => {
            onDefinitions(emulator.name_, (key, val) => (emulator.definitions_[key] = val), resources, index);
          };
        }
        script = emulator.workspaceToCode(ref.workspace);
      }

      let content;
      if (generator) {
        if (onDefinitions) {
          generator.onDefinitions = () => {
            onDefinitions(generator.name_, (key, val) => (generator.definitions_[key] = val), resources, index);
          };
        }
        content = generator.workspaceToCode(ref.workspace);
      }

      return {
        script,
        content,
        extensions,
      };
    },
    [emulator, generator, onDefinitions],
  );

  // 工作区发生变化时产生新的代码
  //
  const handleChange = useCallback(() => {
    if (!file.value) return;

    const xmlDom = ScratchBlocks.Xml.workspaceToDom(ref.workspace);
    const xml = ScratchBlocks.Xml.domToText(xmlDom);

    // 积木发生变化
    if (xml !== file.value.xml) {
      const codes = generateCodes(fileIndex.value);
      setFile({ xml, xmlDom, ...codes });
    }
  }, [generateCodes]);

  // 切换文件时更新工具栏，加载积木
  //
  useEffect(() => {
    if (splashVisible.value) return;

    if (ref.workspace) {
      // 共享全局变量
      const globalVariables = ref.workspace.getAllVariables().filter((variable) => {
        if (variable.isLocal) return false;

        if (variable.type === ScratchBlocks.BROADCAST_MESSAGE_VARIABLE_TYPE) {
          if (variable.name === ScratchBlocks.Msg.DEFAULT_BROADCAST_MESSAGE_NAME) return false;

          // 过滤未使用的广播变量
          const varId = variable.id_.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const re = new RegExp(`<field name="BROADCAST_OPTION" id="${varId}"[^>]+>[^<]+</field>`, 'g');
          for (const res of files.value) {
            if (re.test(res.xml)) return true;
          }
          return false;
        }
        return true;
      });

      // 加载积木到工作区
      loadXmlToWorkspace(file.value.xmlDom ?? file.value.xml, globalVariables, ref.workspace);

      // 检查如果有积木没有代码则立即生成
      if (file.value.xml && (!file.value.content || !file.value.script)) {
        const codes = generateCodes(fileIndex.value);
        setFile(codes);
      }

      // 更新积木栏
      const buildinExtensions = onBuildinExtensions?.();
      const xml = updateToolboxXml(buildinExtensions, options);
      updateWorkspaceToolbox(ref.workspace, wrapToolboxXml(xml));

      // 清除撤销记录
      setTimeout(() => ref.workspace.clearUndo(), 50);
    }
  }, [fileId.value, generateCodes, options, onBuildinExtensions]);

  // 从外部更新后重新生成代码
  //
  useEffect(() => {
    if (splashVisible.value) return;
    if (appState.value?.running) return;

    const codes = generateCodes(fileIndex.value);
    if (file.value.content !== codes.content || file.value.script !== codes.script) {
      setFile(codes);
    }
  }, [modified.value, generateCodes]);

  // 增减文件、增加扩展后
  //
  useEffect(() => {
    if (splashVisible.value) return;
    if (appState.value?.running) return;
    updateWorkspace();
  }, [files.value.length, loadedExtensions.size, updateWorkspace]);

  // 在其他标签修改后，更新造型等列表
  //
  useEffect(() => {
    if (splashVisible.value) return;
    if (appState.value?.running) return;
    if (tabIndex.value === 0) return;
    updateWorkspace();
  }, [modified.value, updateWorkspace]);

  // 首次载入项目
  //
  useEffect(async () => {
    if (splashVisible.value) {
      const projData = await preloadProjectBlocks(meta.value, files.value);

      for (const [extId, extObj] of projData.extensions) {
        loadExtension(extObj, options);
        loadedExtensions.set(extId, extObj);
      }

      batch(() => {
        let id, data, codes;
        for (let i = 0; i < files.value.length; i++) {
          id = files.value[i].id;
          data = projData.xmls.get(id);

          // 加载积木到工作区并转换积木到代码
          loadXmlToWorkspace(data.xmlDom, null, ref.workspace);
          codes = generateCodes(i);

          setFile({
            id,
            ...data,
            ...codes,
          });
        }

        // 加载当前选中的文档
        data = projData.xmls.get(fileId.value);
        loadXmlToWorkspace(data.xmlDom, null, ref.workspace);

        setModified(ModifyTypes.Saved);
        updateWorkspace();
      });

      if (onLoading) {
        await onLoading();
      }

      hideSplash();

      // 清空撤销记录
      ref.workspace.clearUndo();
    }
  }, [splashVisible.value, generateCodes, options, updateWorkspace]);

  // 创建工作区
  //
  useEffect(() => {
    if (ref.current) {
      // 切换积木语言
      const locale = unifyLocale(language.value);
      if (ScratchBlocks.ScratchMsgs.currentLocale_ !== locale) {
        ScratchBlocks.ScratchMsgs.setLocale(locale);
      }
      // 更新积木文本
      updateScratchBlocksMsgs(enableMultiTargets, !!variableTypes);
      // 生成积木栏
      const toolboxXml = updateWorkspace();
      // 创建工作区
      ref.workspace = ScratchBlocks.inject(
        ref.current,
        Object.assign(blocksConfig, {
          toolbox: wrapToolboxXml(toolboxXml),
          media: './assets/blocks-media/',
        }),
      );

      // 绑定工作区事件
      ref.workspace.addChangeListener((e) => {
        if (splashVisible.value) return;

        // 复制拖拽的积木块
        if (ref.workspace.isDragging()) {
          if (e.type === ScratchBlocks.Events.DRAG_OUTSIDE) {
            const block = ref.workspace.getBlockById(e.blockId);
            const xmlDom = ScratchBlocks.Xml.blockToDom(block, ref.workspace);
            setAppState({
              copiedBlock: {
                block,
                xmlDom,
              },
            });
          }

          // 如果是复制，则标记为要删除
          if (e.type === ScratchBlocks.Events.BLOCK_CREATE) {
            setAppState({
              removeCopiedBlock: !e.group,
            });
          }
          return;
        }

        // 放下积木块时清空复制
        if (e.type === ScratchBlocks.Events.END_DRAG) {
          batch(() => {
            if (appState.value?.removeCopiedBlock && appState.value?.copiedBlock) {
              const copiedBlock = appState.value?.copiedBlock;
              copiedBlock.block.dispose(false, false);

              // 生产复制积木的代码
              if (copiedBlock.toFileId != null) {
                const codes = generateCodes(copiedBlock.toFileIndex);
                setFile({
                  id: copiedBlock.toFileId,
                  ...codes,
                });
              }
            }
            setAppState({ copiedBlock: null, removeCopiedBlock: null });
          });
          return;
        }

        // 更新 xml 和转换代码
        if (!supportedEvents.has(e.type)) return;
        handleChange();
      });

      // 缩放工作区
      ref.resizeObserver = new ResizeObserver(() => ref.workspace && ScratchBlocks.svgResize(ref.workspace));
      ref.resizeObserver.observe(ref.current);

      // 清空撤销记录
      ref.workspace.clearUndo();

      // 创建变量
      ScratchBlocks.prompt = (message, defaultValue, callback, optTitle, optVarType) => {
        const prompt = { callback, message, defaultValue };
        prompt.title = optTitle ? optTitle : ScratchBlocks.Msg.VARIABLE_MODAL_TITLE;
        prompt.varType = typeof optVarType === 'string' ? optVarType : ScratchBlocks.SCALAR_VARIABLE_TYPE;
        prompt.showVariableOptions = // This flag means that we should show variable/list options about scope
          enableMultiTargets &&
          optVarType !== ScratchBlocks.BROADCAST_MESSAGE_VARIABLE_TYPE &&
          prompt.title !== ScratchBlocks.Msg.RENAME_VARIABLE_MODAL_TITLE &&
          prompt.title !== ScratchBlocks.Msg.RENAME_LIST_MODAL_TITLE;
        prompt.showCloudOption = optVarType === ScratchBlocks.SCALAR_VARIABLE_TYPE && enableCloudVariables;
        dataPrompt.value = prompt;
      };

      // 自制积木
      ScratchBlocks.Procedures.externalProcedureDefCallback = (mutator, defCallback) => {
        myBlockPrompt.value = { mutator, defCallback };
      };

      // 扩展状态按钮显示
      ScratchBlocks.FlyoutExtensionCategoryHeader.getExtensionState = (extId) => {
        if (!loadedExtensions.has(extId)) return;

        const extObj = loadedExtensions.get(extId);
        const statusButton = extObj.statusButton;
        if (!statusButton) {
          return ScratchBlocks.StatusButtonState.NOT_READY;
        }

        // 硬件连接状态更新
        const connectionOptions = statusButton.connectionOptions;

        if (connectionOptions ? appState.value?.[`device.${extId}`] : statusButton.onUpdate?.()) {
          return ScratchBlocks.StatusButtonState.READY;
        }
        return ScratchBlocks.StatusButtonState.NOT_READY;
      };

      // 刷新状态按钮
      const refreshStatus = () => ScratchBlocks.refreshStatusButtons(ref.workspace);

      // 设备断开连接
      const disconnect = (extObj, reconnect) => () => {
        const alertId = setAlert('connectionError', {
          icon: extObj.icon,
          button: {
            label: (
              <Text
                id="gui.prompt.reconnect"
                defaultMessage="Reconnect"
              />
            ),
            onClick() {
              delAlert(alertId);
              reconnect();
            },
          },
          onClose: () => delAlert(alertId),
        });
        setAppState(`device.${extObj.id}`, false);
        refreshStatus();
      };

      // 连接蓝牙设备
      const connectBluetooth = async (extObj, options) => {
        const deviceName = `device.${extObj.id}`;
        let device = appState.value?.[deviceName];
        if (device?.disconnect) {
          await device?.disconnect();
        }
        if (device?.close) {
          await device.close();
        }

        device = await navigator.bluetooth.requestDevice(options);
        // 断开连接
        device.addEventListener(
          'gattserverdisconnected',
          disconnect(extObj, () => connectBluetooth(extObj, options)),
          { once: true },
        );
        // 连接
        const gattServer = await device.gatt.connect();
        setAppState(deviceName, gattServer);
        refreshStatus();
      };

      // 连接串口设备
      const connectSerial = async (extObj, options) => {
        const deviceName = `device.${extObj.id}`;
        let device = appState.value?.[deviceName];
        if (device?.disconnect) {
          await device?.disconnect();
        }
        if (device?.close) {
          await device.close();
        }

        device = await navigator.serial.requestPort(options);
        // 断开连接
        device.addEventListener(
          'disconnect',
          disconnect(extObj, () => connectSerial(extObj, options)),
          { once: true },
        ),
          // 连接
          setAppState(deviceName, device);
        refreshStatus();
      };

      // 状态按钮事件
      ScratchBlocks.statusButtonCallback = async (extId, categoryHeader) => {
        if (!loadedExtensions.has(extId)) return;

        const extObj = loadedExtensions.get(extId);
        const statusButton = extObj.statusButton;
        if (!statusButton) return;

        const connectionOptions = statusButton.connectionOptions;

        // 自定义点击事件
        if (!connectionOptions) {
          await statusButton.onClick?.();
          refreshStatus();
          return;
        }

        // 连接菜单
        if (connectionOptions.bluetooth && connectionOptions.serial) {
          const clientRect = categoryHeader.imageElement_.getBoundingClientRect();
          extensionStatusMenu.value = {
            position: {
              x: clientRect.x + clientRect.width / 2,
              y: clientRect.y + clientRect.height / 2,
            },
            menuItems: [
              {
                label: (
                  <Text
                    id="blocks.extensionStatusMenu.bluetooth"
                    defaultMessage="Bluetooth (BLE)"
                  />
                ),
                onClick: () => {
                  extensionStatusMenu.value = null;
                  connectBluetooth(extObj, connectionOptions.bluetooth);
                },
              },
              {
                label: (
                  <Text
                    id="blocks.extensionStatusMenu.serial"
                    defaultMessage="Serial Port"
                  />
                ),
                onClick: () => {
                  extensionStatusMenu.value = null;
                  connectSerial(extObj, connectionOptions.serial);
                },
              },
            ],
          };
          return;
        }

        // 蓝牙BLE连接
        if (connectionOptions.bluetooth) {
          connectBluetooth(extObj, connectionOptions.bluetooth);
          return;
        }

        // 串口连接
        if (connectionOptions.serial) {
          connectSerial(extObj, connectionOptions.serial);
          return;
        }
      };
    }
    return () => {
      loadedExtensions.clear();
      ScratchBlocks.restoreBlocks();
      if (ref.workspace) {
        ref.workspace.clearUndo();
        ref.workspace.dispose();
        ref.workspace = null;
      }
    };
  }, [ref]);

  // 变量/列表类型
  useEffect(() => {
    if (variableTypes) {
      ScratchBlocks.setDataCategoryForTyped(variableTypes);
    }
  }, [variableTypes]);

  return (
    <div className={styles.blocksEditorWrapper}>
      <div
        ref={ref}
        className={styles.blocksEditor}
      />

      <DataMonitor offset={monitorOffset} />

      <ContextMenu
        menuItems={extensionStatusMenu.value?.menuItems}
        position={extensionStatusMenu.value?.position}
      />

      {!disableExtensionButton && (
        <div className={classNames('scratchCategoryMenu', styles.extensionButton)}>
          <button
            className={styles.addButton}
            title={
              <Text
                id="blocks.extensions.addExtension"
                defaultMessage="Add Extension"
              />
            }
            onClick={useCallback(() => (extensionsLibraryVisible.value = true), [])}
          >
            <img
              src={extensionIcon}
              title="Add Extension"
            />
          </button>
        </div>
      )}

      {dataPrompt.value && (
        <DataPromptModal
          title={dataPrompt.value.title}
          label={dataPrompt.value.message}
          defaultValue={dataPrompt.value.defaultValue}
          enableLocalVariable={enableLocalVariable}
          showListMessage={dataPrompt.value.varType === ScratchBlocks.LIST_VARIABLE_TYPE}
          showVariableOptions={dataPrompt.value.showVariableOptions}
          showCloudOption={dataPrompt.value.showCloudOption}
          onSubmit={handleDataPromptSubmit}
          onClose={handleClosePrompt}
        />
      )}

      {myBlockPrompt.value && (
        <MyBlockPromptModal
          mutator={myBlockPrompt.value.mutator}
          enableWarp={enableMyBlockWarp}
          onSubmit={handleMyBlockPromptSubmit}
          onClose={handleClosePrompt}
        />
      )}

      {extensionsLibraryVisible.value && (
        <ExtensionsLibrary
          onFilter={onExtensionsFilter}
          onSelect={handleSelectExtension}
          onClose={useCallback(() => (extensionsLibraryVisible.value = false), [])}
        />
      )}
    </div>
  );
}
