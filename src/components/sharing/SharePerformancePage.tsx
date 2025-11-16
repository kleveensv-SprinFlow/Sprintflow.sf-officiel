import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const SharePerformancePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-sprint-light-background dark:bg-sprint-dark-background">
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-sprint-light-surface dark:hover:bg-sprint-dark-surface transition-colors"
            aria-label="Retour"
          >
            <ArrowLeft className="w-6 h-6 text-sprint-light-text-primary dark:text-sprint-dark-text-primary" />
          </button>
          <h1 className="text-2xl font-bold text-sprint-light-text-primary dark:text-sprint-dark-text-primary">
            Partager un Exploit
          </h1>
        </div>

        <div className="bg-sprint-light-surface dark:bg-sprint-dark-surface rounded-xl p-6">
          <p className="text-sprint-light-text-secondary dark:text-sprint-dark-text-secondary">
            La fonctionnalité pour partager un exploit sera implémentée ici.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SharePerformancePage;
