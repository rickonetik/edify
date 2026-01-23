import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LibraryPage } from '../pages/LibraryPage';
import { LearnPage } from '../pages/LearnPage';
import { AccountPage } from '../pages/AccountPage';

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/learn" replace /> },
  { path: '/library', element: <LibraryPage /> },
  { path: '/learn', element: <LearnPage /> },
  { path: '/account', element: <AccountPage /> },
]);
