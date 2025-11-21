import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Settings, Share2, Users, TrendingUp, 
  AlertTriangle, Activity, CheckCircle, XCircle,
  ClipboardList
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { supabase } from '../../lib/supabase';
import { Profile } from '../../types';
import { Group } from '../../hooks/useGroups';
import { useWellness, WellnessLog } from '../../hooks/useWellness';
import { JoinGroupModal } from './JoinGroupModal';
import ConfirmationModal from '../common/ConfirmationModal';

interface GroupControlCenterProps {
  group: Group;
  onBack: () => void;
  onViewAthlete: (athleteId: string) => void;
}

interface MemberStatus {
  profile: Profile;
  log: WellnessLog | null;
  hasAlert: boolean;
  score: number | null;
}

export const GroupControlCenter: React.FC<GroupControlCenterProps> = ({ group, onBack, onViewAthlete }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'settings'>('overview');
  const [memberStatuses, setMemberStatuses] = useState<MemberStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  
  // Calculate metrics
  const alerts = memberStatuses.filter(m => m.hasAlert);
  const checkedInCount = memberStatuses.filter(m => m.log).length;
  const totalMembers = group.group_members.length;
  
  const fetchGroupData = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // 1. Fetch wellness logs for all members for today
      const memberIds = group.group_members.map(m => m.athlete_id);
      
      if (memberIds.length === 0) {
        setMemberStatuses([]);
        setLoading(false);
        return;
      }

      const { data: logs, error: logsError } = await supabase
        .from('wellness_log')
        .select('*')
        .in('user_id', memberIds)
        .eq('date', today);
        
      if (logsError) throw logsError;
      
      // 2. Map profiles to logs
      const statuses: MemberStatus[] = group.group_members.map(member => {
        const profile = member.profiles;
        if (!profile) return null;
        
        const log = logs?.find(l => l.user_id === member.athlete_id) || null;
        
        // Calculate score and alerts
        let score = null;
        let hasAlert = false;
        
        if (log) {
            // Score formula: (Sleep + Energy + Mood + (100 - Stress) + (100 - Fatigue)) / 5
            const sleep = log.ressenti_sommeil || 50;
            const energy = log.energie_subjective || 50;
            const mood = log.humeur_subjective || 50;
            const stress = log.stress_level || 50;
            const fatigue = log.muscle_fatigue || 50;
            
            score = Math.round((sleep + energy + mood + (100 - stress) + (100 - fatigue)) / 5);
            
            // Alert Logic: Red if Stress/Fatigue > 75 or Sleep/Mood < 30
            if (stress > 75 || fatigue > 75 || sleep < 30 || mood < 30) {
                hasAlert = true;
            }
        }
        
        return {
            profile,
            log,
            hasAlert,
            score
        };
      }).filter(Boolean) as MemberStatus[];
      
      setMemberStatuses(statuses);

      // 3. Fetch pending requests
      const { data: requests } = await supabase
        .from('group_join_requests')
        .select('*, profiles(first_name, last_name, photo_url)')
        .eq('group_id', group.id)
        .eq('status', 'pending');
        
      setPendingRequests(requests || []);

    } catch (error) {
      console.error("Error fetching group data:", error);
      toast.error("Erreur lors du chargement des données du groupe");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupData();
  }, [group]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(group.invitation_code);
    toast.success('Code copié !');
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
        const { data, error } = await supabase.rpc('respond_to_join_request', {
            request_id_param: requestId,
            new_status_param: 'accepted'
        });
        if (error) throw error;
        toast.success("Athlète accepté");
        fetchGroupData(); // Refresh
    } catch (e) {
        toast.error("Erreur lors de l'acceptation");
    }
  };

  return (
    <div className="pb-20 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <ArrowLeft size={24} className="text-gray-700 dark:text-gray-200" />
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate max-w-[200px]">{group.name}</h1>
        <button 
          onClick={() => setActiveTab('settings')}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Settings size={24} className="text-gray-700 dark:text-gray-200" />
        </button>
      </div>

      {/* Quick Stats / Invitation Code */}
      <div className="mb-8 p-4 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 text-white shadow-lg">
        <div className="flex justify-between items-start mb-4">
            <div>
                <p className="text-primary-100 text-sm">Code d'invitation</p>
                <div className="flex items-center space-x-2 mt-1">
                    <span className="text-2xl font-mono font-bold tracking-widest">{group.invitation_code}</span>
                    <button onClick={handleCopyCode} className="p-1 hover:bg-white/20 rounded transition-colors">
                        <ClipboardList size={18} />
                    </button>
                </div>
            </div>
            <div className="text-right">
                <p className="text-primary-100 text-sm">Membres</p>
                <p className="text-2xl font-bold">{totalMembers}</p>
            </div>
        </div>
        <div className="flex space-x-4 text-sm">
            <div className="flex items-center bg-white/10 px-3 py-1 rounded-lg">
                <Activity size={16} className="mr-2" />
                <span>{checkedInCount}/{totalMembers} Check-ins</span>
            </div>
            {alerts.length > 0 && (
                <div className="flex items-center bg-red-500/20 px-3 py-1 rounded-lg border border-red-400/30">
                    <AlertTriangle size={16} className="mr-2 text-red-200" />
                    <span>{alerts.length} Alerte(s)</span>
                </div>
            )}
        </div>
      </div>

      {/* Priority Alerts Section (Module A) */}
      {alerts.length > 0 && (
        <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
                <AlertTriangle className="text-red-500 mr-2" size={20} />
                Alertes Prioritaires
            </h2>
            <div className="grid grid-cols-1 gap-3">
                {alerts.map((status) => (
                    <motion.div 
                        key={status.profile.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => onViewAthlete(status.profile.id)}
                        className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 p-4 rounded-xl flex items-center justify-between cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    >
                        <div className="flex items-center space-x-3">
                            <img 
                                src={status.profile.photo_url || 'https://via.placeholder.com/150'} 
                                alt={status.profile.first_name || ''}
                                className="w-10 h-10 rounded-full object-cover border-2 border-red-200"
                            />
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white">
                                    {status.profile.first_name} {status.profile.last_name}
                                </h3>
                                <div className="text-xs text-red-600 dark:text-red-300 flex flex-wrap gap-2 mt-1">
                                    {(status.log?.stress_level || 0) > 75 && <span>• Stress Élevé</span>}
                                    {(status.log?.muscle_fatigue || 0) > 75 && <span>• Fatigue</span>}
                                    {(status.log?.ressenti_sommeil || 0) < 30 && <span>• Mauvais Sommeil</span>}
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-lg font-bold text-red-600">{status.score}%</span>
                            <p className="text-xs text-red-400">Forme</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
      )}

      {/* Pending Requests Section */}
      {pendingRequests.length > 0 && (
        <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
                <Users className="text-blue-500 mr-2" size={20} />
                Demandes d'adhésion ({pendingRequests.length})
            </h2>
            <div className="space-y-2">
                {pendingRequests.map(req => (
                    <div key={req.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                <Users size={20} className="text-gray-500" />
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white">
                                    {req.profiles?.first_name} {req.profiles?.last_name}
                                </p>
                                <p className="text-xs text-gray-500">Souhaite rejoindre le groupe</p>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <button 
                                onClick={() => handleAcceptRequest(req.id)}
                                className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-600"
                            >
                                Accepter
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* Members List with Status */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3">
            Tous les membres
        </h2>
        <div className="space-y-2">
            {memberStatuses.map((status) => (
                <div 
                    key={status.profile.id}
                    onClick={() => onViewAthlete(status.profile.id)}
                    className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            <img 
                                src={status.profile.photo_url || 'https://via.placeholder.com/150'} 
                                alt={status.profile.first_name || ''}
                                className="w-12 h-12 rounded-full object-cover"
                            />
                            {status.log ? (
                                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5 border-2 border-white dark:border-gray-800">
                                    <CheckCircle size={12} className="text-white" />
                                </div>
                            ) : (
                                <div className="absolute -bottom-1 -right-1 bg-gray-400 rounded-full p-0.5 border-2 border-white dark:border-gray-800">
                                    <Activity size={12} className="text-white" />
                                </div>
                            )}
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white">
                                {status.profile.first_name} {status.profile.last_name}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {status.log ? 'Check-in effectué' : 'En attente de check-in'}
                            </p>
                        </div>
                    </div>
                    
                    {status.score !== null ? (
                        <div className={`text-right px-3 py-1 rounded-lg ${
                            status.score < 40 ? 'bg-red-100 text-red-700' : 
                            status.score < 70 ? 'bg-orange-100 text-orange-700' : 
                            'bg-green-100 text-green-700'
                        }`}>
                            <span className="font-bold text-lg">{status.score}</span>
                            <span className="text-xs font-medium ml-0.5">%</span>
                        </div>
                    ) : (
                        <div className="text-right px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-400">
                            <span className="text-sm font-medium">--</span>
                        </div>
                    )}
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};
