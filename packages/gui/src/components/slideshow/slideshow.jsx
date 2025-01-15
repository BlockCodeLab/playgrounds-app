import { useEffect } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { classNames } from '@blockcode/utils';
import { Button } from '@blockcode/core';
import styles from './slideshow.module.css';

export function Slideshow({ pages, className }) {
  const currentIndex = useSignal(0);

  useEffect(() => {
    setInterval(() => (currentIndex.value = (currentIndex.value + 1) % pages.length), 7000);
  }, []);

  return (
    <div className={classNames(styles.coverWrapper, className)}>
      {pages.map((cover, index) => (
        <div
          key={index}
          className={classNames(styles.cover, {
            [styles.hidden]: index !== currentIndex.value,
          })}
          style={{ backgroundImage: `url(${cover.backgroundImage})` }}
        >
          <div>
            <div className={styles.title}>{cover.title}</div>
            <Button
              className={styles.button}
              onClick={cover.onClick}
            >
              {cover.buttonText}
            </Button>
          </div>
          <img
            className={styles.feature}
            src={cover.featureImage}
          />
        </div>
      ))}
    </div>
  );
}
