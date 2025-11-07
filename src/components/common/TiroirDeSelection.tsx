import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, PlusCircle } from 'lucide-react';
import { ExerciceReference, useExercices } from '../../hooks/useExercices';
import { EXERCISE_CATEGORIES } from '../../data/categories';
import { CustomExerciceForm } from '../records/CustomExerciceForm';
import useAuth from '../../hooks/useAuth';

interface TiroirDeSelectionProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExercice: (exercice: ExerciceReference) => void;
  exercices: ExerciceReference[]; // Gardé pour la prop, mais on utilisera celui du hook interne
  title: string;
}

export const TiroirDeSelection: React.FC<TiroirDeSelectionProps> = ({ isOpen, onClose, onSelectExercice, title }) => {
  const { profile } = useAuth();
  const { exercices, loadExercices } = useExercices(); // On utilise le hook ici
  const [selectedCategory, setSelectedCategory] = useState<string | null>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCustomFormOpen, setIsCustomFormOpen] = useState(false);

  const myExercices = useMemo(() => 
    exercices.filter(ex => ex.type === 'custom' && ex.coach_id === profile?.id)
  , [exercices, profile]);

  const categories = useMemo(() => {
    const cats = [...EXERCISE_CATEGORIES];
    if (myExercices.length > 0) {
      cats.unshift({ key: 'custom', label: 'Mes exercices', emoji: '⭐' });
    }
    cats.unshift({ key: 'all', label: 'Tout', emoji: '🗂️' });
    return cats;
  }, [myExercices]);

  const filteredExercices = useMemo(() => {
    let list = exercices;

    if (selectedCategory === 'custom') {
      list = myExercices;
    } else if (selectedCategory && selectedCategory !== 'all') {
      // Afficher les exercices custom dans leur catégorie d'origine aussi
      list = exercices.filter(ex => 
        ex.categorie === selectedCategory || 
        (ex.type === 'custom' && ex.categorie === selectedCategory)
      );
    }

    if (searchTerm) {
      list = list.filter(ex => ex.nom.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    // Deduplicate and sort
    const uniqueList = Array.from(new Map(list.map(item => [item.id, item])).values());
    return uniqueList.sort((a, b) => a.nom.localeCompare(b.nom));

  }, [exercices, selectedCategory, searchTerm, myExercices]);
  
  // Reset search and category when opening
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSelectedCategory('all');
    }
  }, [isOpen]);

  const handleSaveCustom = () => {
    loadExercices(); // On rafraîchit la liste
    setIsCustomFormOpen(false);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50"
            onClick={onClose}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute bottom-0 left-0 right-0 h-[90vh] bg-white dark:bg-gray-800 rounded-t-2xl flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <header className="p-4 border-b dark:border-gray-700 flex items-center justify-between flex-shrink-0">
                <h3 className="text-lg font-bold">{title}</h3>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                  <X size={20} />
                </button>
              </header>

              <div className="p-4 flex-shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Rechercher un exercice..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-100 dark:bg-gray-700 border-transparent rounded-lg pl-10 pr-4 py-2"
                  />
                </div>
              </div>

              <div className="flex-shrink-0">
                <div className="flex gap-2 p-4 pt-0 overflow-x-auto no-scrollbar">
                  {categories.map(cat => (
                    <button
                      key={cat.key}
                      onClick={() => setSelectedCategory(cat.key)}
                      className={`px-4 py-2 text-sm font-semibold rounded-full whitespace-nowrap transition-colors ${
                        selectedCategory === cat.key
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      {cat.emoji} {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-grow overflow-y-auto px-4">
                {filteredExercices.map(exercice => (
                  <div
                    key={exercice.id}
                    onClick={() => onSelectExercice(exercice)}
                    className="p-4 border-b dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {exercice.nom}
                  </div>
                ))}
              </div>

              {profile?.role === 'coach' && (
                <footer className="p-4 border-t dark:border-gray-700 flex-shrink-0">
                  <button
                    onClick={() => setIsCustomFormOpen(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 text-white rounded-lg font-semibold"
                  >
                    <PlusCircle size={20} />
                    Créer un exercice
                  </button>
                </footer>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
          {isCustomFormOpen && (
              <CustomExerciceForm 
                  onSave={handleSaveCustom}
                  onCancel={() => setIsCustomFormOpen(false)}
              />
          )}
      </AnimatePresence>
    </>
  );
};
