import { useCallback, useId } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { Input } from './input';

export function BufferedInput({ value, type, forceFocus, autoClear, enterSubmit, onSubmit, ...props }) {
  const bufferedValue = useSignal(null);

  const handleFocus = useCallback(
    (e) => {
      e.target.setSelectionRange(0, 0);
      e.target.select();
      if (autoClear) {
        bufferedValue.value = null;
        e.target.value = '';
      }
    },
    [autoClear],
  );

  const handleFlush = useCallback(
    (e) => {
      const isNumeric = type === 'number';
      const validated = isNumeric ? !isNaN(bufferedValue.value) : true;
      if (bufferedValue.value !== null && validated && onSubmit) {
        onSubmit(isNumeric ? Number(bufferedValue.value) : bufferedValue.value, e);
      }
      bufferedValue.value = null;
      if (forceFocus) {
        e.target.focus();
      }
      if (autoClear) {
        e.target.value = '';
      }
    },
    [type, forceFocus, onSubmit],
  );

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        e.target.blur();
        if (enterSubmit) {
          handleFlush(e);
        }
      }
    },
    [enterSubmit],
  );

  const handleChange = useCallback((e) => (bufferedValue.value = e.target.value), []);

  return (
    <Input
      {...props}
      value={bufferedValue.value === null ? value : bufferedValue.value}
      onFocus={handleFocus}
      onBlur={enterSubmit ? null : handleFlush}
      onChange={handleChange}
      onInput={handleChange}
      onKeyPress={handleKeyPress}
    />
  );
}
