import React from 'react';
import { ChevronLeft, Users, User } from 'lucide-react';

interface MyFollowUpsPageProps {
  onBack: () => void;
}

const MyFollowUpsPage: React.FC<MyFollowUpsPageProps> = ({ onBack }) => {
  return (
    <div className="p-4">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-600 dark:text-gray-300 font-semibold mb-4">
        <ChevronLeft size={20} /> Retour
      </button>
      <h1 className="text-2xl font-bold mb-6">Mes Suivis</h1>
      <div className="space-y-4">
        <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-md flex items-center justify-between">
          <h2 className="text-lg font-semibold">Gestion de groupe</h2>
          <button className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"><Users size={20} /></button>
        </div>
        <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-md flex items-center justify-between">
          <h2 className="text-lg font-semibold">Gestion athlète</h2>
          <button className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"><User size={20} /></button>
        </div>
      </div>
    </div>
  );
};

export default MyFollowUpsPage;
