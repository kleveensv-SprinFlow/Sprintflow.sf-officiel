import React, { useState } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import { useGroups } from '../../hooks/useGroups';
import { toast } from 'react-toastify';

interface JoinGroupModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const JoinGroupModal: React.FC<JoinGroupModalProps> = ({ onClose, onSuccess }) => {
  const [invitationCode, setInvitationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { joinGroupWithCode } = useGroups();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitationCode.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const result = await joinGroupWithCode(invitationCode.trim().toUpperCase());
      toast.success(result.message || "Demande envoyée avec succès !");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Erreur pour rejoindre le groupe:", error);
      toast.error(error.message || "Une erreur est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm transform transition-all duration-300 scale-95 animate-in fade-in-0 zoom-in-95">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Rejoindre un groupe</h2>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Fermer"
          >
            <X size={24} />
          </button>
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
          Saisissez le code d'invitation à 6 caractères fourni par votre coach pour envoyer une demande.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={invitationCode}
            onChange={(e) => setInvitationCode(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-center text-lg font-mono tracking-widest uppercase focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
            placeholder="ABC-123"
            maxLength={6}
            required
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !invitationCode.trim()}
            className="w-full flex justify-center items-center space-x-2 px-4 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-primary-400/50"
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
            <span>{isLoading ? 'Envoi...' : 'Envoyer la demande'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};