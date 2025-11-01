import React from 'react';
import { useCoachDashboard } from '../../hooks/useCoachDashboard';
import TeamHealthWidget from './coach/TeamHealthWidget';
import ActionsListWidget from './coach/ActionsListWidget';
import ShortcutsWidget from './coach/ShortcutsWidget';
import { Loader, AlertTriangle } from 'lucide-react';

export const CoachDashboard: React.FC = () => {
  const { data, loading, error, refreshData } = useCoachDashboard();

  const handleActionComplete = () => {
    refreshData();
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Hub de Pilotage
          </h1>
          <p className="text-gray-600">
            Votre aperçu quotidien de la performance et des actions requises.
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md flex items-center">
            <AlertTriangle className="w-6 h-6 mr-3" />
            <div>
              <p className="font-bold">Erreur de chargement</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {loading && !data ? (
            <div className="flex justify-center items-center py-16">
              <Loader className="w-12 h-12 animate-spin text-blue-500" />
            </div>
          ) : (
            data && (
              <>
                <TeamHealthWidget data={data.teamHealth} loading={loading} />
                <ActionsListWidget data={data.priorityActions} loading={loading} onActionComplete={handleActionComplete} />
                <ShortcutsWidget />
              </>
            )
          )}
        </div>
      </div>
    </div>
  );
};
