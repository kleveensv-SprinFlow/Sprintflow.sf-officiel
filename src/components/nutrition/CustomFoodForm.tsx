import React, { useState } from 'react';
import { Save, X } from 'lucide-react';
import { FoodItem } from '../../types';

interface CustomFoodFormProps {
  initialQuery?: string;
  onSave: (food: FoodItem) => void;
  onCancel: () => void;
}

export function CustomFoodForm({ initialQuery = '', onSave, onCancel }: CustomFoodFormProps) {
  const [formData, setFormData] = useState({
    nom: initialQuery,
    kcal_100g: 0,
    proteines_100g: 0,
    glucides_100g: 0,
    lipides_100g: 0,
    fibres_100g: 0,
    sodium_100mg: 0,
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'nom' ? value : Number(value)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nom.trim()) {
      alert('Veuillez entrer un nom pour l\'aliment');
      return;
    }

    const foodItem: FoodItem = {
      ...formData,
      source_type: 'personnel',
      source_id: Date.now().toString(),
    };

    onSave(foodItem);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          Créez un aliment personnalisé avec ses valeurs nutritionnelles pour 100g
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nom de l'aliment *
        </label>
        <input
          type="text"
          value={formData.nom}
          onChange={(e) => handleChange('nom', e.target.value)}
          placeholder="Ex: Ma recette maison"
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Calories (kcal/100g) *
          </label>
          <input
            type="number"
            value={formData.kcal_100g}
            onChange={(e) => handleChange('kcal_100g', e.target.value)}
            min="0"
            step="0.1"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Protéines (g/100g) *
          </label>
          <input
            type="number"
            value={formData.proteines_100g}
            onChange={(e) => handleChange('proteines_100g', e.target.value)}
            min="0"
            step="0.1"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Glucides (g/100g) *
          </label>
          <input
            type="number"
            value={formData.glucides_100g}
            onChange={(e) => handleChange('glucides_100g', e.target.value)}
            min="0"
            step="0.1"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lipides (g/100g) *
          </label>
          <input
            type="number"
            value={formData.lipides_100g}
            onChange={(e) => handleChange('lipides_100g', e.target.value)}
            min="0"
            step="0.1"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fibres (g/100g)
          </label>
          <input
            type="number"
            value={formData.fibres_100g}
            onChange={(e) => handleChange('fibres_100g', e.target.value)}
            min="0"
            step="0.1"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sodium (mg/100g)
          </label>
          <input
            type="number"
            value={formData.sodium_100mg}
            onChange={(e) => handleChange('sodium_100mg', e.target.value)}
            min="0"
            step="1"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-100 font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <X className="w-5 h-5" />
          Annuler
        </button>
        <button
          type="submit"
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          Créer l'aliment
        </button>
      </div>
    </form>
  );
}
