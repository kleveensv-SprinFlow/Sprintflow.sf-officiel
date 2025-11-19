import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Users, UserPlus, Check, X, Clipboard, ClipboardCheck, Loader2, Crown } from 'lucide-react';
import { useGroups, Group, JoinRequest } from '../../hooks/useGroups';
import { toast } from 'react-toastify';
import { supabase } from '../../lib/supabase';
import useAuth from '../../hooks/useAuth';

interface GroupDetailsPageProps {
  group: Group;
  onBack: () => void;
  onViewAthlete: (athleteId: string) => void;
}

export const GroupDetailsPage: React.FC<GroupDetailsPageProps> = ({ group, onBack, onViewAthlete }) => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'members' | 'requests'>('members');
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [coachProfile, setCoachProfile] = useState<any>(null);

  const { fetchJoinRequests, respondToRequest } = useGroups();
  const isAthlete = profile?.role === 'athlete';

  // Load coach information
  useEffect(() => {
    const loadCoachProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, photo_url, role')
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
            {!isAthlete && (
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <span>Code:</span>
                  <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{group.invitation_code}</span>
                  <button onClick={copyToClipboard} title="Copier le code">
                      {isCopied ? <ClipboardCheck size={16} className="text-green-500"/> : <Clipboard size={16} />}
                  </button>
              </div>
            )}
        </div>
      </div>

      {!isAthlete && (
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-4">
            <button
              onClick={() => setActiveTab('members')}
              className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-medium ${activeTab === 'members' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <Users size={18} />
              <span>Membres ({group.group_members.length + (coachProfile ? 1 : 0)})</span>
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
      )}

      <div>
        {(activeTab === 'members' || isAthlete) && (
          <div className="space-y-3">
            {coachProfile && (
                <div
                  key={coachProfile.id}
                  onClick={() => onViewAthlete(coachProfile.id)}
                  className="cursor-pointer flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="relative">
                    <img
                      src={coachProfile.photo_url || `https://ui-avatars.com/api/?name=${coachProfile.first_name}+${coachProfile.last_name}&background=f97316`}
                      alt="avatar"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-orange-500 rounded-full p-0.5">
                      <Crown size={12} className="text-white" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold truncate">{coachProfile.first_name} {coachProfile.last_name}</p>
                    <span className="text-sm text-gray-500">Coach</span>
                  </div>
                </div>
            )}

            {group.group_members.length > 0 ? group.group_members.map(member => (
              <div
                key={member.athlete_id}
                onClick={() => onViewAthlete(member.athlete_id)}
                className="cursor-pointer flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <img
                  src={member.profiles?.photo_url || `https://ui-avatars.com/api/?name=${member.profiles?.first_name}+${member.profiles?.last_name}&background=3b82f6`}
                  alt="avatar"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="ml-4">
                  <p className="font-semibold truncate">{member.profiles?.first_name} {member.profiles?.last_name}</p>
                  <span className="text-sm text-gray-500">Athlète</span>
                </div>
              </div>
            )) : !coachProfile && <p className="text-center py-8 text-gray-500">Aucun membre dans ce groupe.</p>}
          </div>
        )}

        {!isAthlete && activeTab === 'requests' && (
          <div className="space-y-3">
            {loadingRequests ? <div className="text-center py-8"><Loader2 className="mx-auto animate-spin"/></div> 
            : requests.length === 0 ? <p className="text-center py-8 text-gray-500">Aucune demande en attente.</p> 
            : requests.map(req => (
              <div key={req.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="flex items-center space-x-3">
                    <img 
                      src={req.profiles?.photo_url || `https://ui-avatars.com/api/?name=${req.profiles?.first_name}+${req.profiles?.last_name}&background=random`} 
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