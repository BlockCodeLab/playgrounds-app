import { Selector } from '../selector/selector';
import { Wave } from '../wave/wave';

import styles from './sound-editor.module.css';

export function SoundEditor({ onShowLibrary, onSurprise, onSoundsFilter }) {
  return (
    <div className={styles.waveEditorWrapper}>
      <Selector
        onShowLibrary={onShowLibrary}
        onSurprise={onSurprise}
        onSoundsFilter={onSoundsFilter}
      />

      <Wave />
    </div>
  );
}
