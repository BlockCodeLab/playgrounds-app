import { useCallback, useEffect } from 'preact/hooks';
import { useComputed, useSignal } from '@preact/signals';
import { getProjectsThumbs, getProject, cloneProject, renameProject, delProject } from '@blockcode/utils';
import { useProjectContext, closeUserStorage, maybeTranslate, openPromptModal } from '@blockcode/core';

import { Text, Library } from '@blockcode/core';
import styles from './user-storage.module.css';

const FILTERABLE_COUNTS = 30;

export function UserStorage({ onOpenProject }) {
  const { meta } = useProjectContext();

  const userProjects = useSignal([]);

  const counts = useComputed(() => userProjects.value.length);

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
      closeUserStorage();
    },
    [],
  );

  const getUserProjects = useCallback(async () => {
    let result = await getProjectsThumbs();
    if (meta.value?.editor) {
      result = result.filter((item) => item.meta.editor === meta.value.editor);
    }
    result = result.sort((a, b) => b.modifiedDate - a.modifiedDate);

    userProjects.value = result.map((item) => ({
      name: maybeTranslate(
        item.name ?? (
          <Text
            id="gui.project.shortname"
            defaultMessage="Untitled"
          />
        ),
      ),
      image: item.thumb,
      onSelect: wrapOpenProject(item.key),
      contextMenu: [
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
      ],
    }));
  }, [wrapOpenProject, rename, remove]);

  useEffect(() => getUserProjects(), [getUserProjects]);

  return (
    <Library
      items={userProjects.value}
      filterable={counts.value > FILTERABLE_COUNTS}
      emptyMessage={
        <Text
          id="gui.library.projects.empty"
          defaultMessage="No project!"
        />
      }
      onClose={closeUserStorage}
    />
  );
}
