import { useCallback, useId } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { Input } from './input';

export function BufferedInput({ value, type, forceFocus, onSubmit, ...props }) {
  const bufferedValue = useSignal(null);

  const handleFocus = useCallback((e) => {
    e.target.setSelectionRange(0, 0);
    e.target.select();
  }, []);

  const handleFlush = useCallback(
    (e) => {
      const isNumeric = type === 'number';
      const validated = isNumeric ? !isNaN(bufferedValue.value) : true;
      if (bufferedValue.value !== null && validated && onSubmit) {
        onSubmit(isNumeric ? Number(bufferedValue.value) : bufferedValue.value, e);
      }
      bufferedValue.value = null;
      if (e && forceFocus) {
        e.target.focus();
      }
    },
    [type, forceFocus, onSubmit],
  );

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        handleFlush(e);
        e.target.blur();
      }
    },
    [handleFlush],
  );

  const handleChange = useCallback((e) => (bufferedValue.value = e.target.value), []);

  return (
    <Input
      {...props}
      value={bufferedValue.value === null ? value : bufferedValue.value}
      onFocus={handleFocus}
      onBlur={handleFlush}
      onChange={handleChange}
      onInput={handleChange}
      onKeyPress={handleKeyPress}
    />
  );
}
