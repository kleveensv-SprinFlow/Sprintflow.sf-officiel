import React, { useState } from 'react';
import { Plus, Users, Loader2, X, Trash2 } from 'lucide-react';
import { useGroups, Group } from '../../hooks/useGroups';
import { GroupDetailsPage } from './GroupDetailsPage';
import { AthleteDetails } from './AthleteDetails';
import { Profile } from '../../types';
import { toast } from 'react-toastify';
import { supabase } from '../../lib/supabase';
import ConfirmationModal from '../common/ConfirmationModal';
import { JoinGroupModal } from './JoinGroupModal';
import useAuth from '../../hooks/useAuth';

// Modale pour la création de groupe
interface CreateGroupModalProps {
  onClose: () => void;
  onCreate: (name: string, type: 'groupe' | 'athlete', max_members: number | null) => Promise<void>;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ onClose, onCreate }) => {
    const [name, setName] = useState('');
    const [groupType, setGroupType] = useState<'groupe' | 'athlete'>('groupe');
    const [maxMembers, setMaxMembers] = useState<string>('');
    const [isCreating, setIsCreating] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || isCreating) return;
        
        const finalMaxMembers = groupType === 'athlete' 
            ? 1 
            : maxMembers.trim() === '' ? null : parseInt(maxMembers, 10);

        if (groupType === 'groupe' && maxMembers.trim() !== '' && (isNaN(Number(finalMaxMembers)) || Number(finalMaxMembers) < 1)) {
            toast.error("Le nombre de membres doit être un nombre valide supérieur à 0.");
            return;
        }

        setIsCreating(true);
        try {
            await onCreate(name, groupType, finalMaxMembers);
            onClose();
        } finally {
            setIsCreating(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Créer un suivi</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type de suivi</label>
                    <div className="flex items-center space-x-2">
                        <button
                            type="button"
                            onClick={() => setGroupType('groupe')}
                            className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
                                groupType === 'groupe'
                                    ? 'bg-primary-600 text-white shadow-md'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                            }`}
                        >
                            Groupe
                        </button>
                        <button
                            type="button"
                            onClick={() => setGroupType('athlete')}
                            className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
                                groupType === 'athlete'
                                    ? 'bg-primary-600 text-white shadow-md'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                            }`}
                        >
                            Athlète Individuel
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {groupType === 'groupe' ? 'Nom du groupe' : 'Nom du suivi (ex: nom de l\'athlète)'}
                        </label>
                        <input
                            id="groupName"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-900"
                            placeholder={groupType === 'groupe' ? 'Ex: Groupe Élite' : 'Ex: Jean Dupont'}
                            required
                        />
                    </div>

                    {groupType === 'groupe' && (
                         <div>
                            <label htmlFor="maxMembers" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Nombre maximum de membres (optionnel)
                            </label>
                            <input
                                id="maxMembers"
                                type="number"
                                value={maxMembers}
                                onChange={(e) => setMaxMembers(e.target.value)}
                                className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-900"
                                placeholder="Laisser vide pour illimité"
                                min="1"
                            />
                        </div>
                    )}

                    <button type="submit" disabled={isCreating || !name.trim()} className="mt-4 w-full flex justify-center items-center space-x-2 bg-primary-500 text-white py-2 rounded-lg hover:bg-primary-600 disabled:opacity-50">
                        {isCreating ? <Loader2 className="animate-spin" /> : <Plus />}
                        <span>{isCreating ? 'Création...' : 'Créer'}</span>
                    </button>
                </form>
            </div>
        </div>
    );
};

// --- Composant principal ---
const GroupManagement: React.FC = () => {
  const { user, profile } = useAuth();
  const { groups, loading, createGroup, deleteGroup, fetchGroups } = useGroups();
  const [currentView, setCurrentView] = useState<'list' | 'details' | 'athlete'>('list');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedAthlete, setSelectedAthlete] = useState<Profile | null>(null);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setJoinModalOpen] = useState(false);
  
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<string | null>(null);

  const isCoach = profile?.role === 'coach';

  const handleSelectGroup = (group: Group) => {
    setSelectedGroup(group);
    setCurrentView('details');
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
  }

  const handleCreateGroup = async (name: string, type: 'groupe' | 'athlete', max_members: number | null) => {
    try {
        await createGroup(name, type, max_members);
        toast.success(`"${name}" créé avec succès !`);
    } catch (error: any) {
        toast.error(error.message || "Erreur lors de la création.");
    }
  };
  
  // --- MODIFIÉ : Ouvre la modale de confirmation ---
  const handleDeleteClick = (groupId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setGroupToDelete(groupId);
    setDeleteModalOpen(true);
  };

  // --- NOUVEAU : Gère la suppression après confirmation ---
  const handleConfirmDelete = async () => {
    if (!groupToDelete) return;
    try {
        await deleteGroup(groupToDelete);
        toast.success("Groupe supprimé.");
    } catch (error: any) {
        toast.error(error.message || "Erreur lors de la suppression.");
    } finally {
        setDeleteModalOpen(false);
        setGroupToDelete(null);
    }
  };


  // --- Rendu du composant ---

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin h-8 w-8 text-primary-500" /></div>;
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
        joined_at: new Date().toISOString(), // Placeholder
    };
    return <AthleteDetails athlete={athleteDataForDetails} onBack={handleBackToDetails} />;
  }

  // --- Vue principale (liste des groupes) ---
  return (
    <div className="p-4 space-y-5">
       {isCoach && isCreateModalOpen && <CreateGroupModal onClose={() => setCreateModalOpen(false)} onCreate={handleCreateGroup} />}
       {!isCoach && isJoinModalOpen && <JoinGroupModal onClose={() => setJoinModalOpen(false)} onSuccess={fetchGroups} />}

       {isDeleteModalOpen && (
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Supprimer le groupe"
          message="Êtes-vous sûr de vouloir supprimer ce groupe ? Cette action est irréversible."
        />
       )}
       
       <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{isCoach ? "Mes Suivis" : "Mon Groupe & Coach"}</h1>

       {groups.length === 0 ? (
            <div className="text-center py-20 flex flex-col items-center justify-center">
                <Users size={60} className="text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">{isCoach ? "Commencez par créer un suivi" : "Vous n'êtes dans aucun groupe"}</h3>
                <p className="text-gray-500 mb-6 max-w-sm">
                    {isCoach 
                        ? "Créez des groupes pour gérer vos athlètes ou des suivis individuels." 
                        : "Rejoignez un groupe ou un coach en utilisant un code d'invitation."}
                </p>
                <button 
                  onClick={() => isCoach ? setCreateModalOpen(true) : setJoinModalOpen(true)} 
                  className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-primary-400/50 hover:bg-primary-700 transition-all duration-300 transform hover:scale-105"
                >
                    <Plus />
                    <span>{isCoach ? "Créer un suivi" : "Rejoindre un groupe"}</span>
                </button>
            </div>
       ) : (
            <div className="space-y-4">
                {groups.map((group) => (
                    <div key={group.id} onClick={() => handleSelectGroup(group)} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-200 cursor-pointer flex justify-between items-center">
                        <div>
                            <div className="flex items-center space-x-3">
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${group.type === 'athlete' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}`}>
                                {group.type === 'athlete' ? 'Athlète' : 'Groupe'}
                              </span>
                              <h3 className="text-lg font-bold">{group.name}</h3>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {group.group_members.length} 
                              {group.max_members ? ` / ${group.max_members}` : ''} membre(s)
                            </p>
                        </div>
                        {isCoach && (
                          <div className="flex items-center space-x-2">
                               <button onClick={(e) => handleDeleteClick(group.id, e)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full transition-colors">
                                  <Trash2 size={18} className="text-red-500" />
                              </button>
                          </div>
                        )}
                    </div>
                ))}

                {isCoach && (
                  <div className="pt-4">
                       <button onClick={() => setCreateModalOpen(true)} className="w-full flex justify-center items-center space-x-2 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-primary-600 hover:border-primary-500 transition-all">
                          <Plus />
                          <span>Créer un nouveau suivi</span>
                      </button>
                  </div>
                )}
            </div>
       )}
    </div>
  );
};

export default GroupManagement;