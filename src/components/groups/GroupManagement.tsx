import React, { useState } from 'react';
import { Plus, Loader2, X, Trash2 } from 'lucide-react';
import { useGroups, Group, GroupAnalytics } from '../../hooks/useGroups';
import { GroupDetailsPage } from './GroupDetailsPage';
import { GroupControlCenter } from './GroupControlCenter';
import { AthleteDetails } from './AthleteDetails';
import { Profile } from '../../types';
import { toast } from 'react-toastify';
import { supabase } from '../../lib/supabase';
import ConfirmationModal from '../common/ConfirmationModal';
import JoinGroupModal from './JoinGroupModal';
import useAuth from '../../hooks/useAuth';
import { GroupLiquidCard } from './GroupLiquidCard';
import { SprintyWizard } from './SprintyWizard';

// Premium Color Palette (Must match Wizard)
const PREMIUM_COLORS = [
  { hex: '#3B82F6', name: 'Electric Blue' },
  { hex: '#8B5CF6', name: 'Purple Power' },
  { hex: '#EC4899', name: 'Hot Pink' },
  { hex: '#EF4444', name: 'Red Alert' },
  { hex: '#F59E0B', name: 'Amber Energy' },
  { hex: '#10B981', name: 'Emerald Speed' },
  { hex: '#06B6D4', name: 'Cyan Future' },
  { hex: '#F97316', name: 'Orange Crush' },
];

// Modale de création d’un groupe (Refined/Premium for subsequent groups)
interface CreateGroupModalProps {
  onClose: () => void;
  onCreate: (name: string, type: 'groupe' | 'athlete', max_members: number | null, color: string) => Promise<void>;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [groupType, setGroupType] = useState<'groupe' | 'athlete'>('groupe');
  const [maxMembers, setMaxMembers] = useState<string>('');
  const [color, setColor] = useState(PREMIUM_COLORS[0].hex);
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isCreating) return;

    const finalMaxMembers =
      groupType === 'athlete' ? 1 : maxMembers.trim() === '' ? null : parseInt(maxMembers, 10);

    if (
      groupType === 'groupe' &&
      maxMembers.trim() !== '' &&
      (isNaN(Number(finalMaxMembers)) || Number(finalMaxMembers) < 1)
    ) {
      toast.error('Le nombre de membres doit être un nombre valide supérieur à 0.');
      return;
    }

    setIsCreating(true);
    try {
      await onCreate(name, groupType, finalMaxMembers, color);
      onClose();
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-md border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Nouveau Suivi</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <X size={24} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Type Selection */}
          <div className="grid grid-cols-2 gap-3">
             <button
              type="button"
              onClick={() => setGroupType('groupe')}
              className={`py-3 px-4 rounded-xl text-sm font-semibold transition-all border ${
                groupType === 'groupe'
                  ? 'bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-500/20'
                  : 'bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Groupe
            </button>
            <button
              type="button"
              onClick={() => setGroupType('athlete')}
              className={`py-3 px-4 rounded-xl text-sm font-semibold transition-all border ${
                groupType === 'athlete'
                  ? 'bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-500/20'
                  : 'bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Athlète Seul
            </button>
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Nom
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              placeholder={groupType === 'groupe' ? 'Ex: Groupe Vitesse' : 'Ex: Jean Dupont'}
              required
            />
          </div>
          
          {/* Color Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
               Couleur du thème
            </label>
            <div className="grid grid-cols-8 gap-2">
              {PREMIUM_COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setColor(c.hex)}
                  className={`w-full aspect-square rounded-full transition-all duration-200 ${
                    color === c.hex 
                      ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-gray-800 scale-110' 
                      : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {groupType === 'groupe' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Membres Max (Optionnel)
              </label>
              <input
                type="number"
                value={maxMembers}
                onChange={e => setMaxMembers(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="Illimité"
                min="1"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isCreating || !name.trim()}
            className="w-full flex justify-center items-center space-x-2 bg-primary-600 text-white py-3 rounded-xl font-semibold shadow-lg shadow-primary-500/20 hover:bg-primary-500 hover:shadow-primary-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-4"
          >
            {isCreating ? <Loader2 className="animate-spin" /> : <Plus />}
            <span>Créer</span>
          </button>
        </form>
      </div>
    </div>
  );
};

// --- Composant principal ---
const GroupManagement: React.FC = () => {
  const { user, profile } = useAuth();
  const { groups, groupsAnalytics, loading, createGroup, deleteGroup, fetchGroups } = useGroups();
  const [currentView, setCurrentView] = useState<'list' | 'details' | 'athlete'>('list');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedAthlete, setSelectedAthlete] = useState<Profile | null>(null);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setJoinModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<string | null>(null);

  const isCoach = profile?.role === 'coach';

  // --- Wizard State Check ---
  // If coach, not loading, and has 0 groups, show Wizard.
  // However, we want to persist the state that they've seen the wizard or created a group.
  // The simplest check is: groups.length === 0.
  // If groups.length === 0, we force the Wizard view instead of the empty list.
  const showWizard = isCoach && !loading && groups.length === 0;

  const handleSelectGroup = (group: Group) => {
    setSelectedGroup(group);
    setCurrentView('details');
  };

  const handleSelectGroupByAnalytics = (analyticsGroup: GroupAnalytics) => {
    const fullGroup = groups.find(g => g.id === analyticsGroup.group_id);
    if (fullGroup) {
      handleSelectGroup(fullGroup);
    } else {
      toast.error("Erreur lors de l'ouverture du groupe");
    }
  };

  const handleViewAthlete = async (athleteId: string) => {
    const athleteProfile = selectedGroup?.group_members.find(m => m.athlete_id === athleteId)?.profiles as Profile;

    if (athleteProfile) {
      setSelectedAthlete(athleteProfile);
      setCurrentView('athlete');
    } else {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(
            'id, first_name, last_name, photo_url, role, date_de_naissance, sexe, height, discipline, license_number'
          )
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
        console.error('Erreur chargement profil :', error);
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

  const handleCreateGroup = async (name: string, type: 'groupe' | 'athlete', max_members: number | null, color: string) => {
    try {
      await createGroup(name, type, max_members, color);
      toast.success(`"${name}" créé avec succès !`);
      // The hook fetchGroups will update the list, causing showWizard to become false.
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la création.");
      throw error; // Re-throw so Wizard knows to stop loading state if needed
    }
  };

  const handleDeleteClick = (groupId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setGroupToDelete(groupId);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!groupToDelete) return;
    try {
      await deleteGroup(groupToDelete);
      toast.success('Groupe supprimé.');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la suppression.');
    } finally {
      setDeleteModalOpen(false);
      setGroupToDelete(null);
    }
  };

  // --- Rendu ---
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin h-12 w-12 text-primary-500" />
      </div>
    );
  }

  // *** WIZARD / FIRST TIME EXPERIENCE ***
  if (showWizard) {
    return <SprintyWizard onCreate={handleCreateGroup} />;
  }

  if (currentView === 'details' && selectedGroup) {
    if (isCoach) {
      return <GroupControlCenter group={selectedGroup} onBack={handleBackToList} onViewAthlete={handleViewAthlete} />;
    } else {
      return <GroupDetailsPage group={selectedGroup} onBack={handleBackToList} onViewAthlete={handleViewAthlete} />;
    }
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
    <div className="p-4 space-y-5 pb-24">
      {isCoach && isCreateModalOpen && (
        <CreateGroupModal onClose={() => setCreateModalOpen(false)} onCreate={handleCreateGroup} />
      )}
      {!isCoach && isJoinModalOpen && (
        <JoinGroupModal onClose={() => setJoinModalOpen(false)} onSuccess={fetchGroups} />
      )}

      {isDeleteModalOpen && (
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Supprimer le groupe"
          message="Êtes‑vous sûr de vouloir supprimer ce groupe ? Cette action est irréversible."
        />
      )}

      {/* For standard view (not wizard), title is handled by Header now or hidden there and shown here?
          The requirement says "Header title: Gestion des suivis". 
          So we can remove the title here if we want a super clean look, OR keep it as a secondary page title.
          Let's keep existing structure but maybe refine layout. */}
      
      {/* If we are here, groups.length > 0 for coach (or user is athlete) */}

      {!isCoach && groups.length === 0 && (
        // Athlete Empty State
         <div className="text-center py-20 flex flex-col items-center justify-center">
          {/* Existing Athlete Empty State Logic */}
           <Users size={60} className="text-gray-400 mb-4" />
           <h3 className="text-xl font-semibold mb-2">Vous n'êtes dans aucun groupe</h3>
           <p className="text-gray-500 mb-6 max-w-sm">Rejoignez un groupe ou un coach en utilisant un code d’invitation.</p>
           <button
             onClick={() => setJoinModalOpen(true)}
             className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-primary-400/50 hover:bg-primary-700 transition-all duration-300 transform hover:scale-105"
           >
             <Plus />
             <span>Rejoindre un groupe</span>
           </button>
         </div>
      )}

      {/* Lists */}
      <div className="space-y-6">
        {isCoach && groupsAnalytics.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupsAnalytics.map(analyticsGroup => (
              <GroupLiquidCard 
                key={analyticsGroup.group_id}
                group={analyticsGroup}
                onClick={() => handleSelectGroupByAnalytics(analyticsGroup)}
                onDelete={(e) => handleDeleteClick(analyticsGroup.group_id, e)}
              />
            ))}
          </div>
        ) : (
          /* Athlete View List */
          groups.length > 0 && (
             <div className="space-y-4">
              {groups.map(group => (
                <div
                  key={group.id}
                  onClick={() => handleSelectGroup(group)}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-200 cursor-pointer flex justify-between items-center"
                >
                  <div>
                    <div className="flex items-center space-x-3">
                       <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          group.type === 'athlete'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}
                      >
                        {group.type === 'athlete' ? 'Athlète' : 'Groupe'}
                      </span>
                      <h3 className="text-lg font-bold">{group.name}</h3>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {group.group_members.length}
                      {group.max_members ? ` / ${group.max_members}` : ''} membre(s)
                    </p>
                  </div>
                </div>
              ))}
             </div>
          )
        )}

        {isCoach && groups.length > 0 && (
          <div className="pt-4">
            <button
              onClick={() => setCreateModalOpen(true)}
              className="w-full flex justify-center items-center space-x-2 py-4 border-2 border-dashed border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary-600 hover:border-primary-500 transition-all font-medium"
            >
              <Plus />
              <span>Créer un nouveau suivi</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupManagement;
