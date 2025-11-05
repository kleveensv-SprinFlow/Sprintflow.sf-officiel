import React, { useState, useMemo } from 'react';
import { X, Dumbbell, Navigation, MessageSquarePlus, Bookmark } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import WorkoutTypeSelector from './WorkoutTypeSelector';
import AddCustomWorkoutTypeModal from './AddCustomWorkoutTypeModal';
import { WorkoutBlock, CourseBlock, MuscuBlock, WorkoutTemplate } from '../../types/workout';
import { CourseBlockForm } from './CourseBlockForm';
import { MuscuBlockForm } from './MuscuBlockForm';
import { WorkoutBuilder } from './WorkoutBuilder';
import { SaveTemplateModal } from './SaveTemplateModal';
import { TemplateSelectionModal } from './TemplateSelectionModal';

interface NewWorkoutFormProps {
  onSave: (payload: {
    tag_seance: string;
    blocs: WorkoutBlock[];
    type: 'guidé' | 'manuscrit' | 'modèle';
    notes?: string;
    templateName?: string;
  }) => Promise<void>;
  onCancel: () => void;
  initialData?: {
    id?: string;
    tag_seance: string;
    blocs: WorkoutBlock[];
    type?: 'guidé' | 'manuscrit' | 'modèle';
    notes?: string;
  };
}

export function NewWorkoutForm({ onSave, onCancel, initialData }: NewWorkoutFormProps) {
  const [tagSeance, setTagSeance] = useState<string | null>(initialData?.tag_seance || null);
  const [blocks, setBlocks] = useState<WorkoutBlock[]>(initialData?.blocs || []);
  const [workoutType, setWorkoutType] = useState<'guidé' | 'manuscrit' | 'modèle'>(initialData?.type || 'guidé');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [saving, setSaving] = useState(false);
  const [isCustomModalOpen, setCustomModalOpen] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [isSaveTemplateModalOpen, setSaveTemplateModalOpen] = useState(false);
  const [isTemplateSelectionOpen, setTemplateSelectionOpen] = useState(false);
  
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [addingBlockType, setAddingBlockType] = useState<'course' | 'musculation' | null>(null);

  const handleUpsertBlock = (blockData: Omit<WorkoutBlock, 'id'> | WorkoutBlock) => {
    if ('id' in blockData && blockData.id) {
      setBlocks(prev => prev.map(b => (b.id === blockData.id ? { ...b, ...blockData } : b)));
    } else {
      const newBlockWithId: WorkoutBlock = { ...blockData, id: `block_${Date.now()}` };
      setBlocks(prev => [...prev, newBlockWithId]);
    }
    setAddingBlockType(null);
    setEditingBlockId(null);
  };

  const handleEditBlock = (id: string) => {
    const blockToEdit = blocks.find(b => b.id === id);
    if (blockToEdit) {
      setEditingBlockId(id);
      setAddingBlockType(blockToEdit.type as 'course' | 'musculation');
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

  const handleSaveTemplate = (templateName: string) => {
    console.log("Sauvegarde du modèle:", templateName, { tagSeance, blocks, notes });
    setSaveTemplateModalOpen(false);
  };

  const handleSelectTemplate = (template: WorkoutTemplate) => {
    setTagSeance('aerobie'); // Exemple
    setBlocks([
      { id: '1', type: 'course', series: 2, reps: 5, distance: 500, restBetweenReps: '01:30', restBetweenSeries: '03:00' },
      { id: '2', type: 'musculation', exerciceId: 'xyz', exerciceNom: 'Squat', series: 3, reps: 8, poids: 80, restTime: '02:00' }
    ]);
    setNotes('Chargé depuis le modèle: ' + template.name);
    setTemplateSelectionOpen(false);
    setWorkoutType('modèle');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagSeance) {
      alert('Veuillez sélectionner un type de séance.');
      return;
    }
    if (workoutType !== 'manuscrit' && blocks.length === 0) {
      alert('Veuillez ajouter au moins un bloc.');
      return;
    }
    setSaving(true);
    try {
      await onSave({ tag_seance: tagSeance, type: workoutType, notes, blocs });
    } finally {
      setSaving(false);
    }
  };
  
  const isFormActive = !!addingBlockType || !!editingBlockId;
  const editingBlockData = useMemo(() => editingBlockId ? blocks.find(b => b.id === editingBlockId) : undefined, [editingBlockId, blocks]);

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="card-glass shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{initialData?.id ? 'Modifier la séance' : 'Nouvelle séance'}</h2>
            <button onClick={onCancel} className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl transition-colors"><X className="w-6 h-6 text-gray-700 dark:text-gray-300" /></button>
          </div>
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
            <WorkoutTypeSelector selectedType={tagSeance} onSelectType={setTagSeance} onOpenCustomModal={() => setCustomModalOpen(true)} />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Méthode de création</label>
              <div className="flex items-center p-1 rounded-xl bg-gray-200/80 dark:bg-gray-900/80">
                <button type="button" onClick={() => setWorkoutType('guidé')} className={`w-full py-2 px-3 rounded-lg text-sm font-semibold transition-all ${workoutType === 'guidé' ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-white shadow' : 'text-gray-600 dark:text-gray-400'}`}>Guidée</button>
                <button type="button" onClick={() => setWorkoutType('manuscrit')} className={`w-full py-2 px-3 rounded-lg text-sm font-semibold transition-all ${workoutType === 'manuscrit' ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-white shadow' : 'text-gray-600 dark:text-gray-400'}`}>Manuscrite</button>
                <button type="button" onClick={() => setTemplateSelectionOpen(true)} className={`w-full py-2 px-3 rounded-lg text-sm font-semibold transition-all ${workoutType === 'modèle' ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-white shadow' : 'text-gray-600 dark:text-gray-400'}`}>Modèle</button>
              </div>
            </div>

            {workoutType !== 'manuscrit' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contenu de la séance *</label>
                <div className="flex gap-2 mb-4">
                  <button type="button" onClick={() => setAddingBlockType('course')} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-lg font-semibold shadow hover:bg-primary-700 transition-colors"><Navigation size={16}/>Course</button>
                  <button type="button" onClick={() => setAddingBlockType('musculation')} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg font-semibold shadow hover:bg-green-700 transition-colors"><Dumbbell size={16}/>Muscu</button>
                </div>
                <WorkoutBuilder blocks={blocks} onChange={handleUpdateBlocks} onRemoveBlock={handleRemoveBlock} onEditBlock={handleEditBlock} isAddingOrEditing={isFormActive} />
              </div>
            )}

            {workoutType === 'manuscrit' && (
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={10} className="w-full p-3 rounded-lg bg-black/5 dark:bg-white/5 border border-white/10 placeholder-gray-500" placeholder="Décrivez la séance..."/>
            )}
            
            <div className="pt-4 space-y-4 border-t border-white/10">
              {!showNotes && <button type="button" onClick={() => setShowNotes(true)} className="w-full flex items-center justify-center gap-2 text-sm text-primary-500 font-semibold"><MessageSquarePlus size={16}/>Ajouter une note</button>}
              <AnimatePresence>
                {showNotes && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} className="w-full p-3 rounded-lg bg-black/5 dark:bg-white/5 border border-white/10 placeholder-gray-500" placeholder="Note globale..."/>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="flex flex-wrap gap-3 justify-end">
                <button type="button" onClick={() => setSaveTemplateModalOpen(true)} className="px-4 py-2 border border-primary-500 text-primary-500 rounded-lg flex items-center gap-2 font-semibold hover:bg-primary-500/10 transition-colors"><Bookmark size={16}/>Sauver modèle</button>
                <div className="flex-grow flex gap-3">
                    <button type="button" onClick={onCancel} className="w-full px-6 py-3 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Annuler</button>
                    <button type="submit" disabled={saving} className="w-full bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors shadow-lg">{saving ? '...' : 'Enregistrer'}</button>
                </div>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
      
      <CourseBlockForm 
        isOpen={addingBlockType === 'course' || (!!editingBlockId && editingBlockData?.type === 'course')}
        onSave={handleUpsertBlock}
        onCancel={handleCancelForm}
        initialData={editingBlockData?.type === 'course' ? editingBlockData as CourseBlock : undefined}
      />
      <MuscuBlockForm 
        isOpen={addingBlockType === 'musculation' || (!!editingBlockId && editingBlockData?.type === 'musculation')}
        onSave={handleUpsertBlock}
        onCancel={handleCancelForm}
        initialData={editingBlockData?.type === 'musculation' ? editingBlockData as MuscuBlock : undefined}
      />
      
      <AnimatePresence>
        {isCustomModalOpen && <AddCustomWorkoutTypeModal onClose={() => setCustomModalOpen(false)} onSuccess={(newType) => setTagSeance(newType.id)} />}
        {isSaveTemplateModalOpen && <SaveTemplateModal onClose={() => setSaveTemplateModalOpen(false)} onSave={handleSaveTemplate} />}
        {isTemplateSelectionOpen && <TemplateSelectionModal onClose={() => setTemplateSelectionOpen(false)} onSelect={handleSelectTemplate} />}
      </AnimatePresence>
    </>
  );
}