import React from 'react';
import { AthletePlanning } from '../components/planning/AthletePlanning';
import { CoachPlanning } from '../components/planning/CoachPlanning';
import useAuth from '../hooks/useAuth';

const PlanningPage: React.FC = () => {
  const { profile } = useAuth();

  if (profile?.role === 'coach') {
    return <CoachPlanning />;
  }

  return <AthletePlanning />;
};

export default PlanningPage;
