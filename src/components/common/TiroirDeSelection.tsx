import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search } from 'lucide-react';
import { EXERCISE_CATEGORIES } from '../../data/categories';
import { ExerciceReference } from '../../hooks/useExercices';

interface TiroirDeSelectionProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExercice: (exercice: ExerciceReference) => void;
  exercices: ExerciceReference[];
  title: string;
}

export const TiroirDeSelection: React.FC<TiroirDeSelectionProps> = ({
  isOpen,
  onClose,
  onSelectExercice,
  exercices,
  title,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSelectCategory = (categoryKey: string) => {
    setSelectedCategory(prev => (prev === categoryKey ? null : categoryKey));
    setSearchQuery(''); 
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setSelectedCategory(null);
  };

  const filteredExercices = useMemo(() => {
    if (searchQuery) {
      const normalizedQuery = searchQuery.toLowerCase().trim();
      return exercices.filter(ex => 
        ex.nom.toLowerCase().includes(normalizedQuery) || 
        ex.nom_alternatif?.some(alt => alt.toLowerCase().includes(normalizedQuery))
      );
    }
    if (selectedCategory) {
      return exercices.filter(ex => ex.categorie === selectedCategory);
    }
    return exercices;
  }, [searchQuery, selectedCategory, exercices]);

  const handleSelectExercice = (exercice: ExerciceReference) => {
    onSelectExercice(exercice);
    onClose();
  };
  
  // Reset state when closing
  React.useEffect(() => {
    if (!isOpen) {
      setSelectedCategory(null);
      setSearchQuery('');
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.3 } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-40"
            style={{ transform: 'translateZ(0)' }} // Promote to its own layer
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: '0%' }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 h-[90vh] bg-gray-900 rounded-t-2xl z-50 flex flex-col shadow-2xl"
          >
            <header className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
              <h2 className="text-xl font-bold text-white">{title}</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </header>
            
            <div className="p-4 flex-shrink-0">
                <h3 className="text-sm font-semibold text-gray-400 mb-3">Catégories</h3>
                <div className="grid grid-cols-3 gap-3">
                    {EXERCISE_CATEGORIES.map(cat => (
                        <button
                            key={cat.key}
                            onClick={() => handleSelectCategory(cat.key)}
                            className={`p-3 rounded-lg text-center transition-colors duration-200 ${selectedCategory === cat.key ? 'bg-accent-500 text-white shadow-lg' : 'bg-gray-800 text-gray-200 hover:bg-gray-700'}`}
                        >
                            <span className="text-2xl">{cat.icon}</span>
                            <span className="block text-xs font-medium mt-1">{cat.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-4 flex-shrink-0">
                 <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Ou rechercher un exercice..."
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-4">
              <ul className="divide-y divide-gray-800">
                {filteredExercices.map(ex => (
                  <li 
                    key={ex.id} 
                    onClick={() => handleSelectExercice(ex)}
                    className="py-4 px-2 text-gray-300 hover:bg-gray-800 rounded-md cursor-pointer"
                  >
                    {ex.nom}
                  </li>
                ))}
              </ul>
              {filteredExercices.length === 0 && (
                <div className="text-center py-10">
                    <p className="text-gray-500">Aucun exercice trouvé.</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
