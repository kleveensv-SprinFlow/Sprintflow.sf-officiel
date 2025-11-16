import { RouteObject } from 'react-router-dom';
import DashboardPage from '../pages/DashboardPage';
import ProfilePage from '../components/profile/ProfilePage';
import GroupsPage from '../pages/GroupsPage';
import WorkoutsPage from '../pages/WorkoutsPage';
import PlanningPage from '../pages/PlanningPage';
import NutritionPage from '../pages/NutritionPage';
import RecordsPage from '../components/records/RecordsPage';
import ChatPage from '../pages/ChatPage';
import SprintyChatView from '../components/chat/sprinty/SprintyChatView';
import AdvicePage from '../components/advice/AdvicePage';
import SleepPage from '../pages/SleepPage';
import SettingsPage from '../components/static/SettingsPage';
import ContactPage from '../components/static/ContactPage';
import PartnershipsPage from '../pages/PartnershipsPage';
import DeveloperPanelPage from '../pages/DeveloperPanelPage';
import NewWorkoutPage from '../pages/NewWorkoutPage';
import AddRecordPage from '../pages/AddRecordPage';
import AddFoodPage from '../pages/AddFoodPage';
import AddSleepPage from '../pages/AddSleepPage';
import SharePerformancePage from '../components/sharing/SharePerformancePage';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <DashboardPage />,
  },
  {
    path: '/profile',
    element: <ProfilePage />,
  },
  {
    path: '/groups',
    element: <GroupsPage />,
  },
  {
    path: '/workouts',
    element: <WorkoutsPage />,
  },
  {
    path: '/planning',
    element: <PlanningPage />,
  },
  {
    path: '/planning/new',
    element: <NewWorkoutPage />,
  },
  {
    path: '/nutrition',
    element: <NutritionPage />,
  },
  {
    path: '/nutrition/add',
    element: <AddFoodPage />,
  },
  {
    path: '/records',
    element: <RecordsPage />,
  },
  {
    path: '/records/new',
    element: <AddRecordPage />,
  },
  {
    path: '/chat',
    element: <ChatPage />,
  },
  {
    path: '/sprinty',
    element: <SprintyChatView />,
  },
  {
    path: '/advice',
    element: <AdvicePage />,
  },
  {
    path: '/sleep',
    element: <SleepPage />,
  },
  {
    path: '/sleep/add',
    element: <AddSleepPage />,
  },
  {
    path: '/share-performance',
    element: <SharePerformancePage />,
  },
  {
    path: '/settings',
    element: <SettingsPage />,
  },
  {
    path: '/contact',
    element: <ContactPage />,
  },
  {
    path: '/partnerships',
    element: <PartnershipsPage />,
  },
  {
    path: '/developer-panel',
    element: <DeveloperPanelPage />,
  },
];