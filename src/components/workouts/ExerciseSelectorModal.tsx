import React, { useState, useMemo } from 'react';
import { X, Search, Dumbbell, User } from 'lucide-react';
import { useExercices } from '../../hooks/useExercices';
import { motion, AnimatePresence } from 'framer-motion';

interface ExerciseSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (exercise: { id: string; name: string; type: 'reference' | 'custom' }) => void;
}

// Mapping des catégories pour l'affichage
const CATEGORIES = [
  { id: 'all', label: 'Tout' },
  { id: 'muscu_haut', label: 'Haut du corps' },
  { id: 'muscu_bas', label: 'Bas du corps' },
  { id: 'halterophilie', label: 'Haltéro' },
  { id: 'gainage', label: 'Gainage' },
  { id: 'pliometrie', label: 'Pliométrie' },
  { id: 'cardio', label: 'Cardio' },
];

export const ExerciseSelectorModal: React.FC<ExerciseSelectorModalProps> = ({ isOpen, onClose, onSelect }) => {
  const { exercices, loading } = useExercices();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');

  const filtered = useMemo(() => {
    return exercices.filter(ex => {
      const matchSearch = ex.nom.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = selectedCat === 'all' || ex.categorie === selectedCat;
      return matchSearch && matchCat;
    });
  }, [exercices, searchTerm, selectedCat]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center sm:p-4">
           {/* Backdrop */}
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             onClick={onClose}
             className="absolute inset-0 bg-black/60 backdrop-blur-sm"
           />

           {/* Modal */}
           <motion.div
             initial={{ y: '100%' }}
             animate={{ y: 0 }}
             exit={{ y: '100%' }}
             transition={{ type: "spring", damping: 25, stiffness: 300 }}
             className="bg-white dark:bg-gray-900 w-full max-w-lg sm:rounded-2xl rounded-t-2xl h-[85vh] sm:h-[600px] flex flex-col shadow-2xl overflow-hidden z-10"
           >
            {/* HEADER */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 z-10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Choisir un exercice</h3>
                <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Rechercher (ex: Squat)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl border-none outline-none focus:ring-2 focus:ring-sprint-primary/50 font-medium"
                  autoFocus
                />
              </div>

              {/* Categories (Pills) */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCat(cat.id)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                      selectedCat === cat.id
                        ? 'bg-black text-white dark:bg-white dark:text-black shadow-md'
                        : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* LIST */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {loading ? (
                <div className="text-center py-10 text-gray-400">Chargement...</div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-10 text-gray-400">Aucun exercice trouvé.</div>
              ) : (
                filtered.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => onSelect({ id: ex.id, name: ex.nom, type: ex.type })}
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-colors text-left group"
                  >
                    {/* Icone Distinctive */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      ex.type === 'custom'
                        ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                        : 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      {ex.type === 'custom' ? <User size={18} /> : <Dumbbell size={18} />}
                    </div>

                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm group-hover:text-sprint-primary transition-colors">
                        {ex.nom}
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-500 uppercase tracking-wide">
                          {CATEGORIES.find(c => c.id === ex.categorie)?.label || ex.categorie}
                        </span>
                        {ex.type === 'custom' && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-bold">
                            PERSO
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
           </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ExerciseSelectorModal;
