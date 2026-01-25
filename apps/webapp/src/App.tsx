import { RouterProvider } from 'react-router-dom';
import { router } from './app/router';
import { QueryProvider } from './app/providers/QueryProvider.js';
import { ToastProvider } from './shared/ui/index.js';

export function App() {
  return (
    <QueryProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </QueryProvider>
  );
}
