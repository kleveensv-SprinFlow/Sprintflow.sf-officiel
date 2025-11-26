import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface ManagePlanningPageProps {
  onBack: () => void;
}

const ManagePlanningPage: React.FC<ManagePlanningPageProps> = ({ onBack }) => {
  return (
    <div className="p-4">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-600 dark:text-gray-300 font-semibold mb-4">
        <ChevronLeft size={20} /> Retour
      </button>
      <h1 className="text-2xl font-bold mb-6">Gestion de Planning</h1>
      <p className="text-center text-gray-500">La vue de gestion de planning sera implémentée ici.</p>
    </div>
  );
};

export default ManagePlanningPage;
