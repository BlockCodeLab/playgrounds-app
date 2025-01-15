import { classNames } from '@blockcode/utils';
import { Text, Spinner } from '@blockcode/core';
import styles from './splash.module.css';

export function Splash({ error }) {
  if (DEBUG && error) {
    console.error(error);
  }

  return (
    <div className={classNames(styles.splash, { [styles.error]: error })}>
      {!error && (
        <Spinner
          large
          level="info"
          className={styles.spinner}
        />
      )}
      <div className={styles.title}>
        {error ? (
          <Text
            id="gui.splash.errorTitle"
            defaultMessage="Error Occurred"
          />
        ) : (
          <Text
            id="gui.splash.loading"
            defaultMessage="Loading project..."
          />
        )}
      </div>
      <div className={styles.label}>
        {error && (
          <Text
            id="gui.splash.errorLabel"
            defaultMessage="Please refresh the page and reopen it."
          />
        )}
      </div>
    </div>
  );
}
