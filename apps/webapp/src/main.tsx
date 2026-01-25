import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App.js';
import './shared/ui/theme/tokens.css';
import './shared/ui/theme/global.css';

// Start MSW in DEV only if VITE_USE_MSW=true
async function enableMocking() {
  if (import.meta.env.DEV && import.meta.env.VITE_USE_MSW === 'true') {
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
