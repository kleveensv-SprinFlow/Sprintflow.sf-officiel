import React from 'react';
import { motion } from 'framer-motion';
import { useWorkoutTypes } from '../../hooks/useWorkoutTypes';
import { PlusCircle } from 'lucide-react';

interface WorkoutTypeSelectorProps {
  selectedType: string | null;
  onSelectType: (type: string) => void;
  onOpenCustomModal: () => void;
  disabled?: boolean;
}

const WorkoutTypeSelector: React.FC<WorkoutTypeSelectorProps> = ({
  selectedType,
  onSelectType,
  onOpenCustomModal,
  disabled = false,
}) => {
  const { allTypes, loading } = useWorkoutTypes();

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 w-1/4 bg-gray-200 dark:bg-gray-700 rounded-md mb-2"></div>
        <div className="flex flex-wrap gap-2">
          <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="h-10 w-28 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="h-10 w-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Type de séance
      </label>
      <div className="flex flex-wrap gap-2 items-center">
        {allTypes.map((type) => (
          <motion.button
            key={type.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelectType(type.id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
              selectedType === type.id
                ? 'text-white shadow-neumorphic-press dark:shadow-neumorphic-press-dark'
                : 'bg-transparent text-gray-800 dark:text-gray-300 shadow-neumorphic-extrude dark:shadow-neumorphic-extrude-dark'
            }`}
            style={{
              backgroundColor: selectedType === type.id ? type.color : 'transparent',
              borderColor: type.color,
              borderWidth: '1px',
            }}
            whileTap={!disabled ? { scale: 0.95 } : {}}
          >
            {type.name}
          </motion.button>
        ))}
        {!disabled && (
          <motion.button
            type="button"
            onClick={onOpenCustomModal}
            className="p-2 rounded-full text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
            whileTap={{ scale: 0.95 }}
            aria-label="Ajouter un type de séance personnalisé"
          >
            <PlusCircle size={24} />
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default WorkoutTypeSelector;