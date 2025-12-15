import { isElectron } from './simples';

export async function exportFile(data, suggestedName, options = {}) {
  if ('showSaveFilePicker' in window && !isElectron) {
    try {
      const fileHandle = await window.showSaveFilePicker({
        ...options,
        suggestedName,
      });
      const writable = await fileHandle.createWritable();
      await writable.write(data);
      await writable.close();
      return { success: true, fileHandle };
    } catch (err) {
      if (err.name === 'AbortError') {
        return { success: false, error: err.name };
      } else {
        return { success: false, error: err.message };
      }
    }
  } else {
    const link = document.createElement('a');
    const blob = data instanceof Blob ? data : new Blob([data]);
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', suggestedName);
    link.click();
    return { success: true };
  }
}
