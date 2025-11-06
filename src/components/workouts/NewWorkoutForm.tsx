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
  userRole: 'coach' | 'athlete';
  onSave: (payload: {
    tag_seance: string;
    blocs: WorkoutBlock[];
    type: 'guidé' | 'manuscrit' | 'modèle';
    notes?: string;
    templateName?: string;
    workoutId?: string;
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

export function NewWorkoutForm({ userRole, onSave, onCancel, initialData }: NewWorkoutFormProps) {
  const isAthlete = userRole === 'athlete';
  const isCompletingWorkout = isAthlete && !!initialData?.id;
  const [tagSeance, setTagSeance] = useState<string | null>(initialData?.tag_seance || null);
  const [blocks, setBlocks] = useState<WorkoutBlock[]>(initialData?.blocs || []);
  const [workoutType, setWorkoutType] = useState<'guidé' | 'manuscrit' | 'modèle'>(initialData?.type || (isAthlete ? 'guidé' : 'modèle'));
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
      if (isAthlete) {
        setAddingBlockType(null);
      } else {
        setAddingBlockType(blockToEdit.type as 'course' | 'musculation');
      }
    }
  };

  const handleCancelForm = () => {
    setAddingBlockType(null);
    setEditingBlockId(null);
  };

  const handleRemoveBlock = (id: string) => {
    if (isCompletingWorkout) return;
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
    if (template.workout_data) {
      setTagSeance(template.workout_data.tag_seance || null);
      setBlocks(template.workout_data.blocs || []);
      setNotes(template.workout_data.notes || '');
      setWorkoutType(template.workout_data.type || 'guidé');
    }
    setTemplateSelectionOpen(false);
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
      await onSave({
        tag_seance: tagSeance,
        type: workoutType,
        notes,
        blocs,
        workoutId: initialData?.id
      });
    } finally {
      setSaving(false);
    }
  };
  
  const isFormActive = !!addingBlockType || !!editingBlockId;
  const editingBlockData = useMemo(() => editingBlockId ? blocks.find(b => b.id === editingBlockId) : undefined, [editingBlockId, blocks]);
  const modalTitle = isCompletingWorkout ? 'Entrer mes performances' : (initialData?.id ? 'Modifier la séance' : 'Nouvelle séance');

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
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{modalTitle}</h2>
            <button onClick={onCancel} className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl transition-colors"><X className="w-6 h-6 text-gray-700 dark:text-gray-300" /></button>
          </div>
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
            <WorkoutTypeSelector selectedType={tagSeance} onSelectType={setTagSeance} onOpenCustomModal={() => setCustomModalOpen(true)} disabled={isCompletingWorkout} />
            
            {!isAthlete && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Méthode de création</label>
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" onClick={() => setWorkoutType('guidé')} className={`py-2 px-3 rounded-lg text-sm transition-all ${workoutType === 'guidé' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Guidée</button>
                  <button type="button" onClick={() => setWorkoutType('manuscrit')} className={`py-2 px-3 rounded-lg text-sm transition-all ${workoutType === 'manuscrit' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Manuscrite</button>
                  <button type="button" onClick={() => setTemplateSelectionOpen(true)} className={`py-2 px-3 rounded-lg text-sm transition-all ${workoutType === 'modèle' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Modèle</button>
                </div>
              </div>
            )}

            {isAthlete && !isCompletingWorkout && (
              <button type="button" onClick={() => setTemplateSelectionOpen(true)} className="w-full py-2 px-3 rounded-lg text-sm bg-blue-500 text-white">Charger un modèle</button>
            )}

            {workoutType !== 'manuscrit' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contenu de la séance *</label>
                {!isCompletingWorkout && (
                  <div className="flex gap-2 mb-4">
                    <button type="button" onClick={() => setAddingBlockType('course')} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg"><Navigation size={16}/>Course</button>
                    <button type="button" onClick={() => setAddingBlockType('musculation')} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg"><Dumbbell size={16}/>Muscu</button>
                  </div>
                )}
                <WorkoutBuilder
                  blocks={blocks}
                  onChange={handleUpdateBlocks}
                  onRemoveBlock={handleRemoveBlock}
                  onEditBlock={handleEditBlock}
                  isAddingOrEditing={isFormActive}
                  isReadOnly={isCompletingWorkout}
                  userRole={userRole}
                />
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
                {!isAthlete && <button type="button" onClick={() => setSaveTemplateModalOpen(true)} className="px-4 py-2 border rounded-lg flex items-center gap-2"><Bookmark size={16}/>Sauver modèle</button>}
                <div className="flex-grow flex gap-3">
                    <button type="button" onClick={onCancel} className="w-full px-6 py-3 border rounded-xl">Annuler</button>
                    <button type="submit" disabled={saving} className="w-full bg-blue-500 text-white px-6 py-3 rounded-xl">{saving ? '...' : (isCompletingWorkout ? 'Terminer la séance' : 'Enregistrer')}</button>
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
        userRole={userRole}
      />
      <MuscuBlockForm
        isOpen={addingBlockType === 'musculation' || (!!editingBlockId && editingBlockData?.type === 'musculation')}
        onSave={handleUpsertBlock}
        onCancel={handleCancelForm}
        initialData={editingBlockData?.type === 'musculation' ? editingBlockData as MuscuBlock : undefined}
        userRole={userRole}
      />
      
      <AnimatePresence>
        {isCustomModalOpen && <AddCustomWorkoutTypeModal onClose={() => setCustomModalOpen(false)} onSuccess={(newType) => setTagSeance(newType.id)} />}
        {isSaveTemplateModalOpen && <SaveTemplateModal onClose={() => setSaveTemplateModalOpen(false)} onSave={handleSaveTemplate} />}
        {isTemplateSelectionOpen && <TemplateSelectionModal onClose={() => setTemplateSelectionOpen(false)} onSelect={handleSelectTemplate} />}
      </AnimatePresence>
    </>
  );
}