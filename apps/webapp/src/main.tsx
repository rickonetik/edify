import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App.js';
import './shared/ui/theme/tokens.css';
import './shared/ui/theme/global.css';
import { startMocking } from './shared/mocks/startMocking.js';
// Import probe for dev-only API testing
import './shared/api/probe.js';

/**
 * Bootstrap application with mocking setup
 */
async function bootstrap() {
  // Start mocking (never throws, always returns valid mode)
  await startMocking();

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
  // Still try to render app even if mocking failed
  const root = document.getElementById('root');
  if (root) {
    ReactDOM.createRoot(root).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
  }
});
