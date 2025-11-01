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

      const { data, error: rpcError } = await supabase.rpc('join_group_with_invite_code', {
        p_invite_code: inviteCode.trim().toUpperCase(),
      });

      if (rpcError) {
        console.error('Erreur RPC:', rpcError);
        throw new Error('Une erreur technique est survenue.');
      }

      const [result] = data;
      if (result.status === 'error') {
        setError(result.message);
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

  const group = groups[0];

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

  const members = group.members || [];
  const athleteProfiles = members.map(m => m.profile).filter(Boolean);

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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="text-blue-600" size={24} />
            <span className="text-gray-700 dark:text-gray-300">
              {athleteProfiles.length} {athleteProfiles.length > 1 ? 'membres' : 'membre'}
            </span>
          </div>
          <button
            onClick={onNavigate}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm"
          >
            Voir les membres
          </button>
        </div>
      </div>
    </div>
  );
};