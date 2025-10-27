import React, { useState, useEffect } from 'react';
import { Scale, Settings } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { MeasurementSystemModal } from './MeasurementSystemModal';

interface BodyCompFormProps {
  onSave: (data: any) => void;
  onCancel: () => void;
}

export const BodyCompForm: React.FC<BodyCompFormProps> = ({ onSave, onCancel }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [waterPercentage, setWaterPercentage] = useState('');
  const [totalMuscle, setTotalMuscle] = useState('');
  const [skeletalMuscle, setSkeletalMuscle] = useState('');
  const [bodyFatPercentage, setBodyFatPercentage] = useState('');

  const [systemeMesure, setSystemeMesure] = useState<string | null>(null);
  const [showSystemModal, setShowSystemModal] = useState(false);
  const [loadingSystem, setLoadingSystem] = useState(true);

  useEffect(() => {
    loadSystemeMesure();
  }, []);

  const loadSystemeMesure = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('systeme_mesure')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.systeme_mesure) {
        setSystemeMesure(profile.systeme_mesure);
      } else {
        setShowSystemModal(true);
      }
    } catch (error) {
      console.error('Error loading measurement system:', error);
    } finally {
      setLoadingSystem(false);
    }
  };

  const saveSystemeMesure = async (system: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({ systeme_mesure: system })
        .eq('id', user.id);

      if (error) throw error;

      setSystemeMesure(system);
      setShowSystemModal(false);
    } catch (error) {
      console.error('Error saving measurement system:', error);
      alert('Erreur lors de la sauvegarde du système de mesure');
    }
  };

  const getSystemLabel = (system: string) => {
    if (system.startsWith('autre:')) {
      return system.substring(6);
    }

    const labels: Record<string, string> = {
      'balance_impedancemetre': 'Balance avec impédancemètre',
      'pince_cutanee': 'Pince à plis cutanés',
      'dexa': 'DEXA Scan',
      'bodpod': 'Bod Pod',
      'hydrodensitometrie': 'Pesée hydrostatique',
    };

    return labels[system] || system;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bodyFatPercentage) {
      alert('Veuillez renseigner au moins le pourcentage de masse grasse');
      return;
    }

    const data = {
      date,
      masse_grasse_pct: parseFloat(bodyFatPercentage),
      masse_musculaire_kg: totalMuscle ? parseFloat(totalMuscle) : undefined,
      muscle_squelettique_kg: skeletalMuscle ? parseFloat(skeletalMuscle) : undefined,
    };

    await onSave(data);
  };

  if (loadingSystem) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-center text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-md mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
            <Scale className="h-6 w-6 mr-2 text-accent-500" />
            Composition corporelle
          </h2>

          {systemeMesure ? (
            <div className="mb-6 flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-900 dark:text-blue-200">
                  Système : <span className="font-medium">{getSystemLabel(systemeMesure)}</span>
                </span>
              </div>
              <button
                onClick={() => setShowSystemModal(true)}
                className="text-xs text-blue-600 hover:text-blue-700 underline"
              >
                Modifier
              </button>
            </div>
          ) : (
            <div className="mb-6 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Settings className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-orange-900 dark:text-orange-200 mb-2">
                    <strong>Système de mesure non configuré</strong>
                  </p>
                  <p className="text-sm text-orange-700 dark:text-orange-300 mb-3">
                    Configurez votre système de mesure pour obtenir des conseils personnalisés.
                  </p>
                  <button
                    onClick={() => setShowSystemModal(true)}
                    className="text-sm bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Configurer maintenant
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm text-yellow-900 dark:text-yellow-200">
              <strong>Note :</strong> Le poids sera récupéré automatiquement depuis le module Nutrition.
              La taille provient de votre profil.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Masse grasse (%) *
              </label>
              <input
                type="number"
                step="0.1"
                value={bodyFatPercentage}
                onChange={(e) => setBodyFatPercentage(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                placeholder="15.2"
                required
                min="3"
                max="50"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Champ obligatoire
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Masse musculaire totale (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={totalMuscle}
                onChange={(e) => setTotalMuscle(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                placeholder="55.2"
                min="0"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Optionnel
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Muscle squelettique (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={skeletalMuscle}
                onChange={(e) => setSkeletalMuscle(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                placeholder="32.8"
                min="0"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Optionnel
              </p>
            </div>

            <div className="flex space-x-3 pt-6">
              <button
                type="submit"
                className="flex-1 bg-accent-500 hover:bg-accent-600 px-4 py-3 rounded-lg text-white font-medium transition-all duration-200 shadow-lg"
              >
                Enregistrer
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>

      <MeasurementSystemModal
        isOpen={showSystemModal}
        currentSystem={systemeMesure || undefined}
        onSave={saveSystemeMesure}
        onClose={() => setShowSystemModal(false)}
      />
    </>
  );
};
