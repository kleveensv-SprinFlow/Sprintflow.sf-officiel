import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useWorkoutTypes } from '../../hooks/useWorkoutTypes';

const PREDEFINED_COLORS = [
  '#1abc9c', // Turquoise
  '#9b59b6', // Amethyst
  '#f1c40f', // Sun Flower
  '#e74c3c', // Alizarin
  '#2ecc71', // Emerald
  '#3498db', // Peter River
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
      alert('Le nom est requis.');
      return;
    }
    setSaving(true);
    const newType = await addCustomType(name, color);
    setSaving(false);

    if (newType) {
      onSuccess(newType);
      onClose();
    } else {
      alert('Erreur lors de la création du type de séance.');
    }
  };

  return (
    <div className="fixed inset-0 z-[51] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Nouveau type de séance</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nom du type
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Couleur
            </label>
            <div className="flex gap-2">
              {PREDEFINED_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-transform ${
                    color === c ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-white' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-blue-500 text-white disabled:opacity-50"
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