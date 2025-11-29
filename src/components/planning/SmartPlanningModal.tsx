import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Calendar, Tag, Type } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-toastify';

import { WorkoutBlock } from '../../types/workout';
import { useWorkoutTypes } from '../../hooks/useWorkoutTypes';
import { SmartWorkoutBuilder } from '../workouts/builder/SmartWorkoutBuilder';
import { createEmptyBlock } from '../../utils/workoutUtils';

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
  const { allTypes: workoutTypes } = useWorkoutTypes();
  
  // State
  const [title, setTitle] = useState(initialData?.title || '');
  const [selectedTypeId, setSelectedTypeId] = useState(initialData?.tag_seance || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [blocks, setBlocks] = useState<WorkoutBlock[]>(initialData?.blocks || []);

  // Reset state when modal opens with new data
  useEffect(() => {
    if (isOpen) {
      setTitle(initialData?.title || '');
      setSelectedTypeId(initialData?.tag_seance || '');
      setNotes(initialData?.notes || '');
      setBlocks(initialData?.blocks || []);
    }
  }, [isOpen, initialData]);

  // Handlers
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
    if (!title.trim()) {
      toast.error('Le titre de la séance est obligatoire');
      return;
    }
    if (!selectedTypeId) {
      toast.error('Le type de séance est obligatoire');
      return;
    }
    if (blocks.length === 0) {
      toast.error('La séance doit contenir au moins un bloc');
      return;
    }

    onSave({
      title,
      date: selectedDate,
      tag_seance: selectedTypeId,
      blocs: blocks,
      notes
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden border border-gray-200 dark:border-gray-800">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col gap-4 p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="text-sprint-primary" size={24} />
              Planifier une séance
            </h2>
            <button 
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Date (Read Only Display) */}
            <div className="md:col-span-2 flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500">
               <Calendar size={16} />
               <span className="font-medium text-sm capitalize">{format(selectedDate, 'EEE d MMM', { locale: fr })}</span>
            </div>

            {/* Titre */}
            <div className="md:col-span-6 relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Type size={16} />
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titre de la séance (ex: Vitesse Max)"
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-sprint-primary/50 outline-none transition-all font-semibold"
                autoFocus
              />
            </div>

            {/* Type Selector */}
            <div className="md:col-span-4 relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Tag size={16} />
              </div>
              <select
                value={selectedTypeId}
                onChange={(e) => setSelectedTypeId(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-sprint-primary/50 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="" disabled>Sélectionner un type...</option>
                {workoutTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* --- BODY (Scrollable) --- */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-gray-50 dark:bg-black/20">
          
          {blocks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4 opacity-60">
              <div className="w-16 h-16 rounded-2xl bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                <Plus size={32} />
              </div>
              <p className="font-medium">Ajoutez un premier bloc pour commencer</p>
            </div>
          ) : (
            blocks.map((block, index) => (
              <div key={block.id} className="relative group animate-fade-in-up">
                {/* Block Header / Controls */}
                <div className="flex items-center justify-between mb-2 px-1">
                   <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                     Bloc {index + 1} • {block.type}
                   </span>
                   <button 
                     onClick={() => handleRemoveBlock(block.id)}
                     className="text-gray-400 hover:text-red-500 transition-colors p-1"
                     title="Supprimer le bloc"
                   >
                     <Trash2 size={16} />
                   </button>
                </div>

                {/* The Builder Component */}
                <SmartWorkoutBuilder 
                  initialBlock={block}
                  onUpdate={(updated) => handleUpdateBlock(block.id, updated)}
                />
              </div>
            ))
          )}

          {/* Bottom Spacing for FAB */}
          <div className="h-24" /> 
        </div>

        {/* --- FOOTER / ACTIONS --- */}
        <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row items-center gap-4 justify-between">
          
          {/* Quick Add Actions */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            <span className="text-xs font-medium text-gray-400 mr-2 whitespace-nowrap hidden md:inline">Ajouter :</span>
            
            <button
              onClick={() => handleAddBlock('course')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors font-medium text-sm whitespace-nowrap"
            >
              <Plus size={16} /> Sprint / Course
            </button>
            
            <button
              onClick={() => handleAddBlock('musculation')}
              className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors font-medium text-sm whitespace-nowrap"
            >
              <Plus size={16} /> Musculation
            </button>

            <button
              onClick={() => handleAddBlock('technique')}
              className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors font-medium text-sm whitespace-nowrap"
            >
              <Plus size={16} /> Technique
            </button>
          </div>

          {/* Main Actions */}
          <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-1 md:flex-none text-center"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              className="px-8 py-2.5 rounded-xl bg-sprint-primary text-white font-bold shadow-lg shadow-sprint-primary/30 hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 flex-1 md:flex-none"
            >
              <Save size={18} />
              Sauvegarder
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
