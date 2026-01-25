import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from './layout/AppShell.js';
import { LibraryPage } from '../pages/LibraryPage.js';
import { LearnPage } from '../pages/LearnPage.js';
import { AccountPage } from '../pages/AccountPage.js';
import { CourseDetailPage } from '../pages/CourseDetailPage.js';
import { UiPreviewPage } from '../pages/UiPreviewPage.js';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/learn" replace /> },
      { path: 'library', element: <LibraryPage /> },
      { path: 'learn', element: <LearnPage /> },
      { path: 'account', element: <AccountPage /> },
      { path: 'course/:id', element: <CourseDetailPage /> },
      { path: 'ui-preview', element: <UiPreviewPage /> },
    ],
  },
]);
