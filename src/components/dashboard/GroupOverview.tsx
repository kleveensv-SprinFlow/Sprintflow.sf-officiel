// src/components/dashboard/GroupOverview.tsx
import React, { useState } from 'react';
import { useGroups } from '../../hooks/useGroups';
import { Loader, Users, Crown, ChevronRight, UserPlus, X, Link as LinkIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface GroupOverviewProps {
  onNavigate: () => void;
}

interface JoinGroupModalProps {
  onClose: () => void;
}

const JoinGroupModal: React.FC<JoinGroupModalProps> = ({ onClose }) => {
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoinGroup = async () => {
    if (!inviteCode.trim()) {
      setError('Veuillez entrer un code d\'invitation');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { data: group, error: groupError } = await supabase
        .from('groups')
        .select('id, coach_id')
        .eq('invitation_code', inviteCode.trim().toUpperCase())
        .maybeSingle();

      if (groupError || !group) {
        setError('Code d\'invitation invalide');
        setLoading(false);
        return;
      }

      const { data: existingMember } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', group.id)
        .eq('athlete_id', user.id)
        .maybeSingle();

      if (existingMember) {
        setError('Vous êtes déjà membre de ce groupe');
        setLoading(false);
        return;
      }

      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: group.id,
          athlete_id: user.id,
        });

      if (memberError) {
        console.error('Erreur ajout membre:', memberError);
        setError('Erreur lors de l\'ajout au groupe');
        setLoading(false);
        return;
      }

      window.location.reload();
    } catch (err: any) {
      console.error('Erreur:', err);
      setError(err.message || 'Une erreur est survenue');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <LinkIcon size={24} className="text-blue-600" />
            Rejoindre un groupe
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Entrez le code d'invitation fourni par votre coach
        </p>

        <input
          type="text"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          placeholder="Code d'invitation"
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white mb-4"
        />

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleJoinGroup}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-semibold"
          >
            {loading ? 'Rejoindre...' : 'Rejoindre'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const GroupOverview: React.FC<GroupOverviewProps> = ({ onNavigate }) => {
  const { groups, loading } = useGroups();
  const [showJoinModal, setShowJoinModal] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader className="animate-spin text-green-500" size={32} />
      </div>
    );
  }

  const group = groups[0]; // On ne gère que le premier groupe pour cet aperçu

  if (!group) {
    return (
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
          Mon Groupe
        </h2>
        <div className="text-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
          <Users className="mx-auto text-gray-400 mb-3" size={48}/>
          <p className="text-gray-600 dark:text-gray-400 mb-4 font-medium">
            Vous n'êtes dans aucun groupe
          </p>
          <button
            onClick={() => setShowJoinModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl"
          >
            <UserPlus size={20} />
            Rejoindre un groupe
          </button>
        </div>

        {showJoinModal && (
          <JoinGroupModal onClose={() => setShowJoinModal(false)} />
        )}
      </div>
    );
  }

  const coach = group.coach;
  const athletes = group.members || [];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{group.name}</h2>
        <button
          onClick={onNavigate}
          className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Voir tout <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
      <div className="relative flex flex-col items-center justify-center p-4 h-48">
        {coach && (
          <div className="relative z-10 flex flex-col items-center text-center">
            <img
              src={coach.avatar_url || `https://ui-avatars.com/api/?name=${coach.first_name}+${coach.last_name}`}
              alt="Coach"
              className="w-24 h-24 rounded-full border-4 border-secondary-500 shadow-lg"
            />
            <h3 className="mt-2 text-lg font-semibold">{`${coach.first_name} ${coach.last_name}`}</h3>
            <p className="text-sm text-secondary-500 flex items-center"><Crown size={14} className="mr-1"/> Coach</p>
          </div>
        )}

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex justify-center items-center w-full mt-8">
          {athletes.map((member, index) => (
            <img
              key={member.athlete.id}
              src={member.athlete.avatar_url || `https://ui-avatars.com/api/?name=${member.athlete.first_name}+${member.athlete.last_name}`}
              alt={`Athlète ${index + 1}`}
              className="w-12 h-12 rounded-full border-2 border-gray-300 absolute"
              style={{
                transform: `rotate(${index * (360 / athletes.length)}deg) translateY(-100px) rotate(-${index * (360 / athletes.length)}deg)`,
                opacity: 0.8,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};