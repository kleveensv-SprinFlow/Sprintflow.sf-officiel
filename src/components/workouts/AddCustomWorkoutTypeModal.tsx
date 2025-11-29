import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { toast } from 'react-toastify';
import { useWorkoutTypes } from '../../hooks/useWorkoutTypes';

// Palette "SprintFlow"
const PREDEFINED_COLORS = [
  '#2563EB', // Bleu Royal
  '#EF4444', // Rouge Vif
  '#10B981', // Vert Émeraude
  '#FFC107', // Or (Sprint)
  '#8B5CF6', // Violet
  '#F97316', // Orange
  '#374151', // Gris Anthracite
  '#CD7F32', // Bronze
];

interface AddCustomWorkoutTypeModalProps {
  onClose: () => void;
  onSuccess: (newType: { id: string; name: string; color: string }) => void;
}

const AddCustomWorkoutTypeModal: React.FC<AddCustomWorkoutTypeModalProps> = ({ onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState(PREDEFINED_COLORS[0]);
  const [saving, setSaving] = useState(false);
  const { addCustomType } = useWorkoutTypes();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.warning('Le nom est requis.');
      return;
    }
    setSaving(true);
    
    try {
      const newType = await addCustomType(name, color);
      
      if (newType) {
        toast.success('Nouveau type créé !');
        onSuccess(newType);
        onClose();
      } else {
        toast.error('Erreur lors de la création du type de séance.');
      }
    } catch (error) {
      toast.error('Une erreur est survenue.');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Nouveau type de séance</h3>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Nom du type
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Côtes, Vitesse Spé..."
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-sprint-primary/50 outline-none transition-all font-medium text-gray-900 dark:text-white placeholder:text-gray-400"
              autoFocus
              required
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Couleur associée
            </label>
            <div className="grid grid-cols-4 gap-3">
              {PREDEFINED_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-full aspect-square rounded-full flex items-center justify-center transition-all ${
                    color === c 
                      ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 scale-110 shadow-md' 
                      : 'hover:scale-105 opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c, boxShadow: color === c ? `0 0 0 2px ${c}` : undefined }}
                >
                  {color === c && <Check size={16} className="text-white drop-shadow-md" strokeWidth={3} />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2.5 rounded-xl bg-sprint-primary text-white font-bold shadow-lg shadow-sprint-primary/30 hover:shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
            >
              {saving ? 'Création...' : 'Créer'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddCustomWorkoutTypeModal;
