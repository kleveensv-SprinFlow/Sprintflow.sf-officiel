import React from 'react';
import { AthletePlanning } from '../components/planning/AthletePlanning';
import useAuth from '../hooks/useAuth';

const PlanningPage: React.FC = () => {
  const { profile } = useAuth();

  return <AthletePlanning />;
};

export default PlanningPage;
