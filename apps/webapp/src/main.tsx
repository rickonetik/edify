import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App.js';
import './shared/ui/theme/tokens.css';
import './shared/ui/theme/global.css';

import { FLAGS } from './shared/config/flags.js';

// Start MSW if FLAGS.useMsw is true (respects realApi override)
async function enableMocking() {
  if (FLAGS.useMsw) {
    const { worker } = await import('./shared/msw/index.js');
    await worker.start({ onUnhandledRequest: 'bypass' });
  }
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});
