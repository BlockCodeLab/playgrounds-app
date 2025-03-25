import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

monaco.editor.defineTheme('bc', {
  base: 'vs',
  inherit: true,
  rules: [],
  colors: {
    'editor.background': '#F9F9F9',
    'editor.foreground': '#575E75',
    'editor.lineHighlightBackground': '#E5F0FF',
    'editor.lineHighlightBorder': '#E5F0FF',
    'scrollbarSlider.background': '#CECDCE',
    'scrollbarSlider.hoverBackground': '#CECDCE',
    'scrollbarSlider.activeBackground': '#CECDCE',
  },
});
