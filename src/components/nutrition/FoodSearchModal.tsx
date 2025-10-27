import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Fuse from 'fuse.js';
import { X, Search, Star, Plus, Camera } from 'lucide-react';
import { useNutrition } from '../../hooks/useNutrition';
import { BarcodeScanner } from './BarcodeScanner';
import { MacroDonutChart } from './MacroDonutChart';
import { CustomFoodForm } from './CustomFoodForm';
import { FoodItem, UnitOption, OpenFoodFactsProduct } from '../../types';
import ciqualData from './ciqual.json';

// Constants and Helpers (outside component)

const UNIT_KEYWORDS: { [key: string]: { label: string; grams: number } } = {
    'œuf': { label: 'œuf', grams: 55 },
    'oeuf': { label: 'œuf', grams: 55 },
    'yaourt': { label: 'yaourt', grams: 125 },
    'biscuit': { label: 'biscuit', grams: 15 },
    'tranche': { label: 'tranche', grams: 25 },
    'sablé': { label: 'sablé', grams: 20 },
    'cookie': { label: 'cookie', grams: 20 },
    'galette': { label: 'galette', grams: 30 },
    'cracotte': { label: 'cracotte', grams: 8 },
    'carré': { label: 'carré', grams: 10 },
    'banane': { label: 'banane', grams: 120 },
    'pomme': { label: 'pomme', grams: 150 },
    'clémentine': { label: 'clémentine', grams: 50 },
    'nectarine': { label: 'nectarine', grams: 130 }
  };
  
  const LIQUID_KEYWORDS = ['lait', 'jus', 'eau', 'soda', 'boisson', 'nectar', 'soupe', 'milk', 'drink', 'juice'];
  
  const tagLabels: Record<string, string> = {
    repas_1: 'Petit déjeuner',
    repas_2: 'Déjeuner',
    repas_3: 'Dîner',
    collation: 'Collation',
    pre_entrainement: 'Pré-Entraînement',
    post_entrainement: 'Post-Entraînement',
    pre_sommeil: 'Pré-Sommeil',
    autres: 'Autres'
  };
  
  const parseNumericValue = (value: any): number => {
    if (value === null || value === undefined || value === '' || value === '-') return 0;
    if (typeof value === 'number') return value;
    const strValue = String(value).replace(',', '.');
    const parsed = parseFloat(strValue);
    return isNaN(parsed) ? 0 : parsed;
  };

  const getNutrientValue = (nutriments: any, key: string): number => {
    try {
      return parseNumericValue(nutriments?.[key]);
    } catch (error) {
      console.error(`Error parsing nutrient ${key}:`, error);
      return 0;
    }
  };

  const getCalories = (nutriments: any): number => {
    try {
      const kcal = getNutrientValue(nutriments, 'energy-kcal_100g');
      if (kcal > 0) return kcal;
      const energy = getNutrientValue(nutriments, 'energy_100g');
      return energy > 0 ? energy / 4.184 : 0;
    } catch (error) {
      console.error('Error calculating calories:', error);
      return 0;
    }
  };

  const mapOFFProductToFoodItem = (food: OpenFoodFactsProduct): FoodItem => {
    try {
      return {
        nom: food.product_name || 'Produit sans nom',
        kcal_100g: getCalories(food.nutriments),
        proteines_100g: getNutrientValue(food.nutriments, 'proteins_100g'),
        glucides_100g: getNutrientValue(food.nutriments, 'carbohydrates_100g'),
        lipides_100g: getNutrientValue(food.nutriments, 'fat_100g'),
        fibres_100g: getNutrientValue(food.nutriments, 'fiber_100g'),
        sodium_100mg: getNutrientValue(food.nutriments, 'sodium_100g') * 1000,
        source_type: 'off',
        source_id: food.code,
      };
    } catch (error) {
      console.error('Error mapping OFF product:', error, food);
      throw error;
    }
  };

  const mapCiqualToFoodItem = (food: any): FoodItem => {
    try {
      return {
        nom: food.alim_nom_fr || 'Aliment sans nom',
        kcal_100g: parseNumericValue(food['Energie, N x facteur Jones, avec fibres  (kcal/100 g)']),
        proteines_100g: parseNumericValue(food['Protéines, N x 6.25 (g/100 g)']),
        glucides_100g: parseNumericValue(food['Glucides (g/100 g)']),
        lipides_100g: parseNumericValue(food['Lipides (g/100 g)']),
        source_type: 'ciqual',
        source_id: food.alim_code,
      };
    } catch (error) {
      console.error('Error mapping Ciqual food:', error, food);
      throw error;
    }
  };

// Sub-components

const FoodListItem: React.FC<{
    food: FoodItem;
    isFavorite: boolean;
    onSelect: () => void;
    onToggleFavorite: () => void;
  }> = ({ food, isFavorite, onSelect, onToggleFavorite }) => (
    <div
      onClick={onSelect}
      className="border-2 border-gray-200 rounded-lg p-4 hover:border-green-500 hover:bg-green-50 cursor-pointer transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg mb-1">{food.nom}</h3>
          {(food as any).brands && <p className="text-sm text-gray-600 mb-2">{(food as any).brands}</p>}
          <div className="flex items-center gap-2">
            <div className="flex flex-wrap gap-3 text-sm">
                <span className="text-orange-600 font-medium">{Math.round(food.kcal_100g)} kcal</span>
                <span className="text-gray-500">|</span>
                <span className="text-red-600">P: {food.proteines_100g.toFixed(1)}g</span>
                <span className="text-blue-600">G: {food.glucides_100g.toFixed(1)}g</span>
                <span className="text-yellow-600">L: {food.lipides_100g.toFixed(1)}g</span>
            </div>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${food.source_type === 'ciqual' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                {food.source_type === 'ciqual' ? 'CIQUAL' : 'OFF'}
            </span>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className={`p-2 rounded-lg transition-colors ml-3 ${
            isFavorite
              ? 'bg-yellow-400 text-white'
              : 'bg-gray-200 text-gray-600 hover:bg-yellow-100'
          }`}
        >
          <Star className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
  

type SearchSource = 'all' | 'favorites';

interface FoodSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFood?: (food: any, quantity: number, tag?: string) => void;
  confirmButtonText?: string;
}

export function FoodSearchModal({ isOpen, onClose, onSelectFood, confirmButtonText = 'Ajouter au journal' }: FoodSearchModalProps) {
  const [view, setView] = useState<'search' | 'details' | 'create'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState(100);
  const [selectedTag, setSelectedTag] = useState<string>('repas_1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const { favoris, addToFavoris, removeFromFavoris, isFavorite } = useNutrition();
  const [availableUnits, setAvailableUnits] = useState<UnitOption[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<UnitOption>({ label: 'g', grams: 1 });
  const [searchSource, setSearchSource] = useState<SearchSource>('all');

  const resetState = () => {
    setView('search');
    setSearchQuery('');
    setSearchResults([]);
    setSelectedFood(null);
    setQuantity(100);
    setSelectedTag('repas_1');
    setShowScanner(false);
    setSearchSource('all');
    setError(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const searchFoods = useCallback(async () => {
    if (searchQuery.length < 3) return;
    setLoading(true);
    setError(null);

    try {
      // Recherche sur Open Food Facts
      const offPromise = fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(searchQuery)}&page_size=50&json=true&fields=code,product_name,brands,categories,nutriments,image_url`)
        .then(res => {
          if (!res.ok) throw new Error('Erreur lors de la recherche Open Food Facts');
          return res.json();
        })
        .then(data => {
          if (data.products && data.products.length > 0) {
            return data.products
              .filter((p: any) => {
                try {
                  return p.product_name && p.nutriments && (p.nutriments['energy-kcal_100g'] || p.nutriments['energy_100g']);
                } catch (e) {
                  console.error('Error filtering OFF product:', e, p);
                  return false;
                }
              })
              .filter((p: any) => p.product_name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((p: any) => {
                try {
                  return mapOFFProductToFoodItem(p);
                } catch (e) {
                  console.error('Error mapping OFF product:', e, p);
                  return null;
                }
              })
              .filter((p: any) => p !== null);
          }
          return [];
        })
        .catch(error => {
          console.error('Error fetching from Open Food Facts:', error);
          return [];
        });

      // Recherche dans CIQUAL avec Fuse.js
      const ciqualFuse = new Fuse(ciqualData, {
        keys: ['alim_nom_fr'],
        includeScore: true,
        threshold: 0.4,
      });
      const ciqualResults = ciqualFuse.search(searchQuery).map(result => mapCiqualToFoodItem(result.item));

      const [offResults] = await Promise.all([offPromise]);

      // Filtrer les résultats OFF avec Fuse pour pertinence
      const offFuse = new Fuse(offResults, {
        keys: ['nom'],
        includeScore: true,
        threshold: 0.4,
      });
      const filteredOffResults = offFuse.search(searchQuery).map(result => result.item);

      setSearchResults([...ciqualResults, ...filteredOffResults]);
    } catch (error) {
      console.error('Error during search:', error);
      setError('Une erreur est survenue lors de la recherche. Veuillez réessayer.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (searchSource === 'all') {
      const debounce = setTimeout(() => {
        searchFoods();
      }, 500);
      return () => clearTimeout(debounce);
    }
  }, [searchQuery, searchFoods, searchSource]);

  const filteredFavorites = useMemo(() => {
    if (searchSource !== 'favorites') return [];
    if (searchQuery.length > 0) {
      const lowercasedQuery = searchQuery.toLowerCase();
      return favoris.filter(fav =>
        fav.nom.toLowerCase().includes(lowercasedQuery)
      );
    }
    return favoris;
  }, [searchQuery, favoris, searchSource]);

  const handleSetSearchSource = (source: SearchSource) => {
    if (source !== searchSource) {
      setSearchQuery('');
      setSearchResults([]);
      setSearchSource(source);
    }
  };

  const getAvailableUnits = (food: FoodItem): UnitOption[] => {
    const units: UnitOption[] = [{ label: 'g', grams: 1 }];
    const foodNameLower = food.nom.toLowerCase();

    for (const key in UNIT_KEYWORDS) {
      if (foodNameLower.includes(key)) {
        if (!units.some(u => u.label !== 'g' && u.label !== 'ml')) {
          units.push(UNIT_KEYWORDS[key]);
        }
        break;
      }
    }

    const isLiquid = LIQUID_KEYWORDS.some(key => foodNameLower.includes(key));
    if (isLiquid && !units.some(u => u.label === 'ml')) {
      units.push({ label: 'ml', grams: 1 });
    }

    return units;
  };

  useEffect(() => {
    if (selectedFood) {
      const units = getAvailableUnits(selectedFood);
      setAvailableUnits(units);
      const defaultUnit = units.find(u => u.grams > 1) || units[0];
      setSelectedUnit(defaultUnit);
      if (defaultUnit.grams > 1) {
        setQuantity(1);
      } else {
        setQuantity(100);
      }
    }
  }, [selectedFood]);

  const handleBarcodeScanned = async (barcode: string) => {
    setShowScanner(false);
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
      if (!response.ok) throw new Error('Erreur lors de la récupération du produit');
      const data = await response.json();

      if (data.status === 1 && data.product) {
        handleSelectFood(mapOFFProductToFoodItem(data.product));
      } else {
        setError('Produit non trouvé dans Open Food Facts');
      }
    } catch (error) {
      console.error('Error fetching product from Open Food Facts:', error);
      setError('Erreur lors de la recherche du produit');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFood = (food: FoodItem) => {
    setSelectedFood(food);
    setView('details');
  };

  const handleSaveCustomFood = (food: FoodItem) => {
    handleSelectFood(food);
  };

  const handleAddFood = () => {
    if (!selectedFood || !onSelectFood) return;

    const totalGrams = quantity * selectedUnit.grams;
    onSelectFood(selectedFood, totalGrams, selectedTag);
    handleClose();
  };

  const handleToggleFavorite = async (food: FoodItem) => {
    const fav = isFavorite(food.nom, food.source_type, food.source_id);
    try {
      if (fav) {
        await removeFromFavoris(fav.id);
      } else {
        await addToFavoris(food);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Erreur lors de la gestion des favoris');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <div className="bg-gradient-to-r from-green-600 to-green-500 p-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              {view === 'create' ? 'Créer un aliment' : 'Rechercher un aliment'}
            </h2>
            <button onClick={handleClose} className="p-2 hover:bg-green-700 rounded-lg transition-colors">
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          <div className="p-6 flex-1 overflow-y-auto">
            {view === 'search' && (
              <div>
                <div className="flex border-b-2 border-gray-200 mb-4">
                  <button
                    onClick={() => handleSetSearchSource('all')}
                    className={`flex-1 py-3 text-center font-semibold transition-colors ${
                      searchSource === 'all'
                        ? 'border-b-4 border-green-600 text-green-600'
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    Recherche
                  </button>
                  <button
                    onClick={() => handleSetSearchSource('favorites')}
                    className={`flex-1 py-3 text-center font-semibold transition-colors ${
                      searchSource === 'favorites'
                        ? 'border-b-4 border-green-600 text-green-600'
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    Mes favoris
                  </button>
                </div>

                <div className="mb-6">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Rechercher (ex: poivron...)"
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none text-lg"
                        autoFocus
                      />
                    </div>
                    {searchSource === 'all' && (
                      <button
                        onClick={() => setShowScanner(true)}
                        className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-2"
                        title="Scanner un code-barres"
                      >
                        <Camera className="w-5 h-5 text-white" />
                        <span className="text-white font-semibold hidden sm:inline">Scanner</span>
                      </button>
                    )}
                  </div>
                  {searchSource === 'all' && (
                    <p className="text-xs text-gray-500 mt-2">Recherchez dans Open Food Facts & CIQUAL</p>
                  )}
                </div>

                {searchSource === 'all' && (
                  <>
                    {error && (
                      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-4">
                        <p className="text-red-600 font-semibold">{error}</p>
                        <button
                          onClick={() => {
                            setError(null);
                            searchFoods();
                          }}
                          className="mt-2 text-sm text-red-600 hover:underline"
                        >
                          Réessayer
                        </button>
                      </div>
                    )}
                    {loading ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Recherche...</p>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600 mb-4">{searchResults.length} résultat{searchResults.length > 1 ? 's' : ''}</p>
                        {searchResults.map((food) => (
                            <FoodListItem
                              key={`${food.source_type}-${food.source_id || food.nom}`}
                              food={food}
                              isFavorite={isFavorite(food.nom, food.source_type, food.source_id)}
                              onSelect={() => handleSelectFood(food)}
                              onToggleFavorite={() => handleToggleFavorite(food)}
                            />
                          ))}
                      </div>
                    ) : searchQuery.length >= 3 ? (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">🔍</div>
                        <p className="text-gray-600">Aucun aliment trouvé pour "{searchQuery}"</p>
                        <button
                          onClick={() => setView('create')}
                          className="mt-4 text-sm text-green-600 font-semibold hover:underline"
                        >
                          Ou créer un aliment personnalisé
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">🍎</div>
                        <p className="text-gray-600 mb-2">Tapez au moins 3 caractères pour rechercher</p>
                        <p className="text-sm text-gray-500">Ou utilisez le scanner de code-barres</p>
                      </div>
                    )}
                  </>
                )}

                {searchSource === 'favorites' && (
                  <div>
                    {favoris.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">⭐️</div>
                        <p className="text-gray-600">Vous n'avez pas encore d'aliments favoris.</p>
                        <p className="text-sm text-gray-500">Ajoutez-en en cliquant sur l'étoile !</p>
                      </div>
                    ) : filteredFavorites.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600 mb-4">{filteredFavorites.length} favori{filteredFavorites.length > 1 ? 's' : ''} trouvé{filteredFavorites.length > 1 ? 's' : ''}</p>
                        {filteredFavorites.map((food) => (
                          <FoodListItem
                            key={`${food.source_type}-${food.source_id || food.nom}`}
                            food={food}
                            isFavorite={true} // All items in this list are favorites
                            onSelect={() => handleSelectFood(food)}
                            onToggleFavorite={() => handleToggleFavorite(food)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">🤷</div>
                        <p className="text-gray-600">Aucun favori trouvé pour "{searchQuery}"</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {view === 'create' && (
              <CustomFoodForm
                initialQuery={searchQuery}
                onSave={handleSaveCustomFood}
                onCancel={() => setView('search')}
              />
            )}

            {view === 'details' && selectedFood && (
              <div className="space-y-6">
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedFood.nom}</h3>
                    </div>
                    <div className="flex items-center gap-4">
                      <MacroDonutChart
                        data={{
                          proteins: selectedFood.proteines_100g,
                          carbs: selectedFood.glucides_100g,
                          fats: selectedFood.lipides_100g
                        }}
                      />
                      <button
                        onClick={() => handleToggleFavorite(selectedFood)}
                        className={`p-2 rounded-lg transition-colors ${
                          isFavorite(selectedFood.nom, selectedFood.source_type, selectedFood.source_id)
                            ? 'bg-yellow-400 text-white'
                            : 'bg-gray-200 text-gray-600 hover:bg-yellow-100'
                        }`}
                      >
                        <Star className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg p-3 border border-green-200">
                      <p className="text-xs text-gray-500 mb-1">Calories</p>
                      <p className="text-xl font-bold text-orange-600">{Math.round(selectedFood.kcal_100g)} kcal</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-green-200">
                      <p className="text-xs text-gray-500 mb-1">Protéines</p>
                      <p className="text-xl font-bold text-red-600">{selectedFood.proteines_100g.toFixed(1)} g</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-green-200">
                      <p className="text-xs text-gray-500 mb-1">Glucides</p>
                      <p className="text-xl font-bold text-blue-600">{selectedFood.glucides_100g.toFixed(1)} g</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-green-200">
                      <p className="text-xs text-gray-500 mb-1">Lipides</p>
                      <p className="text-xl font-bold text-yellow-600">{selectedFood.lipides_100g.toFixed(1)} g</p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 text-center">Valeurs pour 100g</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantité</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        min="1"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none text-lg"
                      />
                      <select
                        value={selectedUnit.label}
                        onChange={(e) => {
                          const unit = availableUnits.find(u => u.label === e.target.value);
                          if (unit) setSelectedUnit(unit);
                        }}
                        disabled={availableUnits.length <= 1}
                        className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none text-lg bg-white"
                      >
                        {availableUnits.map(unit => (
                          <option key={unit.label} value={unit.label}>{unit.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Moment</label>
                    <select
                      value={selectedTag}
                      onChange={(e) => setSelectedTag(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none text-lg"
                    >
                      {Object.entries(tagLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Pour {quantity} {selectedUnit.label}, vous consommerez :
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Calories: </span>
                      <span className="font-bold text-orange-600">
                        {Math.round((selectedFood.kcal_100g * quantity * selectedUnit.grams) / 100)} kcal
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Protéines: </span>
                      <span className="font-bold text-red-600">
                        {Math.round((selectedFood.proteines_100g * quantity * selectedUnit.grams) / 100)} g
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Glucides: </span>
                      <span className="font-bold text-blue-600">
                        {Math.round((selectedFood.glucides_100g * quantity * selectedUnit.grams) / 100)} g
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Lipides: </span>
                      <span className="font-bold text-yellow-600">
                        {Math.round((selectedFood.lipides_100g * quantity * selectedUnit.grams) / 100)} g
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setView('search')}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-100 font-semibold transition-colors"
                  >
                    Retour
                  </button>
                  <button
                    onClick={handleAddFood}
                    disabled={quantity <= 0}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    {confirmButtonText}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <BarcodeScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScanSuccess={handleBarcodeScanned}
      />
    </>
  );
}