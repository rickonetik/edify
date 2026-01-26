import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App.js';
import './shared/ui/theme/tokens.css';
import './shared/ui/theme/global.css';

import { FLAGS } from './shared/config/flags.js';

// Check if Service Worker is supported
function isServiceWorkerSupported(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    'serviceWorker' in navigator &&
    typeof window !== 'undefined' &&
    'caches' in window
  );
}

// Track MSW initialization state with callbacks
type MswStateCallback = (ready: boolean, failed: boolean) => void;
const mswStateCallbacks: MswStateCallback[] = [];

let mswReady = false;
let mswFailed = false;

// Subscribe to MSW state changes
(window as any).__MSW_SUBSCRIBE__ = (callback: MswStateCallback) => {
  mswStateCallbacks.push(callback);
  // Immediately call with current state
  callback(mswReady, mswFailed);
  // Return unsubscribe function
  return () => {
    const index = mswStateCallbacks.indexOf(callback);
    if (index > -1) {
      mswStateCallbacks.splice(index, 1);
    }
  };
};

function notifyMswState(ready: boolean, failed: boolean) {
  mswReady = ready;
  mswFailed = failed;
  mswStateCallbacks.forEach((cb) => cb(ready, failed));
}

// Make MSW state available globally (for backwards compatibility)
(window as any).__MSW_READY__ = () => mswReady;
(window as any).__MSW_FAILED__ = () => mswFailed;

// Start MSW if FLAGS.useMsw is true (respects realApi override)
async function enableMocking() {
  if (!FLAGS.useMsw) {
    notifyMswState(true, false); // No MSW needed, mark as ready
    return;
  }

  // Check if Service Worker is supported
  if (!isServiceWorkerSupported()) {
    console.warn('[MSW] ⚠️  Service Worker not supported in this browser context');
    console.warn('[MSW] 💡 Disabling MSW - queries will be disabled unless real API is available');
    notifyMswState(false, true);
    return;
  }

  try {
    const { worker } = await import('./shared/msw/index.js');

    // Add timeout for MSW startup (2 seconds - shorter for faster failure detection)
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('MSW startup timeout')), 2000);
    });

    await Promise.race([
      worker.start({
        onUnhandledRequest: 'bypass',
        serviceWorker: {
          url: '/mockServiceWorker.js',
        },
      }),
      timeoutPromise,
    ]);

    notifyMswState(true, false);
    console.log('[MSW] ✅ Mock Service Worker started successfully');
  } catch (error) {
    notifyMswState(false, true);
    console.error('[MSW] ❌ Failed to start Mock Service Worker:', error);
    console.warn('[MSW] ⚠️  Disabling queries to prevent hanging requests');
    console.warn(
      '[MSW] 💡 Tip: Service Workers may not work in some browser contexts (e.g., Cursor built-in browser)',
    );
  }
}

// Also set a fallback timeout: if MSW doesn't start within 3 seconds total, mark as failed
if (FLAGS.useMsw) {
  setTimeout(() => {
    if (!mswReady && !mswFailed) {
      notifyMswState(false, true);
      console.warn('[MSW] ⏱️  Startup timeout - marking as failed');
    }
  }, 3000);
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});
