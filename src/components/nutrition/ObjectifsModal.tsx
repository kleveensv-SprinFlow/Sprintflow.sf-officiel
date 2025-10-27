import React, { useState, useEffect } from 'react';
import { Target, X } from 'lucide-react';
import { useNutrition } from '../../hooks/useNutrition';

interface ObjectifsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ObjectifsModal({ isOpen, onClose }: ObjectifsModalProps) {
  const { objectifs, createOrUpdateObjectif } = useNutrition();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    kcal_haut: 2800,
    proteines_haut: 180,
    glucides_haut: 350,
    lipides_haut: 70,
    kcal_bas: 2200,
    proteines_bas: 180,
    glucides_bas: 200,
    lipides_bas: 80,
    kcal_repos: 1800,
    proteines_repos: 150,
    glucides_repos: 150,
    lipides_repos: 70,
  });

  useEffect(() => {
    if (objectifs.length > 0) {
      const haut = objectifs.find(o => o.type_jour === 'haut');
      const bas = objectifs.find(o => o.type_jour === 'bas');
      const repos = objectifs.find(o => o.type_jour === 'repos');

      setFormData({
        kcal_haut: haut?.kcal_objectif || 2800,
        proteines_haut: haut?.proteines_objectif_g || 180,
        glucides_haut: haut?.glucides_objectif_g || 350,
        lipides_haut: haut?.lipides_objectif_g || 70,
        kcal_bas: bas?.kcal_objectif || 2200,
        proteines_bas: bas?.proteines_objectif_g || 180,
        glucides_bas: bas?.glucides_objectif_g || 200,
        lipides_bas: bas?.lipides_objectif_g || 80,
        kcal_repos: repos?.kcal_objectif || 1800,
        proteines_repos: repos?.proteines_objectif_g || 150,
        glucides_repos: repos?.glucides_objectif_g || 150,
        lipides_repos: repos?.lipides_objectif_g || 70,
      });
    }
  }, [objectifs]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await createOrUpdateObjectif({
        type_jour: 'haut',
        kcal_objectif: Number(formData.kcal_haut) || 0,
        proteines_objectif_g: Number(formData.proteines_haut) || 0,
        glucides_objectif_g: Number(formData.glucides_haut) || 0,
        lipides_objectif_g: Number(formData.lipides_haut) || 0,
      });

      await createOrUpdateObjectif({
        type_jour: 'bas',
        kcal_objectif: Number(formData.kcal_bas) || 0,
        proteines_objectif_g: Number(formData.proteines_bas) || 0,
        glucides_objectif_g: Number(formData.glucides_bas) || 0,
        lipides_objectif_g: Number(formData.lipides_bas) || 0,
      });

      await createOrUpdateObjectif({
        type_jour: 'repos',
        kcal_objectif: Number(formData.kcal_repos) || 0,
        proteines_objectif_g: Number(formData.proteines_repos) || 0,
        glucides_objectif_g: Number(formData.glucides_repos) || 0,
        lipides_objectif_g: Number(formData.lipides_repos) || 0,
      });

      onClose();
    } catch (error) {
      console.error('Error saving objectives:', error);
      alert('Erreur lors de la sauvegarde des objectifs');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-4xl w-full my-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Mes Objectifs Nutritionnels</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          Définissez vos objectifs pour 3 types de journées : Jour Haut (entraînement intense),
          Jour Bas (entraînement léger), et Jour Repos.
        </p>

        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
          <div className="border-2 border-blue-200 rounded-xl p-6 bg-blue-50">
            <h3 className="text-xl font-semibold text-blue-900 mb-4">Jour Haut</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kcal</label>
                <input
                  type="number"
                  value={formData.kcal_haut}
                  onChange={(e) => setFormData({ ...formData, kcal_haut: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Protéines (g)</label>
                <input
                  type="number"
                  value={formData.proteines_haut}
                  onChange={(e) => setFormData({ ...formData, proteines_haut: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Glucides (g)</label>
                <input
                  type="number"
                  value={formData.glucides_haut}
                  onChange={(e) => setFormData({ ...formData, glucides_haut: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lipides (g)</label>
                <input
                  type="number"
                  value={formData.lipides_haut}
                  onChange={(e) => setFormData({ ...formData, lipides_haut: Number(e.target.value) })}
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
                  type="number"
                  value={formData.kcal_bas}
                  onChange={(e) => setFormData({ ...formData, kcal_bas: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Protéines (g)</label>
                <input
                  type="number"
                  value={formData.proteines_bas}
                  onChange={(e) => setFormData({ ...formData, proteines_bas: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Glucides (g)</label>
                <input
                  type="number"
                  value={formData.glucides_bas}
                  onChange={(e) => setFormData({ ...formData, glucides_bas: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lipides (g)</label>
                <input
                  type="number"
                  value={formData.lipides_bas}
                  onChange={(e) => setFormData({ ...formData, lipides_bas: Number(e.target.value) })}
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
                  type="number"
                  value={formData.kcal_repos}
                  onChange={(e) => setFormData({ ...formData, kcal_repos: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Protéines (g)</label>
                <input
                  type="number"
                  value={formData.proteines_repos}
                  onChange={(e) => setFormData({ ...formData, proteines_repos: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Glucides (g)</label>
                <input
                  type="number"
                  value={formData.glucides_repos}
                  onChange={(e) => setFormData({ ...formData, glucides_repos: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lipides (g)</label>
                <input
                  type="number"
                  value={formData.lipides_repos}
                  onChange={(e) => setFormData({ ...formData, lipides_repos: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 font-semibold transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}
