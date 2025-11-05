import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Users, UserPlus, Check, X, Clipboard, ClipboardCheck, Loader2, Crown } from 'lucide-react';
import { useGroups, Group, JoinRequest } from '../../hooks/useGroups';
import { toast } from 'react-toastify';
import { supabase } from '../../lib/supabase';

interface GroupDetailsPageProps {
  group: Group;
  onBack: () => void;
  onViewAthlete: (athleteId: string) => void;
}

export const GroupDetailsPage: React.FC<GroupDetailsPageProps> = ({ group, onBack, onViewAthlete }) => {
  const [activeTab, setActiveTab] = useState<'members' | 'requests'>('members');
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [coachProfile, setCoachProfile] = useState<any>(null);

  const { fetchJoinRequests, respondToRequest } = useGroups();

  // Load coach information
  useEffect(() => {
    const loadCoachProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url, role')
        .eq('id', group.coach_id)
        .maybeSingle();

      if (error) {
        console.error("Erreur chargement profil coach:", error);
      } else if (data) {
        setCoachProfile(data);
      }
    };
    loadCoachProfile();
  }, [group.coach_id]);

  const loadRequests = useCallback(async () => {
    setLoadingRequests(true);
    try {
      const pendingRequests = await fetchJoinRequests(group.id);
      setRequests(pendingRequests);
    } catch (error) {
      console.error("Erreur chargement des demandes:", error);
      toast.error("Impossible de charger les demandes.");
    } finally {
      setLoadingRequests(false);
    }
  }, [group.id, fetchJoinRequests]);

  useEffect(() => {
    if (activeTab === 'requests') {
      loadRequests();
    }
  }, [activeTab, loadRequests]);

  const handleResponse = async (requestId: string, status: 'accepted' | 'rejected') => {
    setProcessingId(requestId);
    try {
      await respondToRequest(requestId, status);
      toast.success(`Demande ${status === 'accepted' ? 'acceptée' : 'refusée'} !`);
      loadRequests();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors du traitement.");
    } finally {
      setProcessingId(null);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(group.invitation_code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="p-4 space-y-4 animate-in fade-in-0">
      <div className="flex items-center space-x-2">
        <button onClick={onBack} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
          <ArrowLeft size={24} />
        </button>
        <div>
            <h1 className="text-2xl font-bold">{group.name}</h1>
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <span>Code:</span>
                <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{group.invitation_code}</span>
                <button onClick={copyToClipboard} title="Copier le code">
                    {isCopied ? <ClipboardCheck size={16} className="text-green-500"/> : <Clipboard size={16} />}
                </button>
            </div>
        </div>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-4">
          <button
            onClick={() => setActiveTab('members')}
            className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-medium ${activeTab === 'members' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <Users size={18} />
            <span>Membres ({group.group_members.length + 1})</span>
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-medium ${activeTab === 'requests' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <UserPlus size={18} />
            <span>Demandes</span>
            {requests.length > 0 && <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{requests.length}</span>}
          </button>
        </nav>
      </div>

      <div>
        {activeTab === 'members' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {coachProfile && (
              <div
                key={coachProfile.id}
                onClick={() => onViewAthlete(coachProfile.id)}
                className="cursor-pointer text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow border-2 border-orange-400"
              >
                <div className="relative">
                  <img
                    src={coachProfile.avatar_url || `https://ui-avatars.com/api/?name=${coachProfile.first_name}+${coachProfile.last_name}&background=f97316`}
                    alt="avatar"
                    className="w-20 h-20 rounded-full mx-auto mb-2 object-cover"
                  />
                  <div className="absolute -top-1 -right-1 bg-orange-500 rounded-full p-1">
                    <Crown size={16} className="text-white" />
                  </div>
                </div>
                <p className="font-semibold truncate">{coachProfile.first_name} {coachProfile.last_name}</p>
                <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full">
                  Coach
                </span>
              </div>
            )}

            {group.group_members.length > 0 ? group.group_members.map(member => (
              <div
                key={member.athlete_id}
                onClick={() => onViewAthlete(member.athlete_id)}
                className="cursor-pointer text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow border-2 border-blue-400"
              >
                <img
                  src={member.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${member.profiles?.first_name}+${member.profiles?.last_name}&background=3b82f6`}
                  alt="avatar"
                  className="w-20 h-20 rounded-full mx-auto mb-2 object-cover"
                />
                <p className="font-semibold truncate">{member.profiles?.first_name} {member.profiles?.last_name}</p>
                <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
                  Athlète
                </span>
              </div>
            )) : !coachProfile && <p className="col-span-full text-center py-8 text-gray-500">Aucun membre dans ce groupe.</p>}
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="space-y-3">
            {loadingRequests ? <div className="text-center py-8"><Loader2 className="mx-auto animate-spin"/></div> 
            : requests.length === 0 ? <p className="text-center py-8 text-gray-500">Aucune demande en attente.</p> 
            : requests.map(req => (
              <div key={req.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="flex items-center space-x-3">
                    <img 
                      src={req.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${req.profiles?.first_name}+${req.profiles?.last_name}&background=random`} 
                      alt="avatar" 
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <span className="font-medium">{req.profiles?.first_name} {req.profiles?.last_name}</span>
                </div>
                <div className="flex space-x-2">
                    {processingId === req.id ? <Loader2 className="animate-spin"/> :
                    <>
                        <button onClick={() => handleResponse(req.id, 'rejected')} className="p-2 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-full hover:bg-red-200">
                            <X size={18}/>
                        </button>
                        <button onClick={() => handleResponse(req.id, 'accepted')} className="p-2 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full hover:bg-green-200">
                            <Check size={18}/>
                        </button>
                    </>
                    }
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};