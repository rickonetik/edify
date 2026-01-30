import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

const DEV_ALLOWED_HOSTS = ['.ngrok-free.dev', '.ngrok-free.app', '.ngrok-free.de'];

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    ...(mode === 'development' ? { allowedHosts: DEV_ALLOWED_HOSTS } : {}),
    // Proxy API to avoid mixed content (HTTPS page → HTTP API) when opening via ngrok
    proxy:
      mode === 'development'
        ? {
            '/auth': { target: 'http://localhost:3001', changeOrigin: true },
            '/me': { target: 'http://localhost:3001', changeOrigin: true },
            '/health': { target: 'http://localhost:3001', changeOrigin: true },
          }
        : undefined,
  },
  resolve: {
    alias: {
      // Use built dist in production, source in development
      // This respects package.json exports and prevents deep imports
      '@tracked/shared': resolve(__dirname, '../../packages/shared/dist/index.js'),
    },
  },
  optimizeDeps: {
    include: ['@tracked/shared'],
  },
  build: {
    commonjsOptions: {
      include: [/shared/, /node_modules/],
    },
  },
}));
