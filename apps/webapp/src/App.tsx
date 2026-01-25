import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './app/router';
import { ToastProvider } from './shared/ui/index.js';

export function App() {
  return (
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  );
}
