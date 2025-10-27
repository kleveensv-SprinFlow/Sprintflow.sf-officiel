import React, { useState } from 'react';
import { ArrowRight, Target, Weight } from 'lucide-react';
import { useNutrition } from '../../hooks/useNutrition';

interface OnboardingStep1Data {
  kcal_haut: number;
  proteines_haut: number;
  glucides_haut: number;
  lipides_haut: number;
  kcal_bas: number;
  proteines_bas: number;
  glucides_bas: number;
  lipides_bas: number;
  kcal_repos: number;
  proteines_repos: number;
  glucides_repos: number;
  lipides_repos: number;
}

interface OnboardingStep2Data {
  poids_kg: number;
  masse_grasse_pct?: number;
  masse_musculaire_kg?: number;
  muscle_squelettique_kg?: number;
}

interface NutritionOnboardingProps {
  onComplete: () => void;
}

export function NutritionOnboarding({ onComplete }: NutritionOnboardingProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { createOrUpdateObjectif, addDonneesCorporelles } = useNutrition();

  const [step1Data, setStep1Data] = useState<any>({
    kcal_haut: '2800',
    proteines_haut: '180',
    glucides_haut: '350',
    lipides_haut: '70',
    kcal_bas: '2200',
    proteines_bas: '180',
    glucides_bas: '200',
    lipides_bas: '80',
    kcal_repos: '1800',
    proteines_repos: '150',
    glucides_repos: '150',
    lipides_repos: '70',
  });

  const [step2Data, setStep2Data] = useState<OnboardingStep2Data>({
    poids_kg: 70,
    masse_grasse_pct: undefined,
    masse_musculaire_kg: undefined,
    muscle_squelettique_kg: undefined,
  });

  const handleStep1Submit = async () => {
    setLoading(true);
    try {
      await createOrUpdateObjectif({
        type_jour: 'haut',
        kcal_objectif: Number(step1Data.kcal_haut) || 0,
        proteines_objectif_g: Number(step1Data.proteines_haut) || 0,
        glucides_objectif_g: Number(step1Data.glucides_haut) || 0,
        lipides_objectif_g: Number(step1Data.lipides_haut) || 0,
      });

      await createOrUpdateObjectif({
        type_jour: 'bas',
        kcal_objectif: Number(step1Data.kcal_bas) || 0,
        proteines_objectif_g: Number(step1Data.proteines_bas) || 0,
        glucides_objectif_g: Number(step1Data.glucides_bas) || 0,
        lipides_objectif_g: Number(step1Data.lipides_bas) || 0,
      });

      await createOrUpdateObjectif({
        type_jour: 'repos',
        kcal_objectif: Number(step1Data.kcal_repos) || 0,
        proteines_objectif_g: Number(step1Data.proteines_repos) || 0,
        glucides_objectif_g: Number(step1Data.glucides_repos) || 0,
        lipides_objectif_g: Number(step1Data.lipides_repos) || 0,
      });

      setStep(2);
    } catch (error) {
      console.error('Error saving objectives:', error);
      alert('Erreur lors de la sauvegarde des objectifs');
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      await addDonneesCorporelles({
        date: today,
        poids_kg: step2Data.poids_kg,
        masse_grasse_pct: step2Data.masse_grasse_pct,
        masse_musculaire_kg: step2Data.masse_musculaire_kg,
        muscle_squelettique_kg: step2Data.muscle_squelettique_kg,
      });

      onComplete();
    } catch (error) {
      console.error('Error saving body data:', error);
      alert('Erreur lors de la sauvegarde des données corporelles');
    } finally {
      setLoading(false);
    }
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl w-full">
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Configurons vos objectifs nutritionnels</h1>
          </div>

          <p className="text-gray-600 mb-8">
            Définissez vos objectifs pour 3 types de journées : Jour Haut (entraînement intense),
            Jour Bas (entraînement léger), et Jour Repos.
          </p>

          <div className="space-y-8">
            <div className="border-2 border-blue-200 rounded-xl p-6 bg-blue-50">
              <h3 className="text-xl font-semibold text-blue-900 mb-4">Jour Haut</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kcal</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={step1Data.kcal_haut}
                    onChange={(e) => setStep1Data({ ...step1Data, kcal_haut: e.target.value })}
                    onFocus={(e) => e.target.select()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Protéines (g)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={step1Data.proteines_haut}
                    onChange={(e) => setStep1Data({ ...step1Data, proteines_haut: e.target.value })}
                    onFocus={(e) => e.target.select()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Glucides (g)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={step1Data.glucides_haut}
                    onChange={(e) => setStep1Data({ ...step1Data, glucides_haut: e.target.value })}
                    onFocus={(e) => e.target.select()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lipides (g)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={step1Data.lipides_haut}
                    onChange={(e) => setStep1Data({ ...step1Data, lipides_haut: e.target.value })}
                    onFocus={(e) => e.target.select()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="border-2 border-green-200 rounded-xl p-6 bg-green-50">
              <h3 className="text-xl font-semibold text-green-900 mb-4">Jour Bas</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kcal</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={step1Data.kcal_bas}
                    onChange={(e) => setStep1Data({ ...step1Data, kcal_bas: e.target.value })}
                    onFocus={(e) => e.target.select()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Protéines (g)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={step1Data.proteines_bas}
                    onChange={(e) => setStep1Data({ ...step1Data, proteines_bas: e.target.value })}
                    onFocus={(e) => e.target.select()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Glucides (g)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={step1Data.glucides_bas}
                    onChange={(e) => setStep1Data({ ...step1Data, glucides_bas: e.target.value })}
                    onFocus={(e) => e.target.select()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lipides (g)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={step1Data.lipides_bas}
                    onChange={(e) => setStep1Data({ ...step1Data, lipides_bas: e.target.value })}
                    onFocus={(e) => e.target.select()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="border-2 border-gray-200 rounded-xl p-6 bg-gray-50">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Jour Repos</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kcal</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={step1Data.kcal_repos}
                    onChange={(e) => setStep1Data({ ...step1Data, kcal_repos: e.target.value })}
                    onFocus={(e) => e.target.select()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Protéines (g)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={step1Data.proteines_repos}
                    onChange={(e) => setStep1Data({ ...step1Data, proteines_repos: e.target.value })}
                    onFocus={(e) => e.target.select()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Glucides (g)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={step1Data.glucides_repos}
                    onChange={(e) => setStep1Data({ ...step1Data, glucides_repos: e.target.value })}
                    onFocus={(e) => e.target.select()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lipides (g)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={step1Data.lipides_repos}
                    onChange={(e) => setStep1Data({ ...step1Data, lipides_repos: e.target.value })}
                    onFocus={(e) => e.target.select()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleStep1Submit}
            disabled={loading}
            className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {loading ? 'Enregistrement...' : 'Continuer'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
        <div className="flex items-center gap-3 mb-6">
          <Weight className="w-8 h-8 text-green-600" />
          <h1 className="text-3xl font-bold text-gray-900">Vos données corporelles</h1>
        </div>

        <p className="text-gray-600 mb-8">
          Entrez vos données de base. Le poids est obligatoire, les autres sont optionnelles.
        </p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Poids (kg) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.1"
              value={step2Data.poids_kg}
              onChange={(e) => setStep2Data({ ...step2Data, poids_kg: Number(e.target.value) })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:border-green-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Masse grasse (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={step2Data.masse_grasse_pct || ''}
              onChange={(e) => setStep2Data({ ...step2Data, masse_grasse_pct: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:border-green-500 focus:outline-none"
              placeholder="Optionnel"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Masse musculaire (kg)
            </label>
            <input
              type="number"
              step="0.1"
              value={step2Data.masse_musculaire_kg || ''}
              onChange={(e) => setStep2Data({ ...step2Data, masse_musculaire_kg: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:border-green-500 focus:outline-none"
              placeholder="Optionnel"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Muscle squelettique (kg)
            </label>
            <input
              type="number"
              step="0.1"
              value={step2Data.muscle_squelettique_kg || ''}
              onChange={(e) => setStep2Data({ ...step2Data, muscle_squelettique_kg: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:border-green-500 focus:outline-none"
              placeholder="Optionnel"
            />
          </div>
        </div>

        <button
          onClick={handleStep2Submit}
          disabled={loading || !step2Data.poids_kg}
          className="mt-8 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          {loading ? 'Enregistrement...' : 'Terminer la configuration'}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
