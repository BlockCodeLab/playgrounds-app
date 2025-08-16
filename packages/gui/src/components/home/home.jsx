import { useEffect, useCallback } from 'preact/hooks';
import { batch, useSignal, useSignalEffect } from '@preact/signals';
import {
  classNames,
  getProjectsThumbs,
  getProject,
  cloneProject,
  renameProject,
  delProject,
  openProjectFromURL,
} from '@blockcode/utils';
import {
  useLocalesContext,
  maybeTranslate,
  setAlert,
  delAlert,
  openPromptModal,
  openUserStorage,
} from '@blockcode/core';
import { version } from '../../../../../package.json';

import { Text, ContextMenu, LibraryItem } from '@blockcode/core';
import { Slideshow } from '../slideshow/slideshow';
import styles from './home.module.css';

import getSlideshow from '../../lib/get-slideshow';
import getExamples from '../../lib/get-examples';
import getEditors from '../../lib/get-editors';

export function Home({ onOpenEditor, onOpenProject }) {
  // 项目限制数量限制，依据页面宽度调整
  const DISPLAY_PROJECTS_COUNTS = Math.floor((document.body.clientWidth - 20) / (160 + 16));
  const DISPLAY_EXAMPLES_COUNTS = Math.floor((document.body.clientWidth - 20) / (220 + 16)) * 2;

  const { language } = useLocalesContext();

  // 用户保存的项目
  const userProjects = useSignal(null);
  const projectsCount = useSignal(0);

  // 可用的编辑器
  const editors = useSignal(null);

  // 精彩案例
  const exampleHub = useSignal(null);

  const getUserProjects = useCallback(async () => {
    const result = await getProjectsThumbs();
    batch(() => {
      projectsCount.value = result.length;
      userProjects.value = result.filter((_, i) => i < DISPLAY_PROJECTS_COUNTS);
    });
  }, []);

  useEffect(getUserProjects, []);

  const rename = useCallback((key, name) => {
    openPromptModal({
      title: (
        <Text
          id="gui.library.projects.rename"
          defaultMessage="rename"
        />
      ),
      inputItems: [
        {
          key: 'name',
          label: (
            <Text
              id="gui.menubar.titlePlaceholder"
              defaultMessage="Project title here"
            />
          ),
          defaultValue: maybeTranslate(
            name ?? (
              <Text
                id="gui.project.shortname"
                defaultMessage="Untitled"
              />
            ),
          ),
        },
      ],
      onSubmit: async (data) => {
        if (data?.name) {
          await renameProject(key, data.name);
          getUserProjects();
        }
      },
    });
  }, []);

  const duplicate = useCallback(async (key) => {
    await cloneProject(key);
    getUserProjects();
  }, []);

  const remove = useCallback((key, name) => {
    openPromptModal({
      title: (
        <Text
          id="gui.library.projects.delete"
          defaultMessage="delete"
        />
      ),
      label: (
        <Text
          id="gui.library.projects.deleteConfirm"
          defaultMessage='Delect "{name}" project?'
          name={maybeTranslate(
            name || (
              <Text
                id="gui.project.shortname"
                defaultMessage="Untitled"
              />
            ),
          )}
        />
      ),
      onSubmit: async () => {
        await delProject(key);
        getUserProjects();
      },
    });
  }, []);

  const wrapOpenProject = useCallback(
    (key) => async () => {
      const project = await getProject(key);
      onOpenProject(project);
    },
    [onOpenProject],
  );

  const UserProjects = () => {
    return userProjects.value?.map?.((item) => (
      <ContextMenu
        key={item.key}
        menuItems={[
          [
            {
              label: (
                <Text
                  id="gui.library.projects.rename"
                  defaultMessage="rename"
                />
              ),
              onClick: () => rename(item.key, item.name),
            },
            {
              label: (
                <Text
                  id="gui.library.projects.duplicate"
                  defaultMessage="duplicate"
                />
              ),
              onClick: () => duplicate(item.key),
            },
          ],
          [
            {
              label: (
                <Text
                  id="gui.library.projects.delete"
                  defaultMessage="delete"
                />
              ),
              className: styles.deleteMenuItem,
              onClick: () => remove(item.key, item.name),
            },
          ],
        ]}
      >
        <LibraryItem
          id={item.key}
          name={
            item.name || (
              <Text
                id="gui.project.shortname"
                defaultMessage="Untitled"
              />
            )
          }
          image={item.thumb}
          onSelect={wrapOpenProject(item.key)}
        />
      </ContextMenu>
    ));
  };

  // 根据当前语言获取可用编辑器和案例数据
  useSignalEffect(async () => {
    let result = await getEditors();
    result = result.map((editor) =>
      Object.assign(editor, {
        beta: editor.beta || (DEBUG && editor.disabled), // 正式版 beta 显示为禁用，DEBUG 时禁用也显示为 beta
        disabled: !DEBUG && (editor.disabled || (!BETA && editor.beta)), // DEBUG 时没有禁用，正式版 beta 也显示为禁用
        onSelect: () => onOpenEditor(editor.id),
      }),
    );
    // 过滤不用显示的
    result = result.filter((editor) => {
      if (editor.hidden) {
        return false;
      }

      // 正式版本不显示禁用
      if (!BETA && !DEBUG && editor.disabled) {
        return false;
      }

      return true;
    });
    editors.value = result.sort((a, b) => a.sortIndex - b.sortIndex);

    exampleHub.value = await getExamples(result);
  });

  return (
    <div className={styles.homeWrapper}>
      <Slideshow
        className={styles.gettingStarted}
        pages={getSlideshow(onOpenEditor, onOpenProject)}
      />

      {userProjects.value?.length > 0 && (
        <>
          <div className={styles.libraryLabel}>
            <span>
              <Text
                id="gui.home.my"
                defaultMessage="My projects"
              />
            </span>
            {projectsCount.value > DISPLAY_PROJECTS_COUNTS && (
              <span
                className={classNames(styles.viewAll, styles.link)}
                onClick={openUserStorage}
              >
                <Text
                  id="gui.home.allCounts"
                  defaultMessage="View all ({counts})"
                  counts={projectsCount.value}
                />
              </span>
            )}
          </div>
          <div className={styles.libraryGrid}>
            <UserProjects />
          </div>
        </>
      )}

      {editors.value?.length > 0 && (
        <>
          <div className={styles.libraryLabel}>
            <Text
              id="gui.home.new"
              defaultMessage="Create new project"
            />
          </div>
          <div className={styles.libraryGrid}>
            {editors.value.map((item, index) => (
              <LibraryItem
                featured
                id={index}
                key={index}
                disabled={item.disabled}
                beta={item.beta || item.preview}
                image={item.image}
                name={item.name}
                description={item.description}
                collaborator={item.collaborator}
                blocksRequired={item.blocksRequired}
                micropythonRequired={item.micropythonRequired}
                clangRequired={item.clangRequired}
                onSelect={item.onSelect}
              />
            ))}
          </div>
        </>
      )}

      {exampleHub.value?.map(
        (hub) =>
          hub.examples.length > 0 && (
            <>
              <div className={styles.libraryLabel}>
                <span>
                  <Text
                    id="gui.home.examples"
                    defaultMessage="Wonderful {label} examples"
                    label={maybeTranslate(hub.name)}
                  />
                </span>
              </div>
              {hub.examples.length > DISPLAY_EXAMPLES_COUNTS && (
                <span
                  className={classNames(styles.viewAll, styles.link)}
                  // onClick={openExamplesLibrary}
                >
                  <Text
                    id="gui.home.all"
                    defaultMessage="View all"
                  />
                </span>
              )}
              <div className={styles.libraryGrid}>
                {hub.examples.map((item, index) => (
                  <LibraryItem
                    large
                    id={index}
                    name={item.name}
                    author={item.author}
                    copyright={item.copyright}
                    image={item.thumb}
                    onSelect={async () => {
                      setAlert('importing', { id: item.name });
                      const example = await openProjectFromURL(item.file);
                      delAlert(item.name);

                      onOpenProject(example);
                    }}
                  />
                ))}
              </div>
            </>
          ),
      )}

      <div className={styles.footer}>
        {/* <span
          className={classNames(styles.footerItem, styles.link)}
          onClick={() => window.open('https://lab.blockcode.fun/', '_blank')}
        >
          BlockCode Lab
        </span> */}
        <span
          className={classNames(styles.footerItem, styles.link)}
          onClick={() => {
            openPromptModal({
              title: (
                <Text
                  id="gui.terms.title"
                  defaultMessage="Terms of Use"
                />
              ),
              content: (
                <Text
                  id="gui.terms.content"
                  defaultMessage="Terms of Use"
                />
              ),
            });
          }}
        >
          <Text
            id="gui.terms.title"
            defaultMessage="Terms of Use"
          />
        </span>
        <span
          className={classNames(styles.footerItem, styles.link)}
          onClick={() => {
            openPromptModal({
              title: (
                <Text
                  id="gui.privacy.title"
                  defaultMessage="Privacy"
                />
              ),
              content: (
                <Text
                  id="gui.privacy.content"
                  defaultMessage="Privacy"
                />
              ),
            });
          }}
        >
          <Text
            id="gui.privacy.title"
            defaultMessage="Privacy"
          />
        </span>
        <span
          className={classNames(styles.footerItem, styles.link)}
          onClick={() => window.open('https://github.com/BlockCodeLab/playgrounds-app', '_blank')}
        >
          GitHub
        </span>
        <span
          className={classNames(styles.footerItem, styles.link)}
          onClick={() => {
            openPromptModal({
              title: (
                <Text
                  id="gui.about.title"
                  defaultMessage="About..."
                />
              ),
              body: (
                <div className={styles.aboutVersionContent}>
                  <div className={styles.aboutVersionRow}>
                    <div>
                      <b>
                        <Text
                          id="gui.about.main"
                          defaultMessage="Main program"
                        />
                      </b>
                    </div>
                    <div>v{version}</div>
                  </div>
                  <div className={styles.aboutVersionRow}></div>
                  {editors.value
                    .filter((item) => !item.disabled)
                    .map((item) => (
                      <div className={styles.aboutVersionRow}>
                        <div>
                          <b>{item.name}</b>
                        </div>
                        <div>v{item.version}</div>
                      </div>
                    ))}
                </div>
              ),
            });
          }}
        >
          v{version}
        </span>
      </div>
    </div>
  );
}
