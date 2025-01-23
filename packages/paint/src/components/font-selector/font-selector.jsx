import { useCallback, useEffect } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { Dropdown } from '@blockcode/core';
import { getAvailableFonts } from './fonts';
import styles from './font-selector.module.css';

export function FontSelector({ font, onChange }) {
  const fonts = useSignal(null);

  const wrapFontChange = useCallback((res) => () => onChange(res), [onChange]);

  useEffect(async () => {
    const availableFonts = await getAvailableFonts();
    fonts.value = availableFonts.map((res) => ({
      label: res.label ?? res.family,
      style: { fontFamily: res.family },
      onClick: wrapFontChange(res),
    }));
    if (!font) {
      fonts.value[0]?.onClick();
    }
  }, [font, wrapFontChange]);

  return (
    <Dropdown
      className={styles.fontSelector}
      items={fonts.value}
    >
      <span
        className={styles.displayedFontName}
        style={{ fontFamily: font?.family }}
      >
        {font?.label ?? font?.family}
      </span>
    </Dropdown>
  );
}
