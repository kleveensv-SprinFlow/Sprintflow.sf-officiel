import React, { useState } from 'react';
import { Plus, Users, Loader2, X, Trash2 } from 'lucide-react';
import { useGroups, Group } from '../../hooks/useGroups';
import { GroupDetailsPage } from './GroupDetailsPage';
import { AthleteDetails } from './AthleteDetails';
import { Profile } from '../../types';
import { toast } from 'react-toastify';
import { supabase } from '../../lib/supabase';

// Modale pour la création de groupe
const CreateGroupModal: React.FC<{ onClose: () => void; onCreate: (name: string) => Promise<void>; }> = ({ onClose, onCreate }) => {
    const [name, setName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || isCreating) return;
        setIsCreating(true);
        try {
            await onCreate(name);
            onClose();
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Créer un nouveau groupe</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Nom du groupe"
                        required
                    />
                    <button type="submit" disabled={isCreating || !name.trim()} className="mt-4 w-full flex justify-center items-center space-x-2 bg-primary-500 text-white py-2 rounded-lg hover:bg-primary-600 disabled:opacity-50">
                        {isCreating ? <Loader2 className="animate-spin" /> : <Plus />}
                        <span>{isCreating ? 'Création...' : 'Créer le groupe'}</span>
                    </button>
                </form>
            </div>
        </div>
    );
};

// --- Composant principal ---
export const GroupManagement: React.FC = () => {
  const { groups, loading, createGroup, deleteGroup } = useGroups();
  const [currentView, setCurrentView] = useState<'list' | 'details' | 'athlete'>('list');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedAthlete, setSelectedAthlete] = useState<Profile | null>(null); // Pour la fiche athlète
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

  const handleSelectGroup = (group: Group) => {
    setSelectedGroup(group);
    setCurrentView('details');
  };
  
  // Cette fonction sera passée à GroupDetailsPage
  const handleViewAthlete = async (athleteId: string) => {
      console.log('🔍 handleViewAthlete appelé avec athleteId:', athleteId);
      console.log('🔍 selectedGroup:', selectedGroup);
      console.log('🔍 group_members:', selectedGroup?.group_members);

      // Vérifier d'abord si c'est un membre du groupe
      const athleteProfile = selectedGroup?.group_members.find(m => m.athlete_id === athleteId)?.profiles as Profile;
      console.log('🔍 athleteProfile trouvé dans group_members:', athleteProfile);

      if (athleteProfile) {
          setSelectedAthlete(athleteProfile);
          setCurrentView('athlete');
      } else {
          // Si pas trouvé dans group_members, charger depuis la base (cas du coach)
          console.log('🔍 Pas trouvé dans group_members, chargement depuis DB...');
          try {
              const { data, error } = await supabase
                  .from('profiles')
                  .select('id, first_name, last_name, avatar_url, role, date_de_naissance, sexe, height, discipline, license_number')
                  .eq('id', athleteId)
                  .maybeSingle();

              console.log('🔍 Résultat DB:', { data, error });
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

  const handleCreateGroup = async (name: string) => {
    try {
        await createGroup(name);
        toast.success(`Groupe "${name}" créé avec succès !`);
    } catch (error: any) {
        toast.error(error.message || "Erreur lors de la création.");
    }
  };
  
  const handleDeleteGroup = async (groupId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Empêche le clic de sélectionner le groupe
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce groupe ? Toutes les données associées seront perdues.')) {
        try {
            await deleteGroup(groupId);
            toast.success("Groupe supprimé.");
        } catch (error: any) {
            toast.error(error.message || "Erreur lors de la suppression.");
        }
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
    // Note: AthleteDetails attend un format de données spécifique.
    // On doit l'adapter ici.
    const athleteDataForDetails = {
        id: selectedAthlete.id,
        first_name: selectedAthlete.first_name || '',
        last_name: selectedAthlete.last_name || '',
        photo_url: selectedAthlete.avatar_url,
        joined_at: new Date().toISOString(), // Placeholder, car cette info n'est pas dans le profil
    };
    return <AthleteDetails athlete={athleteDataForDetails} onBack={handleBackToDetails} />;
  }

  // --- Vue principale (liste des groupes) ---
  return (
    <div className="p-4 space-y-5">
       {isCreateModalOpen && <CreateGroupModal onClose={() => setCreateModalOpen(false)} onCreate={handleCreateGroup} />}
       
       {/* Le header est géré par App.tsx, on met juste le titre de la page ici */}
       <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mes Groupes</h1>

       {groups.length === 0 ? (
            <div className="text-center py-20 flex flex-col items-center justify-center">
                <Users size={60} className="text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Commencez par créer un groupe</h3>
                <p className="text-gray-500 mb-6 max-w-sm">Les groupes vous permettent de gérer vos athlètes, de planifier des entraînements et de suivre leurs progrès.</p>
                <button onClick={() => setCreateModalOpen(true)} className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-primary-400/50 hover:bg-primary-700 transition-all duration-300 transform hover:scale-105">
                    <Plus />
                    <span>Créer mon premier groupe</span>
                </button>
            </div>
       ) : (
            <div className="space-y-4">
                {groups.map((group) => (
                    <div key={group.id} onClick={() => handleSelectGroup(group)} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-200 cursor-pointer flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-bold">{group.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{group.group_members.length} membre(s)</p>
                        </div>
                        <div className="flex items-center space-x-2">
                             <button onClick={(e) => handleDeleteGroup(group.id, e)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full transition-colors">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
                <div className="pt-4">
                     <button onClick={() => setCreateModalOpen(true)} className="w-full flex justify-center items-center space-x-2 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-primary-600 hover:border-primary-500 transition-all">
                        <Plus />
                        <span>Créer un nouveau groupe</span>
                    </button>
                </div>
            </div>
       )}
    </div>
  );
};

export default GroupManagement;
