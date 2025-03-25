import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

/* register contribs */
import 'monaco-editor/esm/vs/editor/contrib/find/browser/findController';
import 'monaco-editor/esm/vs/editor/contrib/folding/browser/folding';
import 'monaco-editor/esm/vs/editor/contrib/format/browser/formatActions.js';
import 'monaco-editor/esm/vs/editor/contrib/suggest/browser/suggestController';
import 'monaco-editor/esm/vs/editor/contrib/tokenization/browser/tokenization';

/* register languages */
import 'monaco-editor/esm/vs/language/json/monaco.contribution';
import 'monaco-editor/esm/vs/language/typescript/monaco.contribution';
import 'monaco-editor/esm/vs/basic-languages/ini/ini.contribution';
import 'monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution';
import 'monaco-editor/esm/vs/basic-languages/markdown/markdown.contribution';
import 'monaco-editor/esm/vs/basic-languages/python/python.contribution';
import 'monaco-editor/esm/vs/basic-languages/typescript/typescript.contribution';
import 'monaco-editor/esm/vs/basic-languages/xml/xml.contribution';
import 'monaco-editor/esm/vs/basic-languages/cpp/cpp.contribution';

import './define-theme';

window.MonacoEnvironment = {
  getWorker: (_, label) => {
    switch (label) {
      case 'css':
        return new Worker('/assets/workers/css-worker.js', { type: 'module' });
      case 'html':
        return new Worker('/assets/workers/html-worker.js', { type: 'module' });
      case 'json':
        return new Worker('/assets/workers/json-worker.js', { type: 'module' });
      case 'javascript':
      case 'typescript':
        return new Worker('/assets/workers/ts-worker.js', { type: 'module' });
      default:
        return new Worker('/assets/workers/editor-worker.js', { type: 'module' });
    }
  },
};

export default async function createEditor(ref, options) {
  return monaco.editor.create(ref, {
    /* config */
    theme: 'bc',
    autoClosingBrackets: 'languageDefined',
    autoClosingDelete: 'auto',
    autoClosingQuotes: 'languageDefined',
    autoSurround: 'languageDefined',
    automaticLayout: true,
    bracketPairColorization: {
      enabled: true,
      independentColorPoolPerBracketType: true,
    },
    // colorDecorators: true,
    contextmenu: false,
    copyWithSyntaxHighlighting: true,
    // dropIntoEditor: true,
    // fontLigatures: true,
    fontSize: 16,
    formatOnPaste: true,
    inlineSuggest: {
      enabled: true,
    },
    minimap: {
      enabled: false,
    },
    hideCursorInOverviewRuler: true,
    overviewRulerBorder: false,
    // renderLineHighlight: 'none',
    // renderWhitespace: 'boundary',
    scrollbar: {
      horizontal: 'visible',
      horizontalScrollbarSize: 6,
      vertical: 'visible',
      verticalScrollbarSize: 6,
    },
    showDeprecated: true,
    smoothScrolling: true,

    ...options,
  });
}
