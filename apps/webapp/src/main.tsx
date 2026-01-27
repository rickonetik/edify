import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App.js';
import './shared/ui/theme/tokens.css';
import './shared/ui/theme/global.css';
import { startMocking } from './shared/mocks/startMocking.js';
import { bootstrapAuth } from './shared/auth/bootstrapAuth.js';
import { getAccessToken, clearAccessToken } from './shared/auth/tokenStorage.js';
// Import probe for dev-only API testing
import './shared/api/probe.js';

/**
 * Bootstrap application with mocking setup and authentication
 */
async function bootstrap() {
  // Start mocking (never throws, always returns valid mode)
  await startMocking();

  // Bootstrap authentication (never throws, never blocks)
  await bootstrapAuth().catch((error) => {
    // Silently handle bootstrap auth errors - don't block app startup
    console.warn('Bootstrap auth failed (non-blocking):', error);
  });

  // Dev-only diagnostic (for manual testing)
  if (import.meta.env.DEV) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__trackedAuth = {
      getAccessToken,
      clearAccessToken,
    };
  }

  // Render app
  const root = document.getElementById('root');
  if (!root) {
    throw new Error('Root element not found');
  }

  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

// Start app
bootstrap().catch((error) => {
  console.error('Failed to bootstrap application:', error);
  // Still try to render app even if bootstrap failed
  const root = document.getElementById('root');
  if (root) {
    ReactDOM.createRoot(root).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
  }
});
