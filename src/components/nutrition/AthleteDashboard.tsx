import React, { useState } from 'react';
import { Plus, Weight, Trash2, ChefHat, ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { useNutrition } from '../../hooks/useNutrition';
import { FoodSearchModal } from './FoodSearchModal';
import { RecipeCreator } from './RecipeCreator';
import { ObjectifsModal } from './ObjectifsModal';

export function AthleteDashboard() {
  const [selectedType, setSelectedType] = useState<'haut' | 'bas' | 'repos'>('haut');
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [showRecipeCreator, setShowRecipeCreator] = useState(false);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [showObjectifsModal, setShowObjectifsModal] = useState(false);
  const [weightData, setWeightData] = useState({ poids: 0, masse_grasse: '' });
  const [currentDate, setCurrentDate] = useState(new Date());

  const {
    objectifs,
    journalToday,
    donneesCorpo,
    addToJournal,
    deleteFromJournal,
    addDonneesCorporelles,
  } = useNutrition(currentDate.toISOString().split('T')[0]);

  const currentObjectif = objectifs.find((o) => o.type_jour === selectedType);
  const selectedDateStr = currentDate.toISOString().split('T')[0];
  const today = new Date().toISOString().split('T')[0];
  const todayWeight = donneesCorpo.find((d) => d.date === selectedDateStr);

  const totals = journalToday.reduce(
    (acc, entry) => ({
      kcal: acc.kcal + Number(entry.kcal),
      proteines: acc.proteines + Number(entry.proteines_g),
      glucides: acc.glucides + Number(entry.glucides_g),
      lipides: acc.lipides + Number(entry.lipides_g),
    }),
    { kcal: 0, proteines: 0, glucides: 0, lipides: 0 }
  );

  const handleAddFood = async (food: any, quantite_g: number, tag_moment?: string) => {
    const ratio = quantite_g / 100;
    await addToJournal({
      date: selectedDateStr,
      tag_moment: tag_moment as any,
      aliment_nom: food.nom,
      quantite_g,
      kcal: food.kcal_100g * ratio,
      proteines_g: food.proteines_100g * ratio,
      glucides_g: food.glucides_100g * ratio,
      lipides_g: food.lipides_100g * ratio,
      fibres_g: food.fibres_100g ? food.fibres_100g * ratio : 0,
      sodium_mg: food.sodium_100mg ? food.sodium_100mg * ratio : 0,
      potassium_mg: food.potassium_100mg ? food.potassium_100mg * ratio : 0,
      hydratation_ml: 0,
    });
  };

  const handleAddWeight = async () => {
    if (weightData.poids <= 0) return;
    await addDonneesCorporelles({
      date: selectedDateStr,
      poids_kg: weightData.poids,
      masse_grasse_pct: weightData.masse_grasse ? Number(weightData.masse_grasse) : undefined,
    });
    setShowWeightModal(false);
    setWeightData({ poids: 0, masse_grasse: '' });
  };

  const ProgressBar = ({ current, target, label, unit, color }: any) => {
    const percentage = Math.min((current / target) * 100, 100);
    return (
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="font-medium text-gray-700">{label}</span>
          <span className="text-gray-600">
            {Math.round(current)} / {target} {unit}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${color}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  const mainMeals = ['repas_1', 'repas_2', 'repas_3', 'collation'];

  const groupedByMoment = journalToday.reduce((acc, entry) => {
    const moment = entry.tag_moment || 'autres';
    if (!acc[moment]) acc[moment] = [];
    acc[moment].push(entry);
    return acc;
  }, {} as Record<string, typeof journalToday>);

  const momentLabels: Record<string, string> = {
    repas_1: 'Petit déjeuner',
    repas_2: 'Déjeuner',
    repas_3: 'Dîner',
    collation: 'Collation',
    pre_entrainement: 'Pré-Entraînement',
    post_entrainement: 'Post-Entraînement',
    pre_sommeil: 'Pré-Sommeil',
    autres: 'Autres',
  };

  const mealIcons: Record<string, string> = {
    repas_1: '☀️',
    repas_2: '🍽️',
    repas_3: '🌙',
    collation: '🍎',
  };

  const calculateMealTotals = (entries: typeof journalToday) => {
    return entries.reduce((acc, entry) => ({
      kcal: acc.kcal + entry.kcal,
      proteines: acc.proteines + entry.proteines_g,
      glucides: acc.glucides + entry.glucides_g,
      lipides: acc.lipides + entry.lipides_g,
    }), { kcal: 0, proteines: 0, glucides: 0, lipides: 0 });
  };

  const goToPreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const getDateLabel = () => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const selectedStr = currentDate.toISOString().split('T')[0];

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    if (selectedStr === todayStr) return "Aujourd'hui";
    if (selectedStr === yesterdayStr) return "Hier";
    if (selectedStr === tomorrowStr) return "Demain";

    return currentDate.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const isToday = selectedDateStr === today;
  const isFuture = selectedDateStr > today;

  return (
    <div className="w-full min-h-screen bg-gray-50 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Tableau de Bord Nutrition</h1>
          <button
            onClick={() => setShowObjectifsModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            title="Configurer les objectifs"
          >
            <Settings className="w-5 h-5 text-gray-700" />
            <span className="hidden sm:inline text-sm font-medium text-gray-700">Objectifs</span>
          </button>
        </div>

        <div className="flex items-center justify-between mb-6 bg-gray-50 rounded-lg p-3">
          <button
            onClick={goToPreviousDay}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            aria-label="Jour précédent"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>

          <div className="flex flex-col items-center">
            <div className="text-lg font-bold text-gray-900">
              {getDateLabel()}
            </div>
            {!isToday && (
              <div className="text-xs text-gray-500">
                {currentDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            )}
          </div>

          <button
            onClick={goToNextDay}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            aria-label="Jour suivant"
          >
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4 sm:mb-6">
          {(['haut', 'bas', 'repos'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`w-full sm:w-auto px-4 sm:px-6 py-3 rounded-lg font-semibold transition-colors ${
                selectedType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type === 'haut' ? 'Jour Haut' : type === 'bas' ? 'Jour Bas' : 'Jour Repos'}
            </button>
          ))}
        </div>

        {currentObjectif ? (
          <div className="space-y-4">
            <ProgressBar
              current={totals.kcal}
              target={currentObjectif.kcal_objectif}
              label="Calories"
              unit="kcal"
              color="bg-orange-500"
            />
            <ProgressBar
              current={totals.proteines}
              target={currentObjectif.proteines_objectif_g}
              label="Protéines"
              unit="g"
              color="bg-red-500"
            />
            <ProgressBar
              current={totals.glucides}
              target={currentObjectif.glucides_objectif_g}
              label="Glucides"
              unit="g"
              color="bg-blue-500"
            />
            <ProgressBar
              current={totals.lipides}
              target={currentObjectif.lipides_objectif_g}
              label="Lipides"
              unit="g"
              color="bg-yellow-500"
            />
          </div>
        ) : (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 text-center">
            <p className="text-gray-700 mb-3">
              Aucun objectif configuré pour ce type de journée.
            </p>
            <button
              onClick={() => setShowObjectifsModal(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Configurer mes objectifs
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Journal Alimentaire</h2>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={() => setShowRecipeCreator(true)}
              className="w-full sm:w-auto px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center justify-center gap-2"
            >
              <ChefHat className="w-5 h-5" />
              <span className="sm:inline">Créer une recette</span>
            </button>
            <button
              onClick={() => setShowFoodModal(true)}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span>Ajouter un aliment</span>
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {mainMeals.map((meal) => {
            const entries = groupedByMoment[meal] || [];
            const mealTotals = calculateMealTotals(entries);

            return (
              <div key={meal} className="border-2 border-gray-200 rounded-xl overflow-hidden bg-white">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 sm:px-6 py-4 border-b-2 border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{mealIcons[meal]}</span>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                        {momentLabels[meal]}
                      </h3>
                    </div>
                    {entries.length > 0 && (
                      <div className="text-sm font-semibold text-gray-700">
                        {Math.round(mealTotals.kcal)} kcal
                      </div>
                    )}
                  </div>
                  {entries.length > 0 && (
                    <div className="mt-2 flex gap-4 text-xs sm:text-sm text-gray-600">
                      <span>P: {Math.round(mealTotals.proteines)}g</span>
                      <span>G: {Math.round(mealTotals.glucides)}g</span>
                      <span>L: {Math.round(mealTotals.lipides)}g</span>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  {entries.length === 0 ? (
                    <div className="text-center py-6 text-gray-400">
                      <p className="text-sm">Aucun aliment ajouté</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {entries.map((entry) => (
                        <div key={entry.id} className="flex items-start sm:items-center justify-between p-3 bg-gray-50 rounded-lg gap-3 hover:bg-gray-100 transition-colors">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm sm:text-base break-words">
                              {entry.aliment_nom}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600 flex flex-wrap gap-x-3 mt-1">
                              <span className="font-semibold">{Math.round(entry.quantite_g)}g</span>
                              <span>{Math.round(entry.kcal)} kcal</span>
                              <span>P: {Math.round(entry.proteines_g)}g</span>
                              <span>G: {Math.round(entry.glucides_g)}g</span>
                              <span>L: {Math.round(entry.lipides_g)}g</span>
                            </p>
                          </div>
                          <button
                            onClick={() => deleteFromJournal(entry.id)}
                            className="text-red-500 hover:text-red-700 flex-shrink-0"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {Object.entries(groupedByMoment)
            .filter(([moment]) => !mainMeals.includes(moment))
            .map(([moment, entries]) => (
              <div key={moment} className="border border-gray-200 rounded-lg bg-white p-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-3">
                  {momentLabels[moment]}
                </h3>
                <div className="space-y-2">
                  {entries.map((entry) => (
                    <div key={entry.id} className="flex items-start sm:items-center justify-between p-3 bg-gray-50 rounded-lg gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm sm:text-base break-words">
                          {entry.aliment_nom} - {Math.round(entry.quantite_g)}g
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 flex flex-wrap gap-x-2">
                          <span>{Math.round(entry.kcal)} kcal</span>
                          <span>P: {Math.round(entry.proteines_g)}g</span>
                          <span>G: {Math.round(entry.glucides_g)}g</span>
                          <span>L: {Math.round(entry.lipides_g)}g</span>
                        </p>
                      </div>
                      <button
                        onClick={() => deleteFromJournal(entry.id)}
                        className="text-red-500 hover:text-red-700 flex-shrink-0"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>

      {showWeightModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-md">
            <h3 className="text-lg sm:text-xl font-bold mb-4">Ajouter ma pesée</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Poids (kg) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={weightData.poids || ''}
                  onChange={(e) => setWeightData({ ...weightData, poids: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Masse grasse (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={weightData.masse_grasse}
                  onChange={(e) => setWeightData({ ...weightData, masse_grasse: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Optionnel"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowWeightModal(false)}
                  className="w-full sm:flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddWeight}
                  disabled={weightData.poids <= 0}
                  className="w-full sm:flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <FoodSearchModal
        isOpen={showFoodModal}
        onClose={() => setShowFoodModal(false)}
        onSelectFood={handleAddFood}
      />

      <RecipeCreator
        isOpen={showRecipeCreator}
        onClose={() => setShowRecipeCreator(false)}
      />

      <ObjectifsModal
        isOpen={showObjectifsModal}
        onClose={() => setShowObjectifsModal(false)}
      />
      </div>
    </div>
  );
}