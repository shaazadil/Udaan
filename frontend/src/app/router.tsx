import { createBrowserRouter, Navigate } from 'react-router-dom';

import { PublicLayout } from '../layouts/PublicLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';

import { LandingPage } from '../features/landing/LandingPage';
import { LoginPage } from '../features/auth/LoginPage';
import { RegisterPage } from '../features/auth/RegisterPage';

import { DashboardPage } from '../features/dashboard/DashboardPage';
import { CareerPage } from '../features/career/CareerPage';
import { SkillsPage } from '../features/skills/SkillsPage';
import { InterviewPage } from '../features/interview/InterviewPage';
import { KnowledgePage } from '../features/knowledge/KnowledgePage';
import { CareerProfilePage } from '../features/profile/CareerProfilePage';
import { HistoryPage } from '../features/history/HistoryPage';
import { SettingsPage } from '../features/profile/SettingsPage';

export const router = createBrowserRouter([
  // Public Marketing Website
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
    ],
  },

  // Dedicated Authentication Pages
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },

  // Authenticated Career Intelligence Workspace
  {
    element: <DashboardLayout />,
    children: [
      {
        path: '/dashboard',
        element: <DashboardPage />,
      },
      {
        path: '/career',
        element: <CareerPage />,
      },
      {
        path: '/skills',
        element: <SkillsPage />,
      },
      {
        path: '/interviews',
        element: <InterviewPage />,
      },
      {
        path: '/interview',
        element: <Navigate to="/interviews" replace />,
      },
      {
        path: '/knowledge',
        element: <KnowledgePage />,
      },
      {
        path: '/profile',
        element: <CareerProfilePage />,
      },
      {
        path: '/history',
        element: <HistoryPage />,
      },
      {
        path: '/settings',
        element: <SettingsPage />,
      },
    ],
  },

  // Fallback
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
