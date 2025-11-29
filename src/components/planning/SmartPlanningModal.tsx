import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calendar, Tag, Type, StickyNote, Ruler } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-toastify';

import { WorkoutBlock } from '../../types/workout';
import { useWorkoutTypes } from '../../hooks/useWorkoutTypes';
import { SmartWorkoutBuilder } from '../workouts/builder/SmartWorkoutBuilder';
import { createEmptyBlock } from '../../utils/workoutUtils';
import AddCustomWorkoutTypeModal from '../workouts/AddCustomWorkoutTypeModal'; // Assure-toi du bon chemin

interface SmartPlanningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SmartPlanningPayload) => void;
  selectedDate: Date;
  initialData?: {
    title?: string;
    blocks?: WorkoutBlock[];
    tag_seance?: string;
    notes?: string;
  };
}

export interface SmartPlanningPayload {
  title: string;
  date: Date;
  tag_seance: string; // Type ID
  blocs: WorkoutBlock[];
  notes?: string;
}

export const SmartPlanningModal: React.FC<SmartPlanningModalProps> = ({
  isOpen,
  onClose,
  onSave,
  selectedDate,
  initialData
}) => {
  const { allTypes: workoutTypes, refetch: refetchTypes } = useWorkoutTypes();
  
  // State
  const [title, setTitle] = useState(initialData?.title || '');
  const [selectedTypeId, setSelectedTypeId] = useState(initialData?.tag_seance || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [blocks, setBlocks] = useState<WorkoutBlock[]>(initialData?.blocks || []);

  // Modal "Nouveau Type"
  const [isTypeModalOpen, setTypeModalOpen] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle(initialData?.title || '');
      setSelectedTypeId(initialData?.tag_seance || '');
      setNotes(initialData?.notes || '');
      setBlocks(initialData?.blocks || []);
    }
  }, [isOpen, initialData]);

  // --- FEATURE 1 : SMART TITLE ---
  // Met à jour le titre automatiquement quand on change de type, 
  // sauf si l'utilisateur a déjà tapé un titre personnalisé.
  useEffect(() => {
    if (!selectedTypeId) return;
    
    const typeObj = workoutTypes.find(t => t.id === selectedTypeId);
    if (!typeObj) return;

    // Si le titre est vide, ou s'il correspond exactement à un nom de type existant (donc générique)
    // On le remplace par le nouveau type.
    const isGenericTitle = title.trim() === '' || workoutTypes.some(t => t.name === title);

    if (isGenericTitle) {
      setTitle(typeObj.name);
    }
  }, [selectedTypeId, workoutTypes]); // Retirer 'title' des dépendances pour éviter boucle infinie

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'create_new') {
      setTypeModalOpen(true);
    } else {
      setSelectedTypeId(value);
    }
  };

  const handleNewTypeCreated = (newType: { id: string; name: string }) => {
    refetchTypes(); // Rafraîchir la liste
    setSelectedTypeId(newType.id); // Sélectionner le nouveau type
    // Le useEffect du Smart Title va s'occuper de remplir le titre
  };

  // Handlers Blocs
  const handleAddBlock = (type: WorkoutBlock['type']) => {
    const newBlock = createEmptyBlock(type);
    setBlocks(prev => [...prev, newBlock]);
  };

  const handleUpdateBlock = (id: string, updatedBlock: WorkoutBlock) => {
    setBlocks(prev => prev.map(b => b.id === id ? updatedBlock : b));
  };

  const handleRemoveBlock = (id: string) => {
    if (confirm('Voulez-vous vraiment supprimer ce bloc ?')) {
      setBlocks(prev => prev.filter(b => b.id !== id));
    }
  };

  const handleSave = () => {
    // Validation
    if (!selectedTypeId) {
      toast.error('Le type de séance est obligatoire');
      return;
    }
    if (blocks.length === 0) {
      toast.error('La séance doit contenir au moins un bloc');
      return;
    }

    // Smart Title Fallback : Si le titre est visuellement vide, on prend le nom du type
    let finalTitle = title.trim();
    if (!finalTitle) {
      const typeObj = workoutTypes.find(t => t.id === selectedTypeId);
      if (typeObj) finalTitle = typeObj.name;
    }

    onSave({
      title: finalTitle,
      date: selectedDate,
      tag_seance: selectedTypeId,
      blocs: blocks,
      notes
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden border border-gray-200 dark:border-gray-800">
          
          {/* --- HEADER --- */}
          <div className="flex flex-col gap-4 p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Calendar className="text-sprint-primary" size={24} />
                Planifier une séance
              </h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-2 flex items-center justify-center px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 font-medium">
                {format(selectedDate, 'EEE d MMM', { locale: fr })}
              </div>

              {/* Titre (Optionnel visuellement) */}
              <div className="md:col-span-6 relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Type size={16} /></div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Titre (ex: Vitesse) - Optionnel"
                  className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-sprint-primary/50 outline-none font-semibold placeholder:font-normal"
                />
              </div>

              {/* Type Selector + Option Création */}
              <div className="md:col-span-4 relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Tag size={16} /></div>
                <select
                  value={selectedTypeId}
                  onChange={handleTypeChange}
                  className="w-full pl-9 pr-8 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-sprint-primary/50 outline-none appearance-none cursor-pointer font-medium"
                >
                  <option value="" disabled>Sélectionner un type...</option>
                  {workoutTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                  <option disabled>──────────</option>
                  <option value="create_new" className="text-sprint-primary font-bold">
                    + Créer un nouveau type...
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* --- BODY --- */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-gray-50 dark:bg-black/20">
            {blocks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4 opacity-60">
                <Plus size={48} />
                <p>Ajoutez un premier bloc pour commencer</p>
              </div>
            ) : (
              blocks.map((block, index) => (
                <div key={block.id} className="relative">
                  <div className="flex justify-between mb-1 px-1">
                     <span className="text-xs font-bold text-gray-500 uppercase">Bloc {index + 1} • {block.type}</span>
                     <button onClick={() => handleRemoveBlock(block.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                  </div>
                  <SmartWorkoutBuilder initialBlock={block} onUpdate={(updated) => handleUpdateBlock(block.id, updated)} />
                </div>
              ))
            )}
            <div className="h-24" />
          </div>

          {/* --- FOOTER --- */}
          <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row items-center gap-4 justify-between">
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide">
              <button onClick={() => handleAddBlock('course')} className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-bold hover:bg-blue-100 dark:hover:bg-blue-900/50 whitespace-nowrap">+ Sprint</button>
              <button onClick={() => handleAddBlock('musculation')} className="px-4 py-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg text-sm font-bold hover:bg-purple-100 dark:hover:bg-purple-900/50 whitespace-nowrap">+ Muscu</button>
              <button onClick={() => handleAddBlock('technique')} className="px-4 py-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg text-sm font-bold hover:bg-amber-100 dark:hover:bg-amber-900/50 whitespace-nowrap">+ Technique</button>
              <button onClick={() => handleAddBlock('universal')} className="px-4 py-2 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg text-sm font-bold hover:bg-green-100 dark:hover:bg-green-900/50 whitespace-nowrap flex items-center gap-1"><Ruler size={14}/> + Universel</button>
              <button onClick={() => handleAddBlock('note')} className="px-4 py-2 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-lg text-sm font-bold hover:bg-yellow-100 dark:hover:bg-yellow-900/50 whitespace-nowrap flex items-center gap-1"><StickyNote size={14}/> + Note</button>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <button onClick={onClose} className="flex-1 px-6 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium">Annuler</button>
              <button onClick={handleSave} className="flex-1 px-8 py-2.5 rounded-xl bg-sprint-primary text-white font-bold shadow-lg hover:scale-105 transition-transform">Sauvegarder</button>
            </div>
          </div>
        </div>
      </div>

      {/* Modale de création de type (Superposée) */}
      {isTypeModalOpen && (
        <AddCustomWorkoutTypeModal 
          onClose={() => setTypeModalOpen(false)} 
          onSuccess={handleNewTypeCreated} 
        />
      )}
    </>
  );
};
