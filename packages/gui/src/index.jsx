import './l10n';

import { render } from 'preact';
import { LocalesProvider, AppProvider, ProjectProvider } from '@blockcode/core';
import { Layout } from './components/layout/layout';

import './lib/alert-messages';

function App() {
  return (
    <LocalesProvider>
      <AppProvider>
        <ProjectProvider>
          <Layout />
        </ProjectProvider>
      </AppProvider>
    </LocalesProvider>
  );
}

render(<App />, document.getElementById('root'));
