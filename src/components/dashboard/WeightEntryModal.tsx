import React, { useState } from 'react';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import WeightStepper from '../common/WeightStepper';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useBodycomp } from '../../hooks/useBodycomp';
import { toast } from 'react-toastify';

interface WeightEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WeightEntryModal: React.FC<WeightEntryModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { lastWeight, refresh } = useBodycomp();
  const [weight, setWeight] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Set initial weight when modal opens or lastWeight changes
  React.useEffect(() => {
    if (isOpen && lastWeight) {
      setWeight(lastWeight.weight);
    }
  }, [isOpen, lastWeight]);

  const handleSave = async () => {
    if (!user || !weight) return;
    
    setIsLoading(true);
    try {
      // Check if there is already an entry for today
      // Use local date to avoid timezone issues (toISOString uses UTC)
      const today = new Date().toLocaleDateString('fr-CA'); // YYYY-MM-DD format
      
      // We can't easily check for today's entry without a specific query, 
      // but inserting with 'date' as part of the unique constraint would be ideal.
      // For now, we just insert a new record.
      
      const { error } = await supabase
        .from('donnees_corporelles')
        .insert({
          athlete_id: user.id,
          date: today,
          poids_kg: weight,
          // We leave other fields null as this is just a quick weight entry
        });

      if (error) throw error;

      toast.success('Poids enregistré !');
      await refresh(); // Refresh the hook data
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de l\'enregistrement.');
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
              Nouvelle Pesée
            </h3>
            
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Poids (kg)
                </label>
                <WeightStepper 
                    initialValue={weight}
                    onChange={setWeight}
                />
            </div>
            
            <button
              onClick={handleSave}
              disabled={isLoading || !weight}
              className="w-full bg-sprint-primary text-white rounded-lg py-3 font-semibold hover:bg-sprint-primary/90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WeightEntryModal;
