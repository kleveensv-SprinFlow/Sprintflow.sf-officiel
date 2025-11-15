import React from 'react';
import { AlertCircle, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ProfileLoadErrorProps {
  userId: string;
}

export function ProfileLoadError({ userId }: ProfileLoadErrorProps) {
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-')) localStorage.removeItem(key);
      });
      window.location.reload();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Profil introuvable
          </h1>

          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Votre profil n'a pas pu être chargé depuis la base de données.
          </p>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200 font-semibold mb-2">
              Causes possibles:
            </p>
            <ul className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1 list-disc list-inside">
              <li>Cookies tiers bloqués par votre navigateur</li>
              <li>Problème de connexion réseau</li>
              <li>Configuration de sécurité Supabase</li>
            </ul>
            <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-3">
              💡 Si vous êtes sur StackBlitz, essayez d'ouvrir l'application dans un nouvel onglet via le bouton "Open in New Tab".
            </p>
          </div>

          <div className="w-full bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              ID Utilisateur (pour le support):
            </p>
            <code className="text-xs font-mono text-gray-700 dark:text-gray-300 break-all">
              {userId}
            </code>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Se déconnecter
          </button>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            Si le problème persiste, contactez le support technique.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ProfileLoadError;
