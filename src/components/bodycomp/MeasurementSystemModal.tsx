import React, { useState } from 'react';
import { X, Scale, Activity } from 'lucide-react';

interface MeasurementSystemModalProps {
  isOpen: boolean;
  currentSystem?: string;
  onSave: (system: string, autre?: string) => void;
  onClose: () => void;
}

export function MeasurementSystemModal({ isOpen, currentSystem, onSave, onClose }: MeasurementSystemModalProps) {
  const [selectedSystem, setSelectedSystem] = useState(currentSystem || '');
  const [autreSystem, setAutreSystem] = useState('');

  if (!isOpen) return null;

  const systems = [
    { value: 'balance_impedancemetre', label: 'Balance avec impédancemètre', description: 'Analyse par impédance bioélectrique (BIA)' },
    { value: 'pince_cutanee', label: 'Pince à plis cutanés', description: 'Mesure des plis cutanés (caliper)' },
    { value: 'dexa', label: 'DEXA Scan', description: 'Absorptiométrie biphotonique à rayons X' },
    { value: 'bodpod', label: 'Bod Pod', description: 'Pléthysmographie par déplacement d\'air' },
    { value: 'hydrodensitometrie', label: 'Pesée hydrostatique', description: 'Immersion dans l\'eau' },
    { value: 'autre', label: 'Autre', description: 'Préciser votre méthode' },
  ];

  const handleSave = () => {
    if (!selectedSystem) {
      alert('Veuillez sélectionner un système de mesure');
      return;
    }

    if (selectedSystem === 'autre' && !autreSystem.trim()) {
      alert('Veuillez préciser votre système de mesure');
      return;
    }

    const systemToSave = selectedSystem === 'autre' ? `autre:${autreSystem}` : selectedSystem;
    onSave(systemToSave, autreSystem);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <Scale className="w-8 h-8 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Système de Mesure</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {currentSystem ? 'Modifier votre méthode de mesure' : 'Choisissez votre méthode (vous pourrez le faire plus tard)'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title={currentSystem ? "Annuler" : "Configurer plus tard"}
          >
            <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Activity className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900 dark:text-blue-200">
                <p className="font-medium mb-1">Pourquoi cette information ?</p>
                <p className="text-blue-700 dark:text-blue-300">
                  Chaque système de mesure a ses spécificités. Cette configuration nous permet de vous fournir
                  des informations et conseils adaptés à votre méthode de mesure.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {systems.map((system) => (
              <div key={system.value}>
                <button
                  onClick={() => setSelectedSystem(system.value)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selectedSystem === system.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedSystem === system.value
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {selectedSystem === system.value && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 dark:text-white">{system.label}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{system.description}</div>
                    </div>
                  </div>
                </button>

                {selectedSystem === 'autre' && system.value === 'autre' && (
                  <div className="mt-3 ml-8">
                    <input
                      type="text"
                      value={autreSystem}
                      onChange={(e) => setAutreSystem(e.target.value)}
                      placeholder="Précisez votre système de mesure..."
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
            >
              {currentSystem ? 'Mettre à jour' : 'Confirmer'}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold transition-colors"
            >
              {currentSystem ? 'Annuler' : 'Plus tard'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
