
export const getSprintyAdvice = async (step: 'sleep' | 'wellness' | 'cycle' | 'summary', data?: any): Promise<string> => {
  // Simulate network delay to feel like an API
  await new Promise(resolve => setTimeout(resolve, 800));

  // Here we could add complex logic based on 'data' (e.g., if sleep < 6h, give specific advice)
  // Since we are simulating an AI response, we use context-aware static responses for now.
  
  switch (step) {
    case 'sleep':
      if (data?.sleepDuration && data.sleepDuration < 420) {
        return "Attention à ton sommeil ! Moins de 7h, ça commence à tirer sur la récupération. Essaie de te coucher plus tôt ce soir.";
      }
      return "Le sommeil est ton arme secrète pour la récupération. Dis-moi tout sur ta nuit !";
    case 'wellness':
      return "Écoute ton corps. Tes sensations (stress, humeur) impactent directement ta performance. Sois honnête, ça reste entre nous !";
    case 'cycle':
      return "Le cycle menstruel joue un rôle clé sur ta physiologie et tes capacités d'entraînement. Cette info nous aide à adapter la charge.";
    case 'summary':
      return "Tout est prêt ! Un dernier coup d'œil avant de valider. C'est le moment de lancer ta journée !";
    default:
      return "Je suis là pour t'accompagner !";
  }
};
