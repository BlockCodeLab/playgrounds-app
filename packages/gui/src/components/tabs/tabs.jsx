import { cloneElement } from 'preact';
import { useMemo } from 'preact/hooks';
import { classNames, flatChildren } from '@blockcode/utils';
import { injectStyle } from '../../lib/inject-style';

import { TabLabel } from './tab-label';
import { TabPanel } from './tab-panel';
import styles from './tabs.module.css';

export { TabLabel, TabPanel };

export function Tabs({ id, className, children }) {
  const tabs = useMemo(
    () =>
      flatChildren(children)
        .filter((child) => child)
        .map((child) => cloneElement(child, { id })),
    [id, children],
  );

  injectStyle({
    [`.${styles.tab}:checked+.${styles.tabLabel}`]: {
      zIndex: `${tabs.length + 1}`,
    },
  });

  return (
    <div className={classNames(styles.tabsWrapper, className)}>
      {tabs
        .filter((child) => child.type === TabLabel)
        .map((child, i, labels) => {
          injectStyle({
            [`.${styles.tabLabel}:nth-of-type(${i + 1})`]: {
              zIndex: `${labels.length - i}`,
            },
          });
          return child;
        })}
      {tabs
        .filter((child) => child.type === TabPanel)
        .map((child) => {
          const tabId = `${id}-tab-${child.props.name}`;
          const panelId = `${id}-panel-${child.props.name}`;
          injectStyle({
            [`#${tabId}:checked~#${panelId}`]: {
              transform: 'none',
            },
          });
          return child;
        })}
    </div>
  );
}
