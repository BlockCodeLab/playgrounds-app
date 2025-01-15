import { useCallback, useEffect, useErrorBoundary } from 'preact/hooks';
import { batch, useComputed, useSignal, useSignalEffect } from '@preact/signals';
import { classNames } from '@blockcode/utils';
import {
  useAppContext,
  useLocalesContext,
  useProjectContext,
  translate,
  showSplash,
  openPromptModal,
  closePromptModal,
  openLayout,
  closeLayout,
  openTab,
  openProject,
  closeProject,
} from '@blockcode/core';
import { mergeMenus } from '../menu-bar/merge-menus';

import { Text } from '@blockcode/core';
import { Alerts } from '../alerts/alerts';
import { ConnectionModal } from '../connection-modal/connection-modal';
import { Home } from '../home/home';
import { MenuBar } from '../menu-bar/menu-bar';
import { PaneBox } from '../panes-view/pane-box';
import { PromptModal } from '../prompt-modal/prompt-modal';
import { InputsPromptModal } from '../prompt-modal/inputs-prompt-modal';
import { Splash } from '../splash/splash';
import { Tabs, TabLabel, TabPanel } from '../tabs/tabs';
import { TutorialBox } from '../tutorial-box/tutorial-box';
import { TutorialLibrary } from '../tutorial-library/tutorial-library';
import { UserStorage } from '../user-storage/user-storage';
import styles from './layout.module.css';

import getEditors from '../../lib/get-editors';

// 关闭项目和布局
const closeProjectAndLayout = () =>
  batch(() => {
    closeProject();
    closeLayout();
  });

// 打开项目
const openProjectWithSplash = (data, translator) => {
  batch(() => {
    showSplash();
    openProject(
      Object.assign(JSON.parse(JSON.stringify(data)), {
        fileId: data.fileId ?? data.files?.[0]?.id,
      }),
      translator,
    );
    openTab(0);
  });
};

export function Layout() {
  // 捕获内部错误
  //
  const [error] = useErrorBoundary();

  // 多语言翻译
  //
  const { language, translator } = useLocalesContext();

  // 应用布局
  //
  const app = useAppContext();

  // 设置应用标题
  useEffect(() => {
    document.title = translate('gui.name', 'BlockCode Playgrounds', translator);
    if (BETA) {
      document.title += ' [BETA]';
    }
  }, [language.value]);

  // 侧边栏
  let LeftDockContent, RightDockContent;
  app.docks.value?.forEach((dock) => {
    if (dock.expand === 'left') {
      LeftDockContent = dock.Content;
    } else {
      RightDockContent = dock.Content;
    }
  });

  // 底边栏
  // TODO: 多标签页底边栏
  const PaneContent = app.panes.value?.[0]?.Content;

  // 根据侧边栏和底边栏调整标签页样式
  const tabPanelClass = classNames({
    [styles.tabPanelNoLeft]: !LeftDockContent,
    [styles.tabPanelNoRight]: !RightDockContent,
    [styles.tabPanelNoBottom]: !PaneContent,
  });

  // Electron 串口扫描
  //
  const foundDevices = useSignal(null);
  useEffect(() => {
    window.electron?.serial.onScan((devices) => {
      foundDevices.value = devices;
    });
  }, []);

  const handleConnectionSearch = () => {};

  const handleConnectionClose = useCallback(() => {
    window.electron?.serial.cancel();
    foundDevices.value = null;
  }, []);

  const handleConnectionConnect = useCallback((portId) => {
    window.electron?.serial.connect(portId);
  }, []);

  // 获取所有编辑器的名称
  //
  const editorsInfos = useSignal({});
  useSignalEffect(async () => {
    let result = await getEditors();
    result = result.map((editor) => [
      editor.id,
      {
        name: editor.name,
        version: editor.version,
      },
    ]);
    editorsInfos.value = Object.fromEntries(result);
  });

  // 教程显示
  //
  const tutorialLibraryVisible = useSignal(false);
  const tutorialId = useSignal(null);

  const handleOpenTutorialLibrary = useCallback(() => {
    batch(() => {
      tutorialId.value = null;
      tutorialLibraryVisible.value = true;
    });
  }, []);

  const handleOpenTutorial = useCallback((id) => {
    batch(() => {
      tutorialId.value = id;
      tutorialLibraryVisible.value = false;
    });
  }, []);

  // 项目管理
  //
  const { meta, key, modified } = useProjectContext();

  // 首页显示
  // 当前项目没有元数据显示
  const homeVisible = useComputed(() => !meta.value);

  // 返回首页
  const handleBackHome = useCallback(() => {
    // 检查项目是否保存
    if (modified.value) {
      openPromptModal({
        title: (
          <Text
            id="gui.library.projects.notSaved"
            defaultMessage="Not saved"
          />
        ),
        label: (
          <Text
            id="gui.library.projects.close"
            defaultMessage="Close current project?"
          />
        ),
        onSubmit: closeProjectAndLayout,
      });
    } else {
      closeProjectAndLayout();
    }
  }, []);

  // 打开新的项目并检查编辑器
  const openProjectViaEditor = useCallback((projData, editorId) => {
    if (editorId !== projData.meta.editor) {
      openPromptModal({
        label: (
          <Text
            id="gui.library.projects.errorEditor"
            defaultMessage='This project is not currently editor creation, please switch to "{workspace}" and open it.'
            workspace={editorsInfos.value[projData.meta.editor]?.name}
          />
        ),
      });
      return;
    }

    // 避免重复打开同一文件
    if (key.value === projData.key) return;

    // 检查项目是否保存
    if (modified.value) {
      openPromptModal({
        title: (
          <Text
            id="gui.library.projects.notSaved"
            defaultMessage="Not saved"
          />
        ),
        label: (
          <Text
            id="gui.library.projects.replace"
            defaultMessage="Replace contents of the current project?"
          />
        ),
        onSubmit: () => openProjectWithSplash(projData, translator),
      });
    } else {
      openProjectWithSplash(projData, translator);
    }
  }, []);

  // 打开编辑器事件
  const handleOpenEditor = useCallback(async (editorId, projData) => {
    batch(() => {
      closeProjectAndLayout();
      showSplash();
    });

    const { default: editor } = await import(`@blockcode/gui-${editorId}`);
    const meta = {
      editor: editorId,
      version: editorsInfos.value[editorId]?.version,
    };

    if (!projData) {
      projData = JSON.parse(JSON.stringify(await editor.onNew()));
    }

    if (!projData.meta) {
      projData.meta = meta;
    }
    if (!projData.meta.editor) {
      projData.meta.editor = editorId;
      projData.meta.version = meta.version;
    }

    const layout = {
      menuItems: mergeMenus(editor, meta, openProjectViaEditor),
      tabs: editor.tabs,
      docks: editor.docks,
      panes: editor.panes,
      tutorials: editor.tutorials,
    };

    batch(() => {
      openLayout(layout);
      openProjectViaEditor(projData, editorId);
    });
  }, []);

  // 打开项目事件
  const handleOpenProject = useCallback((projData) => {
    if (meta.value?.editor !== projData.meta.editor) {
      closeProjectAndLayout();
      handleOpenEditor(projData.meta.editor, projData);
      return;
    }
    openProjectViaEditor(projData, meta.value?.editor);
  }, []);

  return (
    <>
      {(app.splashVisible.value || error) && <Splash error={error} />}

      <Alerts items={app.alerts.value} />

      <MenuBar
        className={styles.menuBarPosition}
        showHomeButton={!homeVisible.value}
        onRequestHome={handleBackHome}
        onOpenTutorialLibrary={handleOpenTutorialLibrary}
      />

      <div className={styles.bodyWrapper}>
        <div className={styles.workspaceWrapper}>
          {LeftDockContent && (
            <div className={styles.sidebarWrapper}>
              <LeftDockContent />
            </div>
          )}

          <div className={styles.editorWrapper}>
            <Tabs
              id={styles.tabsWrapper}
              className={styles.tabsWrapper}
            >
              {app.tabs.value?.map?.(({ Content: TabContent, ...tab }, index) => (
                <>
                  <TabLabel
                    key={index}
                    name={index}
                    checked={index === app.tabIndex.value}
                    onSelect={() => openTab(index)}
                  >
                    <img src={tab.icon} />
                    {tab.label}
                  </TabLabel>
                  <TabPanel
                    key={index}
                    name={index}
                    className={tabPanelClass}
                  >
                    {(index === 0 || app.tabIndex.value === index) && <TabContent />}
                  </TabPanel>
                </>
              ))}
            </Tabs>

            {PaneContent && (
              <PaneBox
                id={styles.paneWrapper}
                className={styles.paneWrapper}
                title={pane.label}
                right={!RightDockContent}
                left={!LeftDockContent}
              >
                <PaneContent />
              </PaneBox>
            )}
          </div>

          {RightDockContent && (
            <div className={styles.sidebarWrapper}>
              <RightDockContent />
            </div>
          )}
        </div>
      </div>

      {foundDevices.value && (
        <ConnectionModal
          title={meta.value?.deviceName}
          icon={meta.value?.deviceIcon}
          devices={foundDevices.value}
          onClose={handleConnectionClose}
          onConnect={handleConnectionConnect}
        />
      )}

      {tutorialId.value && (
        <TutorialBox
          tutorialId={tutorialId.value}
          onBack={handleOpenTutorialLibrary}
          onClose={useCallback(() => (tutorialId.value = null), [])}
        />
      )}

      {tutorialLibraryVisible.value && (
        <TutorialLibrary
          onOpenTutorial={handleOpenTutorial}
          onClose={useCallback(() => (tutorialLibraryVisible.value = false), [])}
        />
      )}

      {homeVisible.value && (
        <Home
          onOpenEditor={handleOpenEditor}
          onOpenProject={handleOpenProject}
        />
      )}

      {app.userStorageVisible.value && <UserStorage onOpenProject={handleOpenProject} />}

      {app.prompt.value &&
        (app.prompt.value.inputItems ? (
          <InputsPromptModal
            title={app.prompt.value.title}
            inputItems={app.prompt.value.inputItems}
            onClose={closePromptModal}
            onSubmit={app.prompt.value.onSubmit}
          />
        ) : (
          <PromptModal
            title={app.prompt.value.title}
            label={app.prompt.value.label}
            content={app.prompt.value.content}
            onClose={closePromptModal}
            onSubmit={app.prompt.value.onSubmit}
          >
            {app.prompt.value.body}
          </PromptModal>
        ))}
    </>
  );
}
