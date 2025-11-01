import React, { useState, useMemo } from 'react';
import { Plus, Users, Trash2, UserPlus, X } from 'lucide-react';
import { useGroups, Group } from '../../hooks/useGroups';
import { useCoachLinks } from '../../hooks/useCoachLinks';
import useAuth from '../../hooks/useAuth';
import { Profile } from '../../types';

const ManageMembersModal: React.FC<{
  group: Group;
  allAthletes: Profile[];
  onClose: () => void;
  onAddMember: (groupId: string, userId: string) => void;
  onRemoveMember: (groupId: string, userId: string) => void;
}> = ({ group, allAthletes, onClose, onAddMember, onRemoveMember }) => {

  const memberIds = useMemo(() => new Set(group.members.map(m => m.athlete_id)), [group.members]);

  const handleMemberToggle = (athleteId: string) => {
    if (memberIds.has(athleteId)) {
      onRemoveMember(group.id, athleteId);
    } else {
      onAddMember(group.id, athleteId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Gérer les membres de "{group.name}"</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
            <X size={24} />
          </button>
        </div>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {allAthletes.map(athlete => (
            <div key={athlete.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <span>{athlete.first_name} {athlete.last_name}</span>
              <input
                type="checkbox"
                checked={memberIds.has(athlete.id)}
                onChange={() => handleMemberToggle(athlete.id)}
                className="h-5 w-5 rounded text-primary-600 focus:ring-primary-500"
              />
            </div>
          ))}
        </div>
        <button onClick={onClose} className="mt-6 w-full bg-primary-500 text-white py-2 rounded-lg hover:bg-primary-600">
          Fermer
        </button>
      </div>
    </div>
  );
};


export const GroupManagement: React.FC = () => {
  const { user } = useAuth();
  const { groups, loading, createGroup, deleteGroup, addMemberToGroup, removeMemberFromGroup } = useGroups();
  const { linkedAthletes } = useCoachLinks(user?.id);

  const [newGroupName, setNewGroupName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || isCreating) return;

    setIsCreating(true);
    try {
      await createGroup(newGroupName);
      setNewGroupName('');
    } catch (error: any) {
      console.error("Erreur création groupe:", error.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce groupe ?')) {
      try {
        await deleteGroup(groupId);
      } catch (error: any) {
        console.error("Erreur suppression groupe:", error.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      {selectedGroup && (
        <ManageMembersModal
          group={selectedGroup}
          allAthletes={linkedAthletes}
          onClose={() => setSelectedGroup(null)}
          onAddMember={addMemberToGroup}
          onRemoveMember={removeMemberFromGroup}
        />
      )}

      <h1 className="text-2xl font-bold">Gestion des Groupes</h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
        <form onSubmit={handleCreateGroup} className="flex space-x-4">
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            className="flex-grow px-3 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500"
            placeholder="Nom du nouveau groupe"
            required
            disabled={isCreating}
          />
          <button
            type="submit"
            disabled={isCreating || !newGroupName.trim()}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
          >
            <Plus size={20} />
            <span>{isCreating ? 'Création...' : 'Créer'}</span>
          </button>
        </form>
      </div>

      {loading ? (
        <div className="text-center py-8"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
      ) : groups.length === 0 ? (
        <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow">
          <Users size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold">Aucun groupe pour le moment</h3>
          <p className="text-gray-500">Utilisez le formulaire ci-dessus pour créer votre premier groupe.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <div key={group.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">{group.name}</h3>
                <p className="text-sm text-gray-500">{group.members.length} membre(s)</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedGroup(group)}
                  className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  title="Gérer les membres"
                >
                  <UserPlus size={20} />
                </button>
                <button
                  onClick={() => handleDeleteGroup(group.id)}
                  className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  title="Supprimer le groupe"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
