import { useEffect, useCallback } from 'preact/hooks';
import { batch, useSignal, useSignalEffect } from '@preact/signals';
import { classNames, getProjectsThumbs, getProject, cloneProject, renameProject, delProject } from '@blockcode/utils';
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

// 项目限制数量限制
// TODO: 根据页面宽度自动调整
const DISPLAY_PROJECTS_COUNTS = 7;
const DISPLAY_EXAMPLES_COUNTS = 10;

export function Home({ onOpenEditor, onOpenProject }) {
  const { translator, language } = useLocalesContext();

  // 用户保存的项目
  const userProjects = useSignal(null);
  const projectsCount = useSignal(0);

  // 可用的编辑器
  const editors = useSignal(null);

  // 精彩案例
  const examples = useSignal(null);

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
            translator,
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
            translator,
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
    examples.value = getExamples(language.value);

    let result = await getEditors();
    // 过滤不用显示的
    result = result.filter((editor) => {
      if (editor.hidden) {
        return false;
      }
      // Electron 桌面版本不显示禁用或beta
      if (window.electron && (editor.beta || editor.disabled)) {
        return false;
      }
      return true;
    });
    result = result.map((editor) =>
      Object.assign(editor, {
        disabled: editor.disabled || (!DEBUG && editor.beta), // DEBUG时允许进入beta
        onSelect: () => onOpenEditor(editor.id),
      }),
    );
    editors.value = result.sort((a, b) => a.sortIndex - b.sortIndex);
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
                  id="gui.home.all"
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
                beta={item.beta}
                image={item.image}
                name={item.name}
                description={item.description}
                collaborator={item.collaborator}
                blocksRequired={item.blocksRequired}
                micropythonRequired={item.micropythonRequired}
                onSelect={item.onSelect}
              />
            ))}
          </div>
        </>
      )}

      {examples.value?.length > 0 && (
        <>
          <div className={styles.libraryLabel}>
            <span>
              <Text
                id="gui.home.examples"
                defaultMessage="Wonderful examples"
              />
            </span>
          </div>
          {examples.value.length > DISPLAY_EXAMPLES_COUNTS && (
            <span
              className={classNames(styles.viewAll, styles.link)}
              // onClick={openExamplesLibrary}
            >
              <Text
                id="gui.home.all"
                defaultMessage="View all ({counts})"
                counts={examples.value.length}
              />
            </span>
          )}
          <div className={styles.libraryGrid}>
            {examples.value.map((item, index) => (
              <LibraryItem
                large
                id={index}
                name={item.name}
                image={item.thumb}
                onSelect={async () => {
                  setAlert('importing', { id: item.name });
                  const example = await fetch(item.uri).then((res) => res.json());
                  delAlert(item.name);

                  onOpenProject(example);

                  if (item.alert) {
                    setTimeout(() => {
                      openPromptModal({
                        title: example.name,
                        label: maybeTranslate(item.alert, translator),
                      });
                    }, 500);
                  }
                }}
              />
            ))}
          </div>
        </>
      )}

      <div className={styles.footer}>
        <span
          className={classNames(styles.footerItem, styles.link)}
          onClick={() => window.open('https://lab.blockcode.fun/', '_blank')}
        >
          BlockCode Lab
        </span>
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
                    .filter((item) => !item.preview && !item.disabled)
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
