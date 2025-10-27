import React, { useState } from 'react';
import { Wind, Plus, Minus, X } from 'lucide-react';

interface WindSelectorProps {
  value?: number; // en m/s
  onChange: (windSpeed: number | undefined) => void;
  label?: string;
  className?: string;
}

export const WindSelector: React.FC<WindSelectorProps> = ({
  value,
  onChange,
  label = "Vent (m/s)",
  className = ""
}) => {
  const [isPositive, setIsPositive] = useState(value === undefined ? true : value >= 0);
  const [windValue, setWindValue] = useState(value === undefined ? '' : Math.abs(value).toString());
  const [hasWind, setHasWind] = useState(value !== undefined);

  const updateWind = (newValue: string, positive: boolean) => {
    if (!hasWind || !newValue || newValue === '0') {
      onChange(undefined);
      return;
    }
    
    const numValue = parseFloat(newValue);
    if (isNaN(numValue)) {
      onChange(undefined);
      return;
    }
    
    onChange(positive ? numValue : -numValue);
  };

  const handleValueChange = (newValue: string) => {
    setWindValue(newValue);
    updateWind(newValue, isPositive);
  };

  const handleSignChange = (positive: boolean) => {
    setIsPositive(positive);
    updateWind(windValue, positive);
  };

  const handleToggleWind = (enabled: boolean) => {
    setHasWind(enabled);
    if (!enabled) {
      onChange(undefined);
      setWindValue('');
    } else {
      updateWind(windValue, isPositive);
    }
  };

  const handleClear = () => {
    setHasWind(false);
    setWindValue('');
    onChange(undefined);
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        <Wind className="h-4 w-4 inline mr-1" />
        {label}
      </label>
      
      {/* Toggle pour activer/désactiver la saisie du vent */}
      <div className="flex items-center space-x-3 mb-3">
        <button
          type="button"
          onClick={() => handleToggleWind(false)}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg border-2 transition-colors text-sm ${
            !hasWind 
              ? 'border-gray-400 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300' 
              : 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
        >
          <span>❓ Vent inconnu</span>
        </button>
        
        <button
          type="button"
          onClick={() => handleToggleWind(true)}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg border-2 transition-colors text-sm ${
            hasWind 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
              : 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
        >
          <Wind className="h-4 w-4" />
          <span>Mesurer le vent</span>
        </button>
      </div>

      {/* Interface de saisie du vent */}
      {hasWind && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            {/* Boutons +/- */}
            <div className="flex bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
              <button
                type="button"
                onClick={() => handleSignChange(false)}
                className={`px-3 py-2 transition-colors ${
                  !isPositive 
                    ? 'bg-red-500 text-white' 
                    : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500'
                }`}
              >
                <Minus className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => handleSignChange(true)}
                className={`px-3 py-2 transition-colors ${
                  isPositive 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500'
                }`}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Saisie de la valeur */}
            <div className="flex-1">
              <input
                type="number"
                step="0.1"
                value={windValue}
                onChange={(e) => handleValueChange(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.0"
                min="0"
                max="10"
              />
            </div>

            <span className="text-blue-700 dark:text-blue-300 font-medium">m/s</span>

            {/* Bouton effacer */}
            <button
              type="button"
              onClick={handleClear}
              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Effacer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Aperçu du résultat */}
          <div className="mt-3 text-center">
            <div className="text-sm text-blue-700 dark:text-blue-300">
              {windValue && parseFloat(windValue) > 0 ? (
                <>
                  <span className="font-bold">
                    {isPositive ? '+' : '-'}{windValue} m/s
                  </span>
                  <span className="ml-2">
                    {isPositive ? '💨 Vent favorable' : '🌪️ Vent défavorable'}
                  </span>
                </>
              ) : (
                <span className="text-gray-500 dark:text-gray-400">
                  Entrez une valeur de vent
                </span>
              )}
            </div>
            
            {windValue && parseFloat(windValue) > 2.0 && (
              <div className="mt-2 text-xs text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/20 px-2 py-1 rounded">
                {'⚠️ Vent > ±2.0 m/s : Performance non homologable'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Message d'aide */}
      {!hasWind && (
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
          💡 Le vent est optionnel. Activez la mesure si vous connaissez la valeur.
        </div>
      )}
    </div>
  );
};