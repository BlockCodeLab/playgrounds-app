import { classNames } from '@blockcode/utils';
import styles from './library-item.module.css';

import { Text } from '@eo-locale/preact';

import iconBlocks from './icons/icon-blocks.svg';
import iconMicroPython from './icons/icon-micropython.svg';
import iconBluetooth from './icons/icon-bluetooth.svg';
import iconInternet from './icons/icon-internet.svg';

export function LibraryItem(props) {
  return props.featured ? (
    <div
      className={classNames(styles.libraryItem, styles.featuredItem, {
        [styles.disabled]: props.disabled,
        [styles.libraryItemFeatured]: props.featured,
      })}
      onClick={!props.disabled && props.onSelect}
    >
      <div className={styles.featuredImageContainer}>
        {props.disabled ? (
          <div className={classNames(styles.cornerText, styles.comingSoonText)}>
            <Text
              id="core.library.comingSoon"
              defaultMessage="Coming Soon"
            />
          </div>
        ) : (
          props.beta && (
            <div className={classNames(styles.cornerText, styles.previewText)}>
              <Text
                id="core.library.beta"
                defaultMessage="Beta"
              />
            </div>
          )
        )}
        <img
          className={styles.featuredImage}
          src={props.image}
        />
      </div>
      {props.icon && (
        <div className={styles.libraryItemInsetImageContainer}>
          <img
            className={styles.libraryItemInsetImage}
            src={props.icon}
          />
        </div>
      )}
      {props.title ? (
        <div className={classNames(styles.libraryItemName, styles.featuredTitle)}>{props.title}</div>
      ) : (
        <div className={styles.featuredText}>
          <span className={styles.libraryItemName}>{props.name}</span>
          <br />
          <span className={styles.featuredDescription}>{props.description}</span>
        </div>
      )}
      {(props.blocksRequired ||
        props.micropythonRequired ||
        props.bluetoothRequired ||
        props.internetRequired ||
        props.collaborator) && (
        <div className={styles.featuredMetadata}>
          <div className={styles.featuredRequirement}>
            {(props.blocksRequired ||
              props.micropythonRequired ||
              props.bluetoothRequired ||
              props.internetRequired) && (
              <div>
                <div>
                  {props.blocksRequired || props.micropythonRequired ? (
                    <Text
                      id="core.library.programming"
                      defaultMessage="Programming"
                    />
                  ) : (
                    <Text
                      id="core.library.requires"
                      defaultMessage="Requires"
                    />
                  )}
                </div>
                <div className={styles.featuredMetadataDetail}>
                  {props.blocksRequired && <img src={iconBlocks} />}
                  {props.micropythonRequired && <img src={iconMicroPython} />}
                  {props.bluetoothRequired && <img src={iconBluetooth} />}
                  {props.internetRequired && <img src={iconInternet} />}
                </div>
              </div>
            )}
          </div>
          <div className={styles.featuredCollaboration}>
            {props.collaborator && (
              <div>
                <div>
                  <Text
                    id="core.library.collaboration"
                    defaultMessage="Collaboration with"
                  />
                </div>
                <div className={styles.featuredMetadataDetail}>{props.collaborator}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  ) : (
    <div
      className={classNames(styles.libraryItem, {
        [styles.large]: props.large,
      })}
      onClick={props.onSelect}
    >
      <div className={styles.libraryItemImageContainerWrapper}>
        <div className={styles.libraryItemImageContainer}>
          <img
            className={styles.libraryItemImage}
            onPointerEnter={props.onMouseEnter}
            onPointerLeave={props.onMouseLeave}
            src={props.image}
          />
        </div>
      </div>
      <span className={styles.libraryItemName}>{props.name}</span>
      {(props.copyright || props.author) && (
        <span className={styles.libraryItemDetial}>{props.copyright ? `© ${props.copyright}` : props.author}</span>
      )}
    </div>
  );
}
