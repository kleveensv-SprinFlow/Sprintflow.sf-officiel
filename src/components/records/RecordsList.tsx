import React, { useMemo, useState } from 'react';
import { Trophy, Plus, Clock, Weight, Trash2, TrendingUp, TrendingDown, Minus, Target, MapPin, Filter, Play, Dumbbell } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Record } from '../../types';
import { useRecords } from '../../hooks/useRecords';
import { formatTime } from '../../utils/formatters';
import { LoadingScreen } from '../LoadingScreen';

interface RecordsListProps {
  onAddRecord?: () => void;
}

export const RecordsList: React.FC<RecordsListProps> = ({ onAddRecord }) => {
  const { records, loading, deleteRecord } = useRecords();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'run' | 'jump' | 'throw' | 'exercise'>('all');
  const [shoeFilter, setShoeFilter] = useState<'all' | 'spikes' | 'sneakers'>('all');

  const handleAddRecord = () => {
    if (onAddRecord) {
      onAddRecord();
    } else {
      // Déclencher l'ouverture du formulaire d'ajout de record
      const event = new CustomEvent('open-form', { detail: 'add-record' });
      window.dispatchEvent(event);
    }
  };

  const groupedRecords = useMemo(() => {
    if (!records) return {};

    // Filtrer par catégorie sélectionnée
    let filteredRecords = selectedCategory === 'all'
      ? records
      : records.filter(record => record.type === selectedCategory);

    // Filtrer par type de chaussures si catégorie courses
    if (selectedCategory === 'run' && shoeFilter !== 'all') {
      filteredRecords = filteredRecords.filter(record => record.shoe_type === shoeFilter);
    }
    
    const groups: { [key: string]: Record[] } = {};
    filteredRecords.forEach(record => {
      // Créer une clé unique incluant le type de chaussures pour les courses/sauts/lancers
      const key = (record.type === 'run' || record.type === 'jump' || record.type === 'throw') && record.shoe_type
        ? `${record.name} (${record.shoe_type === 'spikes' ? 'Pointes' : 'Baskets'})`
        : record.name;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(record);
    });
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    });
    return groups;
  }, [records, selectedCategory, shoeFilter]);

  // Statistiques par catégorie
  const categoryStats = useMemo(() => {
    if (!records) return { run: 0, jump: 0, throw: 0, exercise: 0 };
    
    return {
      run: records.filter(r => r.type === 'run').length,
      jump: records.filter(r => r.type === 'jump').length,
      throw: records.filter(r => r.type === 'throw').length,
      exercise: records.filter(r => r.type === 'exercise').length
    };
  }, [records]);

  const toggleGroupExpansion = (groupKey: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupKey)) {
        newSet.delete(groupKey);
      } else {
        newSet.add(groupKey);
      }
      return newSet;
    });
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce record ?')) {
      await deleteRecord(id);
    }
  };

  const getEvolutionTrend = (recordsGroup: Record[]) => {
    if (recordsGroup.length < 2) return 'stable';
    const first = recordsGroup[0];
    const last = recordsGroup[recordsGroup.length - 1];
    if (first.type === 'run') {
      return last.value < first.value ? 'improving' : last.value > first.value ? 'declining' : 'stable';
    }
    if (first.type === 'jump') {
      return last.value > first.value ? 'improving' : last.value < first.value ? 'declining' : 'stable';
    }
    return last.value > first.value ? 'improving' : last.value < first.value ? 'declining' : 'stable';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getBestValue = (recordsGroup: Record[]) => {
    const recordType = recordsGroup[0].type;
    return recordType === 'run'
      ? Math.min(...recordsGroup.map(r => r.value))
      : Math.max(...recordsGroup.map(r => r.value));
  };

  const formatChartData = (recordsGroup: Record[]) => {
    return recordsGroup
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((record, index) => ({
      date: format(new Date(record.date), 'dd/MM', { locale: fr }),
      value: record.value,
      fullDate: record.date,
      attempt: index + 1,
      isRecord: record.value === getBestValue(recordsGroup)
    }));
  };

  if (loading) {
    return <LoadingScreen message="Chargement des records..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white text-shadow-light dark:text-shadow-dark">Résultats</h1>
        <button
          onClick={handleAddRecord}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          <span>Nouveau résultat</span>
        </button>
      </div>

      {/* Filtre compact par catégorie */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Catégorie :
          </label>
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value as any);
            if (e.target.value !== 'run') {
              setShoeFilter('all');
            }
          }}
          className="px-3 py-2 bg-white/20 dark:bg-black/20 border border-white/30 rounded-lg text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent backdrop-blur-md dark:backdrop-blur-sm"
        >
          <option value="all">🏆 Tous les records ({records?.length || 0})</option>
          <option value="run">🏃 Courses ({categoryStats.run})</option>
          <option value="jump">🦘 Sauts ({categoryStats.jump})</option>
          <option value="throw">🎯 Lancers ({categoryStats.throw})</option>
          <option value="exercise">💪 Exercices ({categoryStats.exercise})</option>
        </select>

        {/* Filtre chaussures pour les courses */}
        {selectedCategory === 'run' && (
          <select
            value={shoeFilter}
            onChange={(e) => setShoeFilter(e.target.value as any)}
            className="px-3 py-2 bg-white/20 dark:bg-black/20 border border-white/30 rounded-lg text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent backdrop-blur-md dark:backdrop-blur-sm"
          >
            <option value="all">👟 Tous les types</option>
            <option value="spikes">👟 Pointes uniquement</option>
            <option value="sneakers">👟 Baskets uniquement</option>
          </select>
        )}
      </div>

      {!records || records.length === 0 ? (
        <div className="bg-white/10 dark:bg-black/10 backdrop-blur-md dark:backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-8 text-center">
          <Trophy className="h-16 w-16 text-gray-700 dark:text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-800 dark:text-white mb-2 text-shadow-light dark:text-shadow-dark">Aucun résultat</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-6 text-shadow-light dark:text-shadow-dark">Enregistrez vos performances pour suivre vos progrès.</p>
          <button
            onClick={handleAddRecord}
            className="btn-primary"
          >
            Premier résultat
          </button>
        </div>
      ) : Object.keys(groupedRecords).length === 0 ? (
        <div className="bg-white/10 dark:bg-black/10 backdrop-blur-md dark:backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-8 text-center">
          <Filter className="h-16 w-16 text-gray-700 dark:text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-800 dark:text-white mb-2 text-shadow-light dark:text-shadow-dark">
            Aucun record dans cette catégorie
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-6 text-shadow-light dark:text-shadow-dark">
            Sélectionnez une autre catégorie ou ajoutez un nouveau record.
          </p>
          <button
            onClick={() => setSelectedCategory('all')}
            className="btn-primary mr-3"
          >
            Voir tous les records
          </button>
          <button
            onClick={handleAddRecord}
            className="btn-primary"
          >
            Ajouter un record
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedRecords)
            .sort(([keyA, recordsA], [keyB, recordsB]) => {
              const recordA = recordsA[0];
              const recordB = recordsB[0];

              // Extraire la distance des noms (ex: "100m", "200m", "400m")
              const extractDistance = (name: string): number => {
                const match = name.match(/(\d+(?:\.\d+)?)\s*m/);
                return match ? parseFloat(match[1]) : Infinity;
              };

              const distanceA = extractDistance(recordA.name);
              const distanceB = extractDistance(recordB.name);

              // Si les deux ont une distance, trier par distance
              if (distanceA !== Infinity && distanceB !== Infinity) {
                return distanceA - distanceB;
              }

              // Sinon, trier alphabétiquement
              return keyA.localeCompare(keyB);
            })
            .map(([key, recordsGroup]) => {
            const firstRecord = recordsGroup[0];
            const recordType = firstRecord.type;
            const isRunning = recordType === 'run';
            const isJumping = recordType === 'jump';
            const isThrowing = recordType === 'throw';
            const chartData = formatChartData(recordsGroup);
            const bestValue = getBestValue(recordsGroup);
            const isExpanded = expandedGroups.has(key);
            const displayedRecords = isExpanded ? recordsGroup : recordsGroup.slice(0, 3);
            const hasMoreRecords = recordsGroup.length > 3;
            
            const getRecordIcon = () => {
              if (isRunning) return <Clock className="h-6 w-6 text-primary-500" />;
              if (isJumping) return <MapPin className="h-6 w-6 text-green-500" />;
              if (isThrowing) return <Target className="h-6 w-6 text-purple-500" />;
              return <Weight className="h-6 w-6 text-secondary-500" />;
            };
            
            const getRecordColor = () => {
              if (isRunning) return 'text-primary-500';
              if (isJumping) return 'text-green-500';
              if (isThrowing) return 'text-purple-500';
              return 'text-secondary-500';
            };
            
            const formatValue = (value: number) => {
              if (isRunning) return formatTime(value);
              if (isJumping || isThrowing) return `${value.toFixed(2)}m`;
              return `${value.toFixed(2)}kg`;
            };

            return (
              <motion.div 
                key={key} 
                className="bg-white/10 dark:bg-black/10 backdrop-blur-md dark:backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getRecordIcon()}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white text-shadow-light dark:text-shadow-dark">
                        {firstRecord.name}
                      </h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300 text-shadow-light dark:text-shadow-dark">
                        {recordsGroup.length} tentative{recordsGroup.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getRecordColor()}`}>
                      {formatValue(bestValue)}
                    </div>
                    {/* Affichage du type de chaussures */}
                    {(isRunning || isJumping || isThrowing) && firstRecord.shoe_type && (
                      <div className={`text-xs font-medium px-2 py-1 rounded mt-1 ${
                        firstRecord.shoe_type === 'spikes' 
                          ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                          : 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                      }`}>
                        👟 {firstRecord.shoe_type === 'spikes' ? 'Pointes' : 'Baskets'}
                      </div>
                    )}
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {isRunning ? 'Meilleur temps' : (isJumping || isThrowing) ? 'Meilleure distance' : 'Record max'}
                    </div>
                  </div>
                </div>

                {recordsGroup.length > 1 && (
                  <div className="mb-4">
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                          <XAxis 
                            dataKey="date" 
                            stroke="#6B7280"
                            fontSize={12}
                          />
                          <YAxis
                            stroke="#6B7280"
                            fontSize={12}
                            domain={isRunning ? ['dataMin - 0.5', 'dataMax + 0.5'] :
                                   isJumping ? ['dataMin - 0.2', 'dataMax + 0.2'] :
                                   ['dataMin - 5', 'dataMax + 5']}
                            reversed={isRunning}
                          />
                          {/* Ligne de référence pour le record */}
                          <ReferenceLine 
                            y={bestValue} 
                            stroke={isRunning ? "#10B981" : isJumping ? "#22C55E" : "#F59E0B"} 
                            strokeDasharray="5 5"
                            strokeWidth={2}
                            label={{ 
                              value: `Record: ${formatValue(bestValue)}`, 
                              position: "topRight",
                              style: { 
                                fill: isRunning ? "#10B981" : (isJumping || isThrowing) ? "#22C55E" : "#F59E0B", 
                                fontWeight: 'bold',
                                fontSize: '12px'
                              }
                            }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '1px solid #E5E7EB',
                              borderRadius: '8px',
                              color: '#1F2937',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                            formatter={(value: number) => [
                              formatValue(value),
                              `${firstRecord.name} ${value === bestValue ? '🏆 RECORD' : ''}`
                            ]}
                            labelFormatter={(label, payload) => {
                              if (payload && payload[0]) {
                                return format(new Date(payload[0].payload.fullDate), 'd MMMM yyyy', { locale: fr });
                              }
                              return label;
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke={isRunning ? "#7c6df2" : isJumping ? "#22c55e" : isThrowing ? "#a855f7" : "#f97316"}
                            strokeWidth={3}
                            dot={{ 
                              fill: isRunning ? "#7c6df2" : isJumping ? "#22c55e" : isThrowing ? "#a855f7" : "#f97316", 
                              strokeWidth: 2, 
                              r: 5
                            }}
                            activeDot={{ 
                              r: 8, 
                              stroke: isRunning ? "#7c6df2" : isJumping ? "#22c55e" : isThrowing ? "#a855f7" : "#f97316",
                              strokeWidth: 3,
                              fill: 'white'
                            }}
                            label={({ x, y, value, payload }) => {
                              // Afficher la valeur sur les points records
                             if (payload && payload.isRecord) {
                                return (
                                  <text 
                                    x={x} 
                                    y={y - 15} 
                                    fill={isRunning ? "#10B981" : (isJumping || isThrowing) ? "#22C55E" : "#F59E0B"}
                                    textAnchor="middle" 
                                    fontSize="11" 
                                    fontWeight="bold"
                                  >
                                    🏆 {formatValue(value)}
                                  </text>
                                );
                              }
                              return null;
                            }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {/* Afficher seulement le record personnel (meilleur temps) */}
                  {(() => {
                    const bestRecord = recordsGroup.find(r => r.value === bestValue);
                    if (!bestRecord) return null;
                    
                    return (
                      <div className="bg-yellow-500/10 border-yellow-500/20 flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center space-x-3">
                          <Trophy className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                          <div className="text-gray-800 dark:text-gray-300">
                            <div className="font-medium text-sm">
                              Record Personnel
                            </div>
                            <div className="text-xs text-gray-700 dark:text-gray-400">
                              {format(new Date(bestRecord.date), 'd MMM yyyy', { locale: fr })}
                              {bestRecord.wind_speed !== undefined && (
                                <span className="ml-2">
                                  💨 {bestRecord.wind_speed > 0 ? '+' : ''}{bestRecord.wind_speed.toFixed(1)} m/s
                                </span>
                              )}
                              {bestRecord.shoe_type && (
                                <span className="ml-2">
                                  👟 {bestRecord.shoe_type === 'spikes' ? 'Pointes' : 'Baskets'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-green-700 dark:text-green-400 text-lg">
                            {formatValue(bestRecord.value)}
                          </span>
                          <span className="text-xs text-yellow-700 dark:text-yellow-300 font-bold bg-yellow-500/20 px-2 py-1 rounded">
                            RP
                          </span>
                          <button
                            onClick={(e) => handleDelete(bestRecord.id, e)}
                            className="p-1 text-red-400 hover:text-red-600 hover:bg-red-500/20 rounded transition-colors"
                            title="Supprimer ce record"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                  
                  {/* Bouton voir tous les temps */}
                  {recordsGroup.length > 1 && (
                    <button
                      onClick={() => toggleGroupExpansion(key)}
                      className="w-full mt-2 px-4 py-2 text-sm text-primary-700 dark:text-primary-300 bg-primary-500/10 hover:bg-primary-500/20 rounded-lg border border-primary-500/20 transition-colors"
                    >
                      {isExpanded ? 'Masquer les détails' : `Voir tous les temps (${recordsGroup.length})`}
                    </button>
                  )}
                  
                  {/* Afficher les autres records si développé */}
                  {isExpanded && recordsGroup.length > 1 && (
                    <div className="mt-3 space-y-2">
                      {recordsGroup
                        .filter(r => r.value !== bestValue)
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((record) => (
                          <div key={record.id} className="bg-black/10 flex items-center justify-between p-3 rounded-lg border border-white/20">
                            <div className="flex items-center space-x-3">
                              <div className="text-gray-800 dark:text-gray-300">
                                <div className="font-medium text-sm">
                                  {format(new Date(record.date), 'd MMM yyyy', { locale: fr })}
                                </div>
                                <div className="text-xs text-gray-700 dark:text-gray-400">
                                  {record.wind_speed !== undefined && (
                                    <span className="mr-2">
                                      💨 {record.wind_speed > 0 ? '+' : ''}{record.wind_speed.toFixed(1)} m/s
                                    </span>
                                  )}
                                  {record.shoe_type && (
                                    <span>
                                      👟 {record.shoe_type === 'spikes' ? 'Pointes' : 'Baskets'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-gray-800 dark:text-gray-200">
                                {formatValue(record.value)}
                              </span>
                              <button
                                onClick={(e) => handleDelete(record.id, e)}
                                className="p-1 text-red-400 hover:text-red-600 hover:bg-red-500/20 rounded transition-colors"
                                title="Supprimer ce record"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
                
export default RecordsList;
