import React from 'react';
import { ChevronDown, Users, User } from 'lucide-react';
import { motion } from 'framer-motion';

type Selection = {
  type: 'athlete' | 'group';
  id: string;
  name: string;
  color?: string;
} | null;

interface SelectionHeaderProps {
  selection: Selection;
  onSelectAthlete: () => void;
  onSelectGroup: () => void;
}

const SelectionHeader: React.FC<SelectionHeaderProps> = ({ selection, onSelectAthlete, onSelectGroup }) => {
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-md mb-6">
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Vue actuelle</p>
      <div className="flex items-center justify-between">
        {selection ? (
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selection.type === 'group' ? 'bg-blue-200 text-blue-800' : 'bg-green-200 text-green-800'}`}>
              {selection.type === 'group' ? <Users size={16} /> : <User size={16} />}
            </div>
            <span className="font-bold text-lg text-gray-900 dark:text-white">{selection.name}</span>
          </div>
        ) : (
          <span className="font-semibold text-lg text-gray-500 dark:text-gray-400">Aucune sélection</span>
        )}
        <div className="flex gap-2">
            <motion.button 
                onClick={onSelectAthlete}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
            >
                <User size={16} /> Athlète
            </motion.button>
            <motion.button 
                onClick={onSelectGroup}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
            >
                <Users size={16} /> Groupe
            </motion.button>
        </div>
      </div>
    </div>
  );
};

export default SelectionHeader;
