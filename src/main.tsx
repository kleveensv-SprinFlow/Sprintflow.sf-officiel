import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

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