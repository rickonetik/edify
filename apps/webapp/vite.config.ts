import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, host: true },
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
});
