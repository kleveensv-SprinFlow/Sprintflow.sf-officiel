import React, { useState } from 'react';
import { Users, UserPlus, Loader2 } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { useGroups } from '../../hooks/useGroups';
import { JoinGroupModal } from './JoinGroupModal';
import { GroupDetailsPage } from './GroupDetailsPage';
import { AthleteDetails } from './AthleteDetails';
import { Profile } from '../../types';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';

export const AthleteGroupView: React.FC = () => {
  const { user } = useAuth();
  const { groups, loading, fetchGroups } = useGroups();
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'list' | 'details' | 'athlete'>('list');
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [selectedAthlete, setSelectedAthlete] = useState<Profile | null>(null);

  // Fonction pour rafraîchir la liste des groupes
  const refreshGroups = async () => {
    await fetchGroups();
  };

  const handleSelectGroup = (group: any) => {
    setSelectedGroup(group);
    setCurrentView('details');
  };

  const handleViewAthlete = async (athleteId: string) => {
    const athleteProfile = selectedGroup?.group_members.find((m: any) => m.athlete_id === athleteId)?.profiles as Profile;

    if (athleteProfile) {
      setSelectedAthlete(athleteProfile);
      setCurrentView('athlete');
    } else {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, photo_url, role, date_de_naissance, sexe, height, discipline, license_number')
          .eq('id', athleteId)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          setSelectedAthlete(data as Profile);
          setCurrentView('athlete');
        } else {
          toast.error('Profil introuvable');
        }
      } catch (error) {
        console.error('Erreur chargement profil:', error);
        toast.error('Impossible de charger le profil');
      }
    }
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedGroup(null);
    setSelectedAthlete(null);
  };

  const handleBackToDetails = () => {
    setCurrentView('details');
    setSelectedAthlete(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-primary-500" />
      </div>
    );
  }

  if (currentView === 'details' && selectedGroup) {
    return <GroupDetailsPage group={selectedGroup} onBack={handleBackToList} onViewAthlete={handleViewAthlete} />;
  }

  if (currentView === 'athlete' && selectedAthlete) {
    const athleteDataForDetails = {
      id: selectedAthlete.id,
      first_name: selectedAthlete.first_name || '',
      last_name: selectedAthlete.last_name || '',
      photo_url: selectedAthlete.photo_url,
      joined_at: new Date().toISOString(),
    };
    return <AthleteDetails athlete={athleteDataForDetails} onBack={handleBackToDetails} />;
  }

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

      {groups.length === 0 ? (
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
          {groups.map((group) => (
            <div
              key={group.id}
              onClick={() => handleSelectGroup(group)}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow hover:shadow-lg cursor-pointer transition-all"
            >
              <h3 className="text-lg font-bold">{group.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{group.group_members.length + 1} membre(s)</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AthleteGroupView;