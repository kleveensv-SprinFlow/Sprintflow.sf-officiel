import React, { useState } from 'react';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface UpdateBodyFatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bodyFat: number) => Promise<void>;
}

const UpdateBodyFatModal: React.FC<UpdateBodyFatModalProps> = ({ isOpen, onClose, onSave }) => {
  const [bodyFat, setBodyFat] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    const bodyFatValue = parseFloat(bodyFat);
    if (isNaN(bodyFatValue) || bodyFatValue <= 0 || bodyFatValue >= 100) {
      setError('Veuillez entrer une valeur valide.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await onSave(bodyFatValue);
      onClose();
    } catch (err) {
      setError('Erreur lors de la sauvegarde.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg w-full max-w-sm p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X size={24} />
            </button>
            
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Masse Grasse
            </h3>
            
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Entrez votre pourcentage de masse grasse pour un calcul plus précis de votre indice de composition corporelle.
            </p>

            <div className="relative">
              <input
                type="number"
                value={bodyFat}
                onChange={(e) => setBodyFat(e.target.value)}
                placeholder="Ex: 12.5"
                className="w-full bg-gray-100 dark:bg-gray-700 border-2 border-transparent focus:border-indigo-500 rounded-lg p-3 text-center text-lg font-semibold text-gray-900 dark:text-white transition"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
            </div>

            {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
            
            <button
              onClick={handleSave}
              disabled={isLoading || bodyFat === ''}
              className="w-full bg-indigo-600 text-white rounded-lg py-3 mt-6 font-semibold hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Enregistrement...' : 'Enregistrer et Mettre à Jour'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UpdateBodyFatModal;