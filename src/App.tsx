// Ajoutez dans viewTitles
const viewTitles: Record<string, string> = {
  '/': 'Accueil',
  '/planning': 'Planning',
  '/nutrition': 'Nutrition',
  '/groupes': 'Mes Suivis',  // Nouveau
  '/sprinty': 'Sprinty',
  // ... autres routes
};

// Mettez à jour pathToTab
const pathToTab = (path: string): Tab => {
  if (path.startsWith('/planning')) return 'planning';
  if (path.startsWith('/nutrition')) return 'nutrition';
  if (path.startsWith('/groupes')) return 'groupes';
  if (path.startsWith('/sprinty')) return 'sprinty';
  if (path === '/') return 'accueil';
  return 'accueil';
};

// Dans handleTabChange
const handleTabChange = (tab: Tab) => {
  switch (tab) {
    case 'accueil': navigate('/'); break;
    case 'planning': navigate('/planning'); break;
    case 'nutrition': navigate('/nutrition'); break;
    case 'groupes': navigate('/groupes'); break;  // Nouveau
    case 'sprinty': navigate('/sprinty'); break;
  }
};

// Mettez à jour showTabBar pour inclure /groupes
const showTabBar = ['/', '/planning', '/nutrition', '/groupes', '/sprinty', '/records'].includes(currentPath);

// Passez le rôle à TabBar
{showTabBar && (
  <TabBar
    activeTab={pathToTab(currentPath)}
    onTabChange={handleTabChange}
    onFabClick={handleFabClick}
    showPlanningNotification={false}
    showCoachNotification={true}
    userRole={profile?.role}  // Ajoutez cette prop
  />
)}