import React, { useState } from 'react';
import { Users, UserPlus } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { useCoachLinks } from '../../hooks/useCoachLinks'; // Pourrait être remplacé par un hook de groupes pour athlètes
import { JoinGroupModal } from './JoinGroupModal'; // Importer la nouvelle modale

export const AthleteGroupView: React.FC = () => {
  const { user } = useAuth();
  // Note: Ce hook est orienté coach. Idéalement, il faudrait un hook pour l'athlète qui récupère ses groupes.
  // Pour l'instant, on simule une liste de groupes vide ou simple.
  const [userGroups, setUserGroups] = useState<{ id: string; name: string }[]>([]);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  // Fonction pour rafraîchir la liste des groupes (à implémenter si nécessaire)
  const refreshGroups = () => {
    // Logique pour récupérer les groupes de l'athlète ici
    console.log("Rafraîchissement des groupes...");
  };

  return (
    <div className="p-4 space-y-6">
      {isJoinModalOpen && (
        <JoinGroupModal 
          onClose={() => setIsJoinModalOpen(false)} 
          onSuccess={refreshGroups}
        />
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mes Groupes</h1>
        <button
          onClick={() => setIsJoinModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors shadow-md"
          aria-label="Rejoindre un groupe"
        >
          <UserPlus size={20} />
          <span>Rejoindre</span>
        </button>
      </div>

      {userGroups.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-inner">
          <Users size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Vous n'êtes dans aucun groupe
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-xs mx-auto">
            Utilisez un code d'invitation de votre coach pour rejoindre un groupe et commencer à collaborer.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {userGroups.map((group) => (
            <div key={group.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">{group.name}</h3>
                {/* Plus d'infos sur le groupe ici si nécessaire */}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};