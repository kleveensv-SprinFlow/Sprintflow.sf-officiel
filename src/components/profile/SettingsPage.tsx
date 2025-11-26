import React from 'react';
import { ChevronRight, Lock, Globe, HelpCircle, Info } from 'lucide-react';
import { toast } from 'react-toastify';

// Un composant réutilisable pour chaque ligne de paramètre
const SettingsItem = ({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="flex items-center justify-between w-full p-4 rounded-lg bg-gray-800/50 hover:bg-gray-700/70 transition-colors"
  >
    <div className="flex items-center space-x-4">
      {icon}
      <span className="text-lg">{label}</span>
    </div>
    <ChevronRight className="w-6 h-6 text-gray-400" />
  </button>
);

export default function SettingsPage() {
  // Fonctions de placeholder pour les actions
  const handleChangePassword = () => {
    // TODO: Implémenter la logique de changement de mot de passe (ex: modale)
    toast.info("Fonctionnalité 'Changer le mot de passe' à venir.");
  };

  const handleChangeLanguage = () => {
    // TODO: Implémenter la logique de changement de langue
    toast.info("Fonctionnalité 'Changer de langue' à venir.");
  };

  const handleFaq = () => {
    // Laissé vide comme demandé
  };

  const handleHelp = () => {
    // Laissé vide comme demandé
  };

  return (
    <div className="min-h-screen bg-sprint-dark-background text-white pt-20 p-4">
      <h2 className="text-3xl font-bold mb-8 px-2">Paramètres</h2>
      
      <div className="space-y-4">
        <SettingsItem
          icon={<Lock className="w-6 h-6 text-accent" />}
          label="Changer le mot de passe"
          onClick={handleChangePassword}
        />
        <SettingsItem
          icon={<Globe className="w-6 h-6 text-accent" />}
          label="Changer de langue"
          onClick={handleChangeLanguage}
        />
        <SettingsItem
          icon={<HelpCircle className="w-6 h-6 text-accent" />}
          label="FAQ"
          onClick={handleFaq}
        />
        <SettingsItem
          icon={<Info className="w-6 h-6 text-accent" />}
          label="AIDE"
          onClick={handleHelp}
        />
      </div>
    </div>
  );
}
