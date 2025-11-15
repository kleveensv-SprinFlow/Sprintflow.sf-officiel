import React from 'react';
import { useNavigate } from 'react-router-dom';
import Dashboard from '../components/Dashboard';
import useAuth from '../hooks/useAuth';

const DashboardPage: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const handleViewChange = (view: string) => {
    navigate(`/${view}`);
  };

  return <Dashboard userRole={profile?.role} onViewChange={handleViewChange} />;
};

export default DashboardPage;
