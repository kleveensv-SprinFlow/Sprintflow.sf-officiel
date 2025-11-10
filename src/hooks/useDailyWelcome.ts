import { useState, useEffect } from 'react';

export const useDailyWelcome = () => {
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const lastVisitDate = localStorage.getItem('lastVisitDate');
    const today = new Date().toISOString().split('T')[0]; // Get date in YYYY-MM-DD format

    if (lastVisitDate !== today) {
      setShowWelcome(true);
      localStorage.setItem('lastVisitDate', today);
    }
  }, []);

  return showWelcome;
};
