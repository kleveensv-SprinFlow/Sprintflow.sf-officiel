import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Nettoyer TOUT le cache au démarrage pour forcer un reset complet
console.log('🧹 NETTOYAGE COMPLET DU CACHE...');
localStorage.clear();
sessionStorage.clear();
console.log('✅ Cache vidé, démarrage propre');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);