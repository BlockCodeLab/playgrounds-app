import { Selector } from '../selector/selector';
import Painter from '../painter/painter';

import styles from './paint-editor.module.css';

export function PaintEditor({ mode, maxSize, onImagesFilter, onShowLibrary, onSurprise, onChange, onDelete }) {
  return (
    <div className={styles.pixelEditorWrapper}>
      <Selector
        mode={mode}
        maxSize={maxSize}
        onImagesFilter={onImagesFilter}
        onShowLibrary={onShowLibrary}
        onSurprise={onSurprise}
        onChange={onChange}
        onDelete={onDelete}
      />

      <Painter
        mode={mode}
        maxSize={maxSize}
      />
    </div>
  );
}
