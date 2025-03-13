import './l10n';

export { ScratchBlocks } from './lib/scratch-blocks';

export {
  blockSeparator,
  categorySeparator,
  motionTheme,
  looksTheme,
  soundTheme,
  eventsTheme,
  controlTheme,
  sensingTheme,
  operatorsTheme,
  variablesTheme,
  myBlocksTheme,
  monitorTheme,
} from './lib/make-toolbox-xml';

export { BlocksEditor, loadedExtensions } from './components/blocks-editor/blocks-editor';

export { CodeReview } from './components/code-review/code-review';

export { Emulator } from './components/emulator/emulator';

export { blocksTab } from './components/tabs/blocks-tab';

export { codeReviewTab } from './components/tabs/code-review-tab';

export { Runtime } from './lib/runtime/runtime';

export { JavaScriptGenerator } from './generators/javascript';

export { PythonGenerator } from './generators/python';

export { ClangGenerator } from './generators/clang';

export { MicroPythonGenerator } from './generators/micropython';

export { EmulatorGenerator } from './generators/emulator';
