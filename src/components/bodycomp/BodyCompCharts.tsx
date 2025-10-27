import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus, Scale, Trash2 } from 'lucide-react';
import { useBodyComposition } from '../../hooks/useBodyComposition';
import { LoadingScreen } from '../LoadingScreen';

interface BodyCompChartsProps {
  onAddEntry: () => void;
}

export const BodyCompCharts: React.FC<BodyCompChartsProps> = ({ onAddEntry }) => {
  const { bodyComps, loading, deleteBodyComposition } = useBodyComposition();
  const [showAllMeasurements, setShowAllMeasurements] = useState(false);

  const sortedData = React.useMemo(() => {
    if (!bodyComps || bodyComps.length === 0) return [];
    
    return bodyComps.slice()
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(comp => ({
        ...comp,
        dateFormatted: format(new Date(comp.date), 'dd/MM', { locale: fr }),
        bmi: comp.weight / Math.pow((comp.height || 170) / 100, 2),
      }));
  }, [bodyComps]);

  const latestData = sortedData.length > 0 ? sortedData[sortedData.length - 1] : null;

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette mesure ?')) {
      try {
        await deleteBodyComposition(id);
      } catch (error) {
        console.error('Erreur suppression:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  if (loading) {
    return <LoadingScreen message="Chargement des données corporelles..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Composition corporelle</h1>
        <button
          onClick={onAddEntry}
          className="flex items-center space-x-2 px-4 py-2 bg-accent-500 hover:bg-accent-600 rounded-lg text-white transition-all duration-200 shadow-lg"
        >
          <Plus className="h-5 w-5" />
          <span>Nouvelle mesure</span>
        </button>
      </div>

      {!bodyComps || bodyComps.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center shadow-lg border border-gray-200 dark:border-gray-700">
          <Scale className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Aucune donnée</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Commencez à enregistrer vos mesures pour suivre votre évolution.</p>
          <button
            onClick={onAddEntry}
            className="px-6 py-3 bg-accent-500 hover:bg-accent-600 rounded-lg text-white font-medium transition-all duration-200 shadow-lg"
          >
            Première mesure
          </button>
        </div>
      ) : (
        <>
          {/* Stats actuelles */}
          {latestData && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="text-2xl font-bold text-accent-500">{latestData.weight.toFixed(1)}kg</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Poids actuel</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="text-2xl font-bold text-primary-500">{latestData.bmi.toFixed(1)}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">IMC</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="text-2xl font-bold text-red-500">{latestData.bodyFatPercentage.toFixed(1)}%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Masse grasse</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="text-2xl font-bold text-secondary-500">{latestData.skeletalMuscle.toFixed(1)}kg</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Muscle squelettique</div>
              </div>
            </div>
          )}
          
          {/* Dernières mesures */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Dernières mesures</h3>
              {bodyComps.length > 1 && (
                <button
                  onClick={() => setShowAllMeasurements(!showAllMeasurements)}
                  className="text-sm text-primary-500 hover:text-primary-600 font-medium border border-primary-200 dark:border-primary-800 px-3 py-1 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                >
                  {showAllMeasurements ? 'Masquer ↑' : `Voir toutes (${bodyComps.length}) ↓`}
                </button>
              )}
            </div>
            <div className="space-y-3">
              {bodyComps
                .slice()
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, showAllMeasurements ? bodyComps.length : 1)
                .map((comp) => (
                  <div key={comp.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {format(new Date(comp.date), 'd MMMM yyyy', { locale: fr })}
                      </span>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {comp.weight.toFixed(1)}kg • {comp.bodyFatPercentage.toFixed(1)}% MG • {comp.skeletalMuscle.toFixed(1)}kg MS
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDelete(comp.id, e)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Supprimer cette mesure"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
            </div>
          </div>
          
          {/* Graphiques d'évolution */}
          {sortedData.length > 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Évolution du poids</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={sortedData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="dateFormatted" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        color: '#1F2937'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="weight" 
                      stroke="#d946ef" 
                      strokeWidth={2}
                      dot={{ fill: '#d946ef', strokeWidth: 2, r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Composition musculaire</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={sortedData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="dateFormatted" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        color: '#1F2937'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="bodyFatPercentage" 
                      stroke="#EF4444" 
                      strokeWidth={2}
                      name="Masse grasse (%)"
                      dot={{ fill: '#EF4444', strokeWidth: 2, r: 3 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="skeletalMuscle" 
                      stroke="#f97316" 
                      strokeWidth={2}
                      name="Muscle squelettique (kg)"
                      dot={{ fill: '#f97316', strokeWidth: 2, r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};