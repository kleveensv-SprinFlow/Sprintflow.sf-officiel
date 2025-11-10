// src/components/sharing/SharePerformancePage.tsx
import React from 'react';

interface SharePerformancePageProps {
  onClose: () => void;
}

const SharePerformancePage: React.FC<SharePerformancePageProps> = ({ onClose }) => {
  return (
    <div className="p-4 fixed inset-0 bg-light-background dark:bg-dark-background z-50">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Partager un Exploit</h1>
        <button onClick={onClose} className="p-2">✕</button>
      </div>
      <p>La fonctionnalité pour partager un exploit sera implémentée ici.</p>
    </div>
  );
};

export default SharePerformancePage;
