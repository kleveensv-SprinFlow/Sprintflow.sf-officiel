import React from 'react';
import { CoachDashboard } from './dashboard/CoachDashboard';
import AthleteDashboard from './dashboard/AthleteDashboard';

interface DashboardProps {
  userRole: 'athlete' | 'coach' | undefined;
  onViewChange: (view: any) => void;
  isLoading: boolean;
}

const DashboardSkeleton: React.FC = () => (
  <div className="p-4 space-y-4">
    <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
    <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
    <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ userRole, isLoading }) => {
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (userRole === 'coach') {
    return <CoachDashboard />;
  }

  return <AthleteDashboard />;
};

export default Dashboard;
