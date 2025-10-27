import React, { useState, useEffect, useMemo } from 'react';
import { X, Plus, Trash2, Save, Star } from 'lucide-react';
import { useNutrition } from '../../hooks/useNutrition';
import { FoodSearchModal } from './FoodSearchModal';

interface RecipeIngredient {
  nom: string;
  quantite_g: number;
  kcal_100g: number;
  proteines_100g: number;
  glucides_100g: number;
  lipides_100g: number;
  fibres_100g?: number;
  sodium_100mg?: number;
  potassium_100mg?: number;
}

interface RecipeCreatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RecipeCreator({ isOpen, onClose }: RecipeCreatorProps) {
  const [recipeName, setRecipeName] = useState('');
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [totalWeight, setTotalWeight] = useState(0);
  const [totalWeightUnit, setTotalWeightUnit] = useState<'g' | 'ml'>('g');
  const [defaultPortions, setDefaultPortions] = useState(1);
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { createRecette, addToFavoris } = useNutrition();

  useEffect(() => {
    const calculatedWeight = ingredients.reduce((acc, ing) => acc + ing.quantite_g, 0);
    setTotalWeight(calculatedWeight);
  }, [ingredients]);

  if (!isOpen) return null;

  const handleAddIngredient = (food: any, quantite_g: number) => {
    const ingredient: RecipeIngredient = {
      nom: food.nom,
      quantite_g,
      kcal_100g: food.kcal_100g,
      proteines_100g: food.proteines_100g,
      glucides_100g: food.glucides_100g,
      lipides_100g: food.lipides_100g,
      fibres_100g: food.fibres_100g,
      sodium_100mg: food.sodium_100mg,
      potassium_100mg: food.potassium_100mg,
    };
    setIngredients([...ingredients, ingredient]);
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const totals = useMemo(() => {
    return ingredients.reduce(
      (acc, ing) => {
        const ratio = ing.quantite_g / 100;
        return {
          kcal: acc.kcal + ing.kcal_100g * ratio,
          proteines: acc.proteines + ing.proteines_100g * ratio,
          glucides: acc.glucides + ing.glucides_100g * ratio,
          lipides: acc.lipides + ing.lipides_100g * ratio,
          fibres: acc.fibres + (ing.fibres_100g || 0) * ratio,
          sodium: acc.sodium + (ing.sodium_100mg || 0) * ratio,
          potassium: acc.potassium + (ing.potassium_100mg || 0) * ratio,
        };
      },
      { kcal: 0, proteines: 0, glucides: 0, lipides: 0, fibres: 0, sodium: 0, potassium: 0 }
    );
  }, [ingredients]);

  const handleSaveRecipe = async (addToFavorites: boolean = false) => {
    if (!recipeName.trim()) {
      alert('Veuillez donner un nom à votre recette');
      return;
    }

    if (ingredients.length === 0) {
      alert('Ajoutez au moins un ingrédient');
      return;
    }

    if (totalWeight <= 0) {
      alert('Veuillez entrer le poids total de la recette');
      return;
    }

    setIsSaving(true);
    try {
      const recipe = await createRecette({
        nom: recipeName,
        ingredients: ingredients.map((ing) => ({
          nom: ing.nom,
          quantite_g: ing.quantite_g,
          macros: {
            kcal: (ing.kcal_100g * ing.quantite_g) / 100,
            proteines: (ing.proteines_100g * ing.quantite_g) / 100,
            glucides: (ing.glucides_100g * ing.quantite_g) / 100,
            lipides: (ing.lipides_100g * ing.quantite_g) / 100,
          },
        })),
        poids_total_recette_g: totalWeight,
        nombre_portions_default: defaultPortions,
        kcal_total: totals.kcal,
        proteines_total_g: totals.proteines,
        glucides_total_g: totals.glucides,
        lipides_total_g: totals.lipides,
        fibres_total_g: totals.fibres,
        sodium_total_mg: totals.sodium,
        potassium_total_mg: totals.potassium,
      });

      if (addToFavorites && recipe) {
        await addToFavoris({
          nom: recipe.nom,
          kcal_100g: (totals.kcal / totalWeight) * 100,
          proteines_100g: (totals.proteines / totalWeight) * 100,
          glucides_100g: (totals.glucides / totalWeight) * 100,
          lipides_100g: (totals.lipides / totalWeight) * 100,
          fibres_100g: (totals.fibres / totalWeight) * 100,
          sodium_100mg: (totals.sodium / totalWeight) * 100,
          potassium_100mg: (totals.potassium / totalWeight) * 100,
          source_type: 'recette',
          source_id: recipe.id,
        });
      }

      setRecipeName('');
      setIngredients([]);
      setTotalWeight(0);
      setDefaultPortions(1);
      onClose();
    } catch (error) {
      console.error('Error saving recipe:', error);
      alert('Erreur lors de la sauvegarde de la recette');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <div className="p-6 border-b flex items-center justify-between bg-orange-50">
            <h2 className="text-2xl font-bold text-gray-900">Créer une recette</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de la recette *
                </label>
                <input
                  type="text"
                  value={recipeName}
                  onChange={(e) => setRecipeName(e.target.value)}
                  placeholder="Ex: Poulet au riz complet"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Portions par défaut *
                </label>
                <input
                  type="number"
                  min="1"
                  value={defaultPortions}
                  onChange={(e) => setDefaultPortions(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">Ingrédients</label>
                <button
                  onClick={() => setShowFoodModal(true)}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter un ingrédient
                </button>
              </div>

              {ingredients.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Aucun ingrédient ajouté</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {ingredients.map((ing, idx) => {
                    const macros = {
                      kcal: Math.round((ing.kcal_100g * ing.quantite_g) / 100),
                      p: Math.round(((ing.proteines_100g * ing.quantite_g) / 100) * 10) / 10,
                      g: Math.round(((ing.glucides_100g * ing.quantite_g) / 100) * 10) / 10,
                      l: Math.round(((ing.lipides_100g * ing.quantite_g) / 100) * 10) / 10,
                    };
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {ing.nom} - {ing.quantite_g}g
                          </p>
                          <p className="text-sm text-gray-600">
                            {macros.kcal} kcal | P: {macros.p}g | G: {macros.g}g | L: {macros.l}g
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveIngredient(idx)}
                          className="text-red-500 hover:text-red-700 ml-3"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="border-2 border-orange-200 rounded-lg p-6 bg-orange-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Totaux de la recette</h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Calories</p>
                  <p className="text-xl font-bold text-orange-600">{Math.round(totals.kcal)}</p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Protéines</p>
                  <p className="text-xl font-bold text-red-600">{Math.round(totals.proteines)}g</p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Glucides</p>
                  <p className="text-xl font-bold text-blue-600">{Math.round(totals.glucides)}g</p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Lipides</p>
                  <p className="text-xl font-bold text-yellow-600">{Math.round(totals.lipides)}g</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Poids total de la recette *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    value={totalWeight || ''}
                    onChange={(e) => setTotalWeight(Number(e.target.value))}
                    placeholder="Pesez votre recette finale"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                  />
                  <select
                    value={totalWeightUnit}
                    onChange={(e) => setTotalWeightUnit(e.target.value as 'g' | 'ml')}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 bg-white"
                  >
                    <option value="g">g</option>
                    <option value="ml">ml</option>
                  </select>
                </div>
                {totalWeight > 0 && (
                  <p className="text-sm text-gray-600 mt-2">
                    Par 100{totalWeightUnit}: {Math.round((totals.kcal / totalWeight) * 100)} kcal | P:{' '}
                    {Math.round(((totals.proteines / totalWeight) * 100) * 10) / 10}{totalWeightUnit} | G:{' '}
                    {Math.round(((totals.glucides / totalWeight) * 100) * 10) / 10}{totalWeightUnit} | L:{' '}
                    {Math.round(((totals.lipides / totalWeight) * 100) * 10) / 10}{totalWeightUnit}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="border-t bg-gray-50 p-6">
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
              >
                Annuler
              </button>
              <button
                onClick={() => handleSaveRecipe(true)}
                disabled={isSaving || !recipeName || ingredients.length === 0 || totalWeight <= 0}
                className="flex-1 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Star className="w-5 h-5" />
                Sauvegarder et ajouter aux favoris
              </button>
              <button
                onClick={() => handleSaveRecipe(false)}
                disabled={isSaving || !recipeName || ingredients.length === 0 || totalWeight <= 0}
                className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {isSaving ? 'Enregistrement...' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      </div>
      <FoodSearchModal
        isOpen={showFoodModal}
        onClose={() => setShowFoodModal(false)}
        onSelectFood={handleAddIngredient}
        confirmButtonText="Ajouter à la recette"
      />
    </>
  );
}