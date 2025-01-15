import { classNames } from '@blockcode/utils';
import { useAppContext, Text } from '@blockcode/core';
import styles from './menu-bar.module.css';

import coursesIcon from './icons/icon-courses.svg';
import tutorialsIcon from './icons/icon-tutorials.svg';

export function TutorialsButton({ onClick }) {
  const { tutorials } = useAppContext();

  return (
    <>
      <div className={styles.divider} />
      <div
        className={classNames(styles.menuBarItem, styles.menuLabel, styles.hoverable)}
        onClick={onClick}
      >
        {tutorials.value?.type === 'course' ? (
          <>
            <img
              className={styles.tutorialsIcon}
              src={coursesIcon}
            />
            <Text
              id="gui.menubar.courses"
              defaultMessage="Courses"
            />
          </>
        ) : (
          <>
            <img
              className={styles.tutorialsIcon}
              src={tutorialsIcon}
            />
            <Text
              id="gui.menubar.tutorials"
              defaultMessage="Tutorials"
            />
          </>
        )}
      </div>
    </>
  );
}
