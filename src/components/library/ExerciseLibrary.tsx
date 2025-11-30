import React, { useState } from 'react';
import { ChevronLeft, Plus, Search, Trash2, Dumbbell } from 'lucide-react';
import { useExercices } from '../../hooks/useExercices';
import { EXERCISE_CATEGORIES } from '../../data/categories';
import { toast } from 'react-toastify';

interface ExerciseLibraryProps {
  onBack: () => void;
}

const ExerciseLibrary: React.FC<ExerciseLibraryProps> = ({ onBack }) => {
  const { exercices, loading, createCustomExercise, deleteCustomExercise } = useExercices();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseCategory, setNewExerciseCategory] = useState(EXERCISE_CATEGORIES[0].key);

  const filteredExercises = exercices.filter((ex) => {
    const matchesSearch = ex.nom.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? ex.categorie === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExerciseName.trim()) return;

    setIsSubmitting(true);
    try {
      await createCustomExercise(newExerciseName, newExerciseCategory);
      toast.success("Exercice créé avec succès");
      setIsModalOpen(false);
      setNewExerciseName('');
      setNewExerciseCategory(EXERCISE_CATEGORIES[0].key);
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la création de l'exercice");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet exercice ?")) {
      try {
        await deleteCustomExercise(id);
        toast.success("Exercice supprimé");
      } catch (error) {
        console.error(error);
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-md border-b border-white/10 px-4 py-4 flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 rounded-full hover:bg-white/5 active:bg-white/10 transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-xl font-bold text-white flex-1">Bibliothèque</h1>
      </div>

      <div className="p-4 space-y-6 max-w-3xl mx-auto pb-24">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un exercice..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === null
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            Tous
          </button>
          {EXERCISE_CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                selectedCategory === cat.key
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="space-y-2">
          {loading ? (
            <div className="text-center py-12 text-slate-400">Chargement...</div>
          ) : filteredExercises.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              Aucun exercice trouvé
            </div>
          ) : (
            filteredExercises.map((ex) => (
              <div
                key={ex.id}
                className="bg-slate-800/50 border border-white/5 rounded-xl p-4 flex items-center gap-4 hover:border-white/10 transition-colors group"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  ex.type === 'custom'
                    ? 'bg-purple-500/10 text-purple-500'
                    : 'bg-blue-500/10 text-blue-500'
                }`}>
                  <Dumbbell className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-medium truncate">{ex.nom}</h3>
                    {ex.type === 'custom' && (
                      <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 text-[10px] font-bold uppercase tracking-wider border border-purple-500/20">
                        Perso
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400">
                    {EXERCISE_CATEGORIES.find(c => c.key === ex.categorie)?.label || ex.categorie}
                  </p>
                </div>

                {ex.type === 'custom' && (
                  <button
                    onClick={(e) => handleDelete(ex.id, e)}
                    className="p-2 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Supprimer"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-600/30 text-white hover:bg-blue-500 hover:scale-105 transition-all z-20"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-white mb-6">Nouvel Exercice</h2>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Nom de l'exercice</label>
                <input
                  type="text"
                  required
                  value={newExerciseName}
                  onChange={(e) => setNewExerciseName(e.target.value)}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="Ex: Développé Couché"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Catégorie</label>
                <select
                  value={newExerciseCategory}
                  onChange={(e) => setNewExerciseCategory(e.target.value)}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
                >
                  {EXERCISE_CATEGORIES.map((cat) => (
                    <option key={cat.key} value={cat.key}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-800 text-white font-medium hover:bg-slate-700 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Création...' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseLibrary;
