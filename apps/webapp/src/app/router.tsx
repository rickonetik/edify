import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from './layout/AppShell.js';
import { LibraryPage } from '../pages/LibraryPage.js';
import { LearnPage } from '../pages/LearnPage.js';
import { AccountPage } from '../pages/AccountPage.js';
import { CourseDetailPage } from '../pages/CourseDetailPage.js';
import { LessonPage } from '../pages/LessonPage.js';
import { UpdatePage } from '../pages/UpdatePage.js';
import { SettingsPage } from '../pages/SettingsPage.js';
import { CreatorOnboardingPage } from '../pages/CreatorOnboardingPage.js';
import { NotFoundPage } from '../pages/NotFoundPage.js';
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
      { path: 'lesson/:lessonId', element: <LessonPage /> },
      { path: 'update/:id', element: <UpdatePage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'creator/onboarding', element: <CreatorOnboardingPage /> },
      { path: 'ui-preview', element: <UiPreviewPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
