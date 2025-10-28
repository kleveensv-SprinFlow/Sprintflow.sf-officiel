import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Nettoyer TOUT le cache au démarrage pour forcer un reset complet
console.log('🧹 NETTOYAGE COMPLET DU CACHE...');
localStorage.clear();
sessionStorage.clear();
console.log('✅ Cache vidé, démarrage propre');

// Enregistrer le service worker pour PWA
const updateSW = registerSW({
  onNeedRefresh() {
    console.log('🔄 Nouvelle version disponible');
  },
  onOfflineReady() {
    console.log('📱 Application prête hors ligne');
  },
  immediate: true
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);