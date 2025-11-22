import React, { useState } from 'react';
import { Loader2, X, UserPlus } from 'lucide-react';
import { toast } from 'react-toastify';
import { useGroups } from '../../hooks/useGroups';

interface JoinGroupModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const JoinGroupModal: React.FC<JoinGroupModalProps> = ({ onClose, onSuccess }) => {
  const [invitationCode, setInvitationCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const { joinGroupWithCode } = useGroups();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitationCode.trim() || isJoining) return;

    setIsJoining(true);
    try {
      await joinGroupWithCode(invitationCode);
      toast.success("Groupe rejoint avec succès !");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'adhésion au groupe.");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-md border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Rejoindre un groupe</h2>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={24} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Code d'invitation
            </label>
            <input
              type="text"
              value={invitationCode}
              onChange={e => setInvitationCode(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all uppercase placeholder-gray-400"
              placeholder="Ex: ABCD-1234"
              required
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Demandez ce code à votre coach pour rejoindre son groupe.
            </p>
          </div>

          <button
            type="submit"
            disabled={isJoining || !invitationCode.trim()}
            className="w-full flex justify-center items-center space-x-2 bg-primary-600 text-white py-3 rounded-xl font-semibold shadow-lg shadow-primary-500/20 hover:bg-primary-500 hover:shadow-primary-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isJoining ? <Loader2 className="animate-spin" /> : <UserPlus />}
            <span>Rejoindre</span>
          </button>
        </form>
      </div>
    </div>
  );
};
