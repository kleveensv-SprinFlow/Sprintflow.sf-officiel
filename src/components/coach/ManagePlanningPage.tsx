import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { CoachPlanning } from '../planning/CoachPlanning';

interface ManagePlanningPageProps {
  onBack: () => void;
}

const ManagePlanningPage: React.FC<ManagePlanningPageProps> = ({ onBack }) => {
  return (
    <div className="w-full min-h-screen bg-sprint-light-background dark:bg-sprint-dark-background">
      <div className="max-w-3xl mx-auto px-4 pt-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-300 font-semibold hover:text-sprint-primary transition-colors"
        >
          <ChevronLeft size={20} /> Retour
        </button>
      </div>
      <CoachPlanning />
    </div>
  );
};

export default ManagePlanningPage;
