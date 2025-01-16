import { useCallback, useMemo } from 'preact/hooks';
import { batch } from '@preact/signals';
import { nanoid } from '@blockcode/utils';
import {
  useLocalesContext,
  useProjectContext,
  translate,
  setAlert,
  delAlert,
  openAsset,
  addAsset,
  delAsset,
} from '@blockcode/core';
import { loadImageFromFile, BlankImageData } from '../../lib/load-image';
import { EditorModes } from '../../lib/editor-mode';

import { Text, IconSelector, ActionButton } from '@blockcode/core';
import styles from './selector.module.css';

import costumeIcon from './icons/icon-costume.svg';
import backdropIcon from './icons/icon-backdrop.svg';
import searchIcon from './icons/icon-search.svg';
import paintIcon from './icons/icon-paint.svg';
import surpriseIcon from './icons/icon-surprise.svg';
import fileUploadIcon from './icons/icon-file-upload.svg';

const MoreButtonTooltips = {
  [EditorModes.Image]: (
    <Text
      id="paint.actionButton.image"
      defaultMessage="Choose a Image"
    />
  ),
  [EditorModes.Costume]: (
    <Text
      id="paint.actionButton.costume"
      defaultMessage="Choose a Costume"
    />
  ),
  [EditorModes.Backdrop]: (
    <Text
      id="paint.actionButton.backdrop"
      defaultMessage="Choose a Backdrop"
    />
  ),
};

const UploadTooltips = {
  [EditorModes.Image]: (
    <Text
      id="paint.actionButton.upload"
      defaultMessage="Upload Image"
    />
  ),
  [EditorModes.Costume]: (
    <Text
      id="paint.actionButton.uploadCostume"
      defaultMessage="Upload Costume"
    />
  ),
  [EditorModes.Backdrop]: (
    <Text
      id="paint.actionButton.uploadBackdrop"
      defaultMessage="Upload Backdrop"
    />
  ),
};

const getImageName = (mode, translator) => {
  switch (mode) {
    case EditorModes.Image:
      return translate('paint.painter.image', 'Image', translator).toLowerCase();
    case EditorModes.Costume:
      return translate('paint.painter.costume', 'Costume', translator).toLowerCase();
    case EditorModes.Backdrop:
      return translate('paint.painter.backdrop', 'Backdrop', translator).toLowerCase();
  }
};

const getImageIcon = (image) => `data:${image.type};base64,${image.data}`;

export function Selector({ mode, maxSize, onImagesFilter, onShowLibrary, onSurprise, onChange, onDelete }) {
  const { translator } = useLocalesContext();

  const { assets, assetId } = useProjectContext();

  const getImages = useCallback(() => {
    return assets.value.filter((res) => {
      if (!/^image\//.test(res.type)) return false;
      if (!onImagesFilter) return true;
      return onImagesFilter(res);
    });
  }, [onImagesFilter]);

  const handleUploadFile = useCallback(() => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.multiple = true;
    fileInput.click();
    fileInput.addEventListener('change', async (e) => {
      const alertId = nanoid();
      setAlert('importing', { id: alertId });

      const images = [];
      for (const file of e.target.files) {
        let image = await loadImageFromFile(file, maxSize);
        if (!image) {
          setAlert(
            {
              message: (
                <Text
                  id="paint.actionButton.uploadError"
                  defaultMessage='Upload "{file}" failed.'
                  file={file.name}
                />
              ),
            },
            2000,
          );
          image = {
            dataset: {
              data: BlankImageData,
            },
            width: 1,
            height: 1,
          };
        }
        image.name = file.name.slice(0, file.name.lastIndexOf('.'));
        images.push(image);
      }
      delAlert(alertId);

      batch(() => {
        for (const image of images) {
          addAsset({
            id: image.id,
            type: 'image/png',
            name: image.name,
            data: image.dataset.data,
            width: image.width,
            height: image.height,
            centerX: Math.floor(image.width / 2),
            centerY: Math.floor(image.height / 2),
          });
          if (onChange) {
            onChange(image.id);
          }
        }
      });
    });
  }, []);

  const handlePaintImage = useCallback(() => {
    const imageId = nanoid();
    batch(() => {
      addAsset({
        id: imageId,
        type: 'image/png',
        name: getImageName(mode, translator),
        data: BlankImageData,
        width: 1,
        height: 1,
        centerX: 1,
        centerY: 1,
      });
      if (onChange) {
        onChange(imageId);
      }
    });
  }, []);

  const handleDeleteImage = useCallback((index) => {
    const images = getImages();
    const image = images[index];

    batch(() => {
      let openId = assetId.value;
      if (image.id === assetId.value) {
        if (index === 0) {
          openId = images[1]?.id;
        } else if (index + 1 < images.length) {
          openId = images[index + 1].id;
        } else if (index - 1 > -1) {
          openId = images[index - 1].id;
        }
      }

      delAsset(image.id);
      openAsset(openId);
      onDelete(image.id, openId);
    });
  }, []);

  const handleDuplicateImage = useCallback((index) => {
    const images = getImages();
    const image = images[index];
    const imageId = nanoid();

    batch(() => {
      addAsset({
        ...image,
        id: imageId,
      });
      if (onChange) {
        onChange(imageId);
      }
    });
  }, []);

  const handleSelect = useCallback((i, item) => {
    batch(() => {
      openAsset(item.id);
      if (onChange) {
        onChange(item.id);
      }
    });
  }, []);

  const images = getImages();

  return (
    <div className={styles.selectorWrapper}>
      <IconSelector
        displayOrder
        id="doodle-selector"
        className={styles.selectorItemsWrapper}
        items={images.map((image, i) => ({
          ...image,
          details: `${image.width}×${image.height}`,
          icon: getImageIcon(image),
          order: i,
          className: styles.selectorItem,
          contextMenu: [
            [
              {
                label: (
                  <Text
                    id="paint.contextMenu.duplicate"
                    defaultMessage="duplicate"
                  />
                ),
                onClick: () => handleDuplicateImage(i),
              },
              {
                label: (
                  <Text
                    id="paint.contextMenu.export"
                    defaultMessage="export"
                  />
                ),
                disabled: true,
              },
            ],
            [
              {
                label: (
                  <Text
                    id="paint.contextMenu.delete"
                    defaultMessage="delete"
                  />
                ),
                disabled: images.length <= 1,
                className: styles.deleteMenuItem,
                onClick: () => handleDeleteImage(i),
              },
            ],
          ],
        }))}
        selectedId={assetId.value}
        onSelect={handleSelect}
        onDelete={images.length > 1 && handleDeleteImage}
      />

      <div className={styles.addButtonWrapper}>
        <ActionButton
          tooltipPlacement="right"
          className={styles.addButton}
          icon={mode === EditorModes.Costume ? costumeIcon : backdropIcon}
          tooltip={MoreButtonTooltips[mode]}
          onClick={onShowLibrary}
          moreButtons={[
            {
              icon: fileUploadIcon,
              tooltip: UploadTooltips[mode],
              onClick: handleUploadFile,
            },
            {
              icon: surpriseIcon,
              tooltip: (
                <Text
                  id="paint.actionButton.surprise"
                  defaultMessage="Surprise"
                />
              ),
              onClick: onSurprise,
            },
            {
              icon: paintIcon,
              tooltip: (
                <Text
                  id="paint.actionButton.paint"
                  defaultMessage="Paint"
                />
              ),
              onClick: handlePaintImage,
            },
            {
              icon: searchIcon,
              tooltip: MoreButtonTooltips[mode],
              onClick: onShowLibrary,
            },
          ]}
        />
      </div>
    </div>
  );
}
