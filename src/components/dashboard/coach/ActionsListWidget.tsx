import React from 'react';
import { CoachDashboardData } from '../../../hooks/useCoachDashboard';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface ActionsListWidgetProps {
  data: CoachDashboardData['priorityActions'];
  loading: boolean;
  onActionComplete: () => void;
}

const ActionsListWidget: React.FC<ActionsListWidgetProps> = ({ data, loading, onActionComplete }) => {
  if (loading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-2">
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const { pendingWellness, pendingValidation } = data;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Actions Prioritaires</h2>

      <div className="space-y-4">
        {pendingWellness.length > 0 && (
          <div className="border-l-4 border-yellow-500 bg-yellow-50 p-4 rounded">
            <div className="flex items-center mb-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
              <h3 className="font-semibold text-yellow-800">Bien-être en attente ({pendingWellness.length})</h3>
            </div>
            <ul className="space-y-2">
              {pendingWellness.map(item => (
                <li key={item.athlete_id} className="text-sm text-gray-700">
                  {item.full_name}
                </li>
              ))}
            </ul>
          </div>
        )}

        {pendingValidation.length > 0 && (
          <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
            <div className="flex items-center mb-2">
              <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="font-semibold text-blue-800">Séances à valider ({pendingValidation.length})</h3>
            </div>
            <ul className="space-y-2">
              {pendingValidation.map(item => (
                <li key={item.workout_id} className="text-sm text-gray-700">
                  {item.full_name} - {item.workout_title}
                </li>
              ))}
            </ul>
          </div>
        )}

        {pendingWellness.length === 0 && pendingValidation.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
            <p>Aucune action en attente</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionsListWidget;
