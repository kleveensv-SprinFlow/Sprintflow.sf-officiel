import React from 'react';
import { ChevronLeft, Search } from 'lucide-react';

interface MyAthletes360PageProps {
  onBack: () => void;
}

const MyAthletes360Page: React.FC<MyAthletes360PageProps> = ({ onBack }) => {
  return (
    <div className="p-4">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-600 dark:text-gray-300 font-semibold mb-4">
        <ChevronLeft size={20} /> Retour
      </button>
      <h1 className="text-2xl font-bold mb-6">Mes Athlètes 360</h1>
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Rechercher un athlète..."
          className="w-full p-3 pl-10 rounded-lg bg-gray-100 dark:bg-gray-700 border border-transparent focus:ring-2 focus:ring-accent"
        />
        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      </div>
      <p className="text-center text-gray-500">Liste des athlètes à venir...</p>
    </div>
  );
};

export default MyAthletes360Page;
