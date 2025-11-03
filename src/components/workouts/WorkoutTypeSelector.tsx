import React from 'react';
import { motion } from 'framer-motion';
import { useWorkoutTypes } from '../../hooks/useWorkoutTypes';
import { PlusCircle } from 'lucide-react';

interface WorkoutTypeSelectorProps {
  selectedType: string | null;
  onSelectType: (type: string) => void;
  onOpenCustomModal: () => void;
}

const WorkoutTypeSelector: React.FC<WorkoutTypeSelectorProps> = ({
  selectedType,
  onSelectType,
  onOpenCustomModal,
}) => {
  const { allTypes, loading } = useWorkoutTypes();

  if (loading) {
    return <div>Chargement des types de séance...</div>;
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Type de séance
      </label>
      <div className="flex flex-wrap gap-2 items-center">
        {allTypes.map((type) => (
          <motion.button
            key={type.id}
            type="button"
            onClick={() => onSelectType(type.id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              selectedType === type.id
                ? 'text-white shadow-neumorphic-press'
                : 'bg-transparent text-gray-300 shadow-neumorphic-extrude'
            }`}
            style={{
              backgroundColor: selectedType === type.id ? type.color : 'transparent',
              borderColor: type.color,
              borderWidth: '1px',
            }}
            whileTap={{ scale: 0.95 }}
          >
            {type.name}
          </motion.button>
        ))}
        <motion.button
          type="button"
          onClick={onOpenCustomModal}
          className="p-2 rounded-full text-gray-400 hover:text-white transition-colors"
          whileTap={{ scale: 0.95 }}
          aria-label="Ajouter un type de séance personnalisé"
        >
          <PlusCircle size={24} />
        </motion.button>
      </div>
    </div>
  );
};

export default WorkoutTypeSelector;