import React, { useState, useMemo } from 'react';
import { X, MessageSquarePlus, Bookmark, Plus } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import WorkoutTypeSelector from './WorkoutTypeSelector';
import AddCustomWorkoutTypeModal from './AddCustomWorkoutTypeModal';
import { WorkoutBlock, WorkoutTemplate } from '../../types/workout';
import { WorkoutBuilderCanvas } from './builder/WorkoutBuilderCanvas';
import { SaveTemplateModal } from './SaveTemplateModal';
import { TemplateSelectionModal } from './TemplateSelectionModal';
import { BlockCockpit } from './cockpit/BlockCockpit';
import { BlockContentSwitch } from './cockpit/BlockForms';
import { SmartLibrary } from './builder/SmartLibrary';

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
  const [isLibraryOpen, setLibraryOpen] = useState(false);

  const handleUpsertBlock = (blockData: WorkoutBlock) => {
      // If block exists, update it
      const existingIndex = blocks.findIndex(b => b.id === blockData.id);
      if (existingIndex >= 0) {
          const newBlocks = [...blocks];
          newBlocks[existingIndex] = blockData;
          setBlocks(newBlocks);
      } else {
          // It's a new block (should not happen via this callback usually, but for safety)
          setBlocks(prev => [...prev, blockData]);
      }
  };

  const handleAddBlock = (newBlock: WorkoutBlock) => {
      setBlocks(prev => [...prev, newBlock]);
  };

  const handleEditBlock = (block: WorkoutBlock) => {
    setEditingBlockId(block.id);
  };

  const handleCloseCockpit = () => {
    setEditingBlockId(null);
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
        blocs: blocks,
        workoutId: initialData?.id
      });
    } finally {
      setSaving(false);
    }
  };

  const editingBlock = useMemo(() => editingBlockId ? blocks.find(b => b.id === editingBlockId) : null, [editingBlockId, blocks]);
  const modalTitle = isCompletingWorkout ? 'Entrer mes performances' : (initialData?.id ? 'Modifier la séance' : 'Nouvelle séance');

  const backdropVariants = {
    visible: { opacity: 1 },
    hidden: { opacity: 0 },
  };

  const modalVariants = {
    hidden: { y: "100%", opacity: 0 },
    visible: { 
      y: "0%", 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    },
    exit: { 
      y: "100%", 
      opacity: 0,
      transition: { duration: 0.2 }
    },
  };

  return (
    <>
      <motion.div
        className="fixed inset-0 z-40 bg-black/50"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        onClick={onCancel}
      />
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-50 h-[95vh] max-h-[1000px] bg-gray-50 dark:bg-gray-900 rounded-t-3xl shadow-2xl border-t border-white/10 flex flex-col"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/10">
          <div className="w-8 h-8"></div> {/* Spacer */}
          <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center">{modalTitle}</h2>
          <button onClick={onCancel} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar pb-24 bg-gray-50 dark:bg-gray-900">
          <WorkoutTypeSelector selectedType={tagSeance} onSelectType={setTagSeance} onOpenCustomModal={() => setCustomModalOpen(true)} disabled={isCompletingWorkout} />
          
          {isAthlete && !isCompletingWorkout && (
            <button type="button" onClick={() => setTemplateSelectionOpen(true)} className="w-full py-3 px-3 rounded-xl text-md bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors shadow-md">Charger un modèle</button>
          )}

          {workoutType !== 'manuscrit' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contenu de la séance *</label>
                 {!isCompletingWorkout && (
                     <button
                       type="button"
                       onClick={() => setLibraryOpen(true)}
                       className="text-sm text-blue-600 font-bold flex items-center gap-1"
                     >
                         <Plus size={16} /> Bibliothèque
                     </button>
                 )}
              </div>

              {!isCompletingWorkout && blocks.length === 0 && (
                  <button
                    type="button"
                    onClick={() => setLibraryOpen(true)}
                    className="w-full py-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl flex flex-col items-center justify-center text-gray-500 gap-2 mb-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                      <Plus className="opacity-50" size={32} />
                      <span className="font-semibold">Ajouter des blocs</span>
                  </button>
              )}

              <WorkoutBuilderCanvas
                blocks={blocks}
                onChange={setBlocks}
                onEditBlock={handleEditBlock}
                userRole={userRole}
              />
            </div>
          )}
          
          {workoutType === 'manuscrit' && (
            <textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
                rows={10} 
                className="w-full p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500" 
                placeholder="Décrivez la séance..."
            />
          )}
          
          <div className="pt-4 space-y-4">
            {!showNotes && <button type="button" onClick={() => setShowNotes(true)} className="w-full flex items-center justify-center gap-2 text-sm text-blue-600 dark:text-blue-400 font-semibold hover:underline"><MessageSquarePlus size={16}/>Ajouter une note</button>}
            <AnimatePresence>
              {showNotes && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  <textarea 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)} 
                    rows={4} 
                    className="w-full p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500" 
                    placeholder="Note globale..."
                  />
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex flex-wrap gap-3 justify-end pt-4 border-t border-gray-200 dark:border-white/10">
              {!isAthlete && <button type="button" onClick={() => setSaveTemplateModalOpen(true)} className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"><Bookmark size={16}/>Sauver modèle</button>}
              <button type="submit" disabled={saving} className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-colors disabled:opacity-50 font-bold shadow-md">{saving ? '...' : (isCompletingWorkout ? 'Terminer la séance' : 'Enregistrer')}</button>
            </div>
          </div>
        </form>
      </motion.div>
      
      {/* Cockpit for editing blocks */}
      <BlockCockpit
        isOpen={!!editingBlockId}
        block={editingBlock}
        onUpdate={handleUpsertBlock}
        onClose={handleCloseCockpit}
      >
          {editingBlock && <BlockContentSwitch block={editingBlock} onUpdate={handleUpsertBlock} />}
      </BlockCockpit>

      {/* Smart Library for adding blocks */}
      <SmartLibrary
        isOpen={isLibraryOpen}
        onClose={() => setLibraryOpen(false)}
        onAddBlock={handleAddBlock}
      />
      
      <AnimatePresence>
        {isCustomModalOpen && <AddCustomWorkoutTypeModal onClose={() => setCustomModalOpen(false)} onSuccess={(newType) => setTagSeance(newType.id)} />}
        {isSaveTemplateModalOpen && <SaveTemplateModal onClose={() => setSaveTemplateModalOpen(false)} onSave={handleSaveTemplate} />}
        {isTemplateSelectionOpen && <TemplateSelectionModal onClose={() => setTemplateSelectionOpen(false)} onSelect={handleSelectTemplate} />}
      </AnimatePresence>
    </>
  );
}

export default NewWorkoutForm;
