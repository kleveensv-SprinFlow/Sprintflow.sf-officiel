import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Nettoyer l'ancien cache localStorage au démarrage
const cleanOldCache = () => {
  const allKeys = Object.keys(localStorage);
  allKeys.forEach(key => {
    try {
      const value = localStorage.getItem(key);
      if (value && value.includes('kjmpaytnexdoyjitwzux')) {
        console.log('🧹 Nettoyage ancien cache:', key);
        localStorage.removeItem(key);
      }
    } catch (e) {
      // Ignore
    }
  });
};

cleanOldCache();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);