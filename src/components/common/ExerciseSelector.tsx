import React, { useState, useMemo } from 'react';
import { Search, Plus, Check } from 'lucide-react';
import { useExercices, ExerciceReference } from '../../hooks/useExercices';
import { motion, AnimatePresence } from 'framer-motion';

interface ExerciseSelectorProps {
  onSelect?: (exercise: ExerciceReference) => void;
  selectedId?: string;
}

export function ExerciseSelector({ onSelect, selectedId }: ExerciseSelectorProps) {
  const { exercices, loading, addCustomExercise } = useExercices();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tout');

  // State for adding new exercise
  const [isAdding, setIsAdding] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseCategory, setNewExerciseCategory] = useState('');

  // Extract unique categories
  const categories = useMemo(() => {
    const uniqueCats = Array.from(new Set(exercices.map(e => e.categorie))).sort();
    return ['Tout', ...uniqueCats];
  }, [exercices]);

  // Filter exercises
  const filteredExercises = useMemo(() => {
    return exercices.filter(ex => {
      const matchesSearch = ex.nom.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'Tout' || ex.categorie === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [exercices, searchTerm, selectedCategory]);

  const handleAddExercise = async () => {
    if (!newExerciseName.trim() || !newExerciseCategory.trim()) return;
    try {
      await addCustomExercise(newExerciseName, newExerciseCategory);
      setIsAdding(false);
      setNewExerciseName('');
      setNewExerciseCategory('');
      // Optionally auto-select the new exercise if needed, but for now just close
    } catch (e) {
      console.error("Failed to add exercise", e);
    }
  };

  if (loading) return <div className="p-4 text-center text-gray-400">Chargement...</div>;

  return (
    <div className="flex flex-col h-full max-h-[60vh] md:max-h-full bg-white dark:bg-gray-900 rounded-xl overflow-hidden">

      {/* Creation Mode */}
      <AnimatePresence>
        {isAdding ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="p-4 space-y-4 bg-gray-50 dark:bg-gray-800 rounded-xl m-2"
          >
            <h3 className="font-semibold text-gray-900 dark:text-white">Créer un exercice</h3>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Nom</label>
              <input
                type="text"
                value={newExerciseName}
                onChange={(e) => setNewExerciseName(e.target.value)}
                className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl"
                placeholder="Ex: Squat Bulgare"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Catégorie</label>
              <div className="flex flex-wrap gap-2">
                 {categories.filter(c => c !== 'Tout').slice(0, 6).map(cat => (
                   <button
                     key={cat}
                     onClick={() => setNewExerciseCategory(cat)}
                     className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                       newExerciseCategory === cat
                         ? 'bg-blue-500 text-white border-blue-500'
                         : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600'
                     }`}
                   >
                     {cat}
                   </button>
                 ))}
                 <input
                    type="text"
                    placeholder="Autre..."
                    value={newExerciseCategory}
                    onChange={(e) => setNewExerciseCategory(e.target.value)}
                    className="px-3 py-1 text-xs rounded-full bg-transparent border-b border-gray-300 dark:border-gray-600 outline-none w-24"
                 />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsAdding(false)}
                className="flex-1 py-2 text-gray-500 bg-gray-200 dark:bg-gray-700 rounded-xl font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleAddExercise}
                className="flex-1 py-2 text-white bg-blue-600 rounded-xl font-medium"
              >
                Créer
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-4 p-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher un exercice..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 border-none shadow-sm text-sm"
              />
            </div>

            {/* Category Pills */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex-shrink-0 px-4 py-1.5 text-xs font-medium rounded-full transition-colors ${
                    selectedCategory === cat
                      ? 'bg-black dark:bg-white text-white dark:text-black'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredExercises.length === 0 && !isAdding ? (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm mb-4">Aucun exercice trouvé</p>
            <button
              onClick={() => {
                setIsAdding(true);
                setNewExerciseName(searchTerm);
              }}
              className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium"
            >
              Créer "{searchTerm || 'nouvel exercice'}"
            </button>
          </div>
        ) : (
          filteredExercises.map(ex => (
            <button
              key={ex.id}
              onClick={() => onSelect && onSelect(ex)}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors text-left group ${
                selectedId === ex.id
                  ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent'
              }`}
            >
              <div>
                <div className={`font-medium text-sm ${selectedId === ex.id ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-white'}`}>
                  {ex.nom}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {ex.categorie} • {ex.type === 'custom' ? 'Personnalisé' : 'Référence'}
                </div>
              </div>
              {selectedId === ex.id && (
                <Check size={16} className="text-blue-600 dark:text-blue-400" />
              )}
            </button>
          ))
        )}

        {/* Floating Add Button if list is long and not adding */}
        {!isAdding && filteredExercises.length > 0 && (
           <div className="pt-4 flex justify-center pb-8">
              <button
                onClick={() => setIsAdding(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <Plus size={14} />
                Créer un autre exercice
              </button>
           </div>
        )}
      </div>
    </div>
  );
}
