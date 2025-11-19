import React from 'react';
import useAuth from '../hooks/useAuth';
import { CoachDashboard } from './dashboard/CoachDashboard';
import AthleteDashboard from './dashboard/AthleteDashboard';
import LoadingScreen from './LoadingScreen';

const Dashboard: React.FC = () => {
  const { profile, loading } = useAuth();

  if (loading || !profile) {
    return <LoadingScreen />;
  }

  if (profile.role === 'coach') {
    return <CoachDashboard />;
  }

  return <AthleteDashboard />;
};

export default Dashboard;
