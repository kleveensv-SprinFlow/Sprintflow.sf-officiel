import React, { useState, useMemo } from 'react';
import { X, Save, Dumbbell, Navigation } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import WorkoutTypeSelector from './WorkoutTypeSelector';
import AddCustomWorkoutTypeModal from './AddCustomWorkoutTypeModal';
import { WorkoutBlock, CourseBlock, MuscuBlock } from '../../types/workout';
import { CourseBlockForm } from './CourseBlockForm';
import { MuscuBlockForm } from './MuscuBlockForm';
import { WorkoutBuilder } from './WorkoutBuilder';

interface NewWorkoutFormProps {
  onSave: (payload: {
    tag_seance: string;
    blocs: WorkoutBlock[];
    type: 'guidé' | 'manuscrit';
    notes?: string;
  }) => Promise<void>;
  onCancel: () => void;
  initialData?: {
    id?: string;
    tag_seance: string;
    blocs: WorkoutBlock[];
    type?: 'guidé' | 'manuscrit';
    notes?: string;
  };
}

export function NewWorkoutForm({ onSave, onCancel, initialData }: NewWorkoutFormProps) {
  const [tagSeance, setTagSeance] = useState<string | null>(initialData?.tag_seance || null);
  const [blocks, setBlocks] = useState<WorkoutBlock[]>(initialData?.blocs || []);
  const [workoutType, setWorkoutType] = useState<'guidé' | 'manuscrit'>(initialData?.type || 'guidé');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [saving, setSaving] = useState(false);
  const [isCustomModalOpen, setCustomModalOpen] = useState(false);
  
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [addingBlockType, setAddingBlockType] = useState<'course' | 'musculation' | null>(null);

  const handleUpsertBlock = (blockData: Omit<WorkoutBlock, 'id'> | WorkoutBlock) => {
    if ('id' in blockData && blockData.id) {
      // Modification
      setBlocks(prev => prev.map(b => (b.id === blockData.id ? { ...b, ...blockData } : b)));
    } else {
      // Ajout
      const newBlockWithId: WorkoutBlock = {
        ...blockData,
        id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };
      setBlocks(prev => [...prev, newBlockWithId]);
    }
    setAddingBlockType(null);
    setEditingBlockId(null);
  };

  const handleEditBlock = (id: string) => {
    const blockToEdit = blocks.find(b => b.id === id);
    if (blockToEdit) {
      setEditingBlockId(id);
      setAddingBlockType(blockToEdit.type);
    }
  };

  const handleCancelForm = () => {
    setAddingBlockType(null);
    setEditingBlockId(null);
  };

  const handleRemoveBlock = (id: string) => {
    setBlocks(prev => prev.filter(block => block.id !== id));
  };
  
  const handleUpdateBlocks = (newBlocks: WorkoutBlock[]) => {
    setBlocks(newBlocks);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tagSeance) {
      alert('Veuillez sélectionner un type de séance.');
      return;
    }

    if (workoutType === 'guidé' && blocks.length === 0) {
      alert('Veuillez ajouter au moins un bloc pour une séance guidée');
      return;
    }

    if (workoutType === 'manuscrit' && !notes.trim()) {
      alert('Veuillez ajouter des notes pour une séance manuscrite');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        tag_seance: tagSeance,
        type: workoutType,
        notes,
        blocs: blocks,
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde de la séance');
    } finally {
      setSaving(false);
    }
  };
  
  const isFormActive = !!addingBlockType || !!editingBlockId;

  const editingBlockData = useMemo(() => {
    if (!editingBlockId) return undefined;
    return blocks.find(b => b.id === editingBlockId);
  }, [editingBlockId, blocks]);

  const renderContent = () => {
    return (
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <WorkoutTypeSelector
            selectedType={tagSeance}
            onSelectType={setTagSeance}
            onOpenCustomModal={() => setCustomModalOpen(true)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Méthode de création
          </label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setWorkoutType('guidé')}
              className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${
                workoutType === 'guidé'
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Guidée (blocs)
            </button>
            <button
              type="button"
              onClick={() => setWorkoutType('manuscrit')}
              className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${
                workoutType === 'manuscrit'
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Manuscrite (texte libre)
            </button>
          </div>
        </div>

        {workoutType === 'guidé' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Contenu de la séance *
            </label>

            {!isFormActive && (
              <div className="flex gap-2 mb-4">
                <button type="button" onClick={() => setAddingBlockType('course')} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-md transition-all duration-200 active:scale-95">
                  <Navigation className="w-5 h-5" />
                  <span>Ajouter Bloc Course</span>
                </button>
                <button type="button" onClick={() => setAddingBlockType('musculation')} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow-md transition-all duration-200 active:scale-95">
                  <Dumbbell className="w-5 h-5" />
                  <span>Ajouter Bloc Muscu</span>
                </button>
              </div>
            )}
            
            {(addingBlockType === 'course' || (editingBlockId && editingBlockData?.type === 'course')) && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border-2 border-blue-500">
                <CourseBlockForm
                  onAddBlock={handleUpsertBlock}
                  onCancel={handleCancelForm}
                  initialData={editingBlockData as CourseBlock}
                />
              </div>
            )}

            {(addingBlockType === 'musculation' || (editingBlockId && editingBlockData?.type === 'musculation')) && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border-2 border-green-500">
                <MuscuBlockForm
                  onAddBlock={handleUpsertBlock}
                  onCancel={handleCancelForm}
                  initialData={editingBlockData as MuscuBlock}
                />
              </div>
            )}

            <WorkoutBuilder
              blocks={blocks}
              onChange={handleUpdateBlocks}
              onRemoveBlock={handleRemoveBlock}
              onEditBlock={handleEditBlock}
              isAddingOrEditing={isFormActive}
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes / Description *
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={10}
              className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Décrivez la séance en texte libre..."
              required
            />
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-xl text-white font-medium transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/30 active:scale-95"
          >
            <Save className="h-5 w-5" />
            <span>{saving ? 'Enregistrement...' : initialData?.id ? 'Mettre à jour' : 'Enregistrer'}</span>
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl text-gray-700 dark:text-gray-300 font-medium transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Annuler
          </button>
        </div>
      </form>
    );
  };
  
  return (
    <>
      <AnimatePresence>
        {isCustomModalOpen && (
          <AddCustomWorkoutTypeModal
            onClose={() => setCustomModalOpen(false)}
            onSuccess={(newType) => setTagSeance(newType.id)}
          />
        )}
      </AnimatePresence>

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {initialData?.id ? 'Modifier la séance' : 'Nouvelle séance'}
            </h2>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          {renderContent()}
        </div>
      </div>
    </>
  );
}