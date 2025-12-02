import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Calendar, HeartPulse, ClipboardCheck } from 'lucide-react';
import { useGroups } from '../../hooks/useGroups';
import { AthleteDetails } from '../groups/AthleteDetails';

// Import de l'ancienne AthletesList pour réutilisation partielle si besoin, 
// mais ici on va réimplémenter la logique pour supporter le tri contextuel.

interface MyFollowUpsPageProps {
  onBack: () => void;
  initialFilter?: 'wellness' | 'attendance' | 'no-checkin';
}

const MyFollowUpsPage: React.FC<MyFollowUpsPageProps> = ({ onBack, initialFilter }) => {
  const { groups, loading: loadingGroups } = useGroups();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedAthlete, setSelectedAthlete] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState<string>(initialFilter || 'all');
  
  // Utilisation d'un hook hypothétique ou récupération des checkins
  // Si useCheckins n'existe pas ou ne fait pas ça, on devra le faire manuellement
  // Pour l'instant on va supposer qu'on peut récupérer les états de santé via les groupes ou un autre moyen
  // En attendant, on va simuler ou extraire les données disponibles dans groups (si elles y sont)
  // Note: Dans useGroups, on a souvent les membres. Il faudrait idéalement une RPC qui donne le statut du jour.
  // On va faire au mieux avec les données statiques + simulation de statut si pas de backend temps réel pour l'instant.
  
  // Update filter if prop changes
  useEffect(() => {
    if (initialFilter) setActiveFilter(initialFilter);
  }, [initialFilter]);

  // --- EXTRACTION ET TRI DES ATHLÈTES ---
  const processedAthletes = React.useMemo(() => {
    if (loadingGroups) return [];

    const athletesMap = new Map();

    groups.forEach(group => {
      if (group.members) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        group.members.forEach((member: any) => {
          const athleteId = member.athlete_id;
          
          // Récupération des données basiques
          const baseData = {
             id: athleteId,
             first_name: member.athlete?.first_name || member.profiles?.first_name || 'Prénom',
             last_name: member.athlete?.last_name || member.profiles?.last_name || 'Nom',
             photo_url: member.athlete?.photo_url || member.profiles?.photo_url,
             joined_at: member.joined_at,
             groups: [group.name],
             // --- MOCK DATA FOR SORTING (Waiting for real backend data integration) ---
             // TODO: Connecter aux vraies données de checkin/santé
             // Pour l'instant on initialise à des valeurs par défaut "neutres"
             wellness_status: 'healthy', // 'injured', 'tired', 'healthy'
             attendance_status: 'present', // 'absent', 'late', 'present'
             has_checkin: true
          };

          if (!athletesMap.has(athleteId)) {
             athletesMap.set(athleteId, baseData);
          } else {
             const existing = athletesMap.get(athleteId);
             existing.groups.push(group.name);
          }
        });
      }
    });

    const result = Array.from(athletesMap.values());

    // --- APPLICATION DU FILTRE ET TRI ---
    if (activeFilter === 'wellness') {
        // Mock sorting: In real app, we would sort by actual wellness data
        // Here we just keep the list as is but ideally it should sort Injured > Tired > Healthy
        // Since we don't have the real data fields yet in 'groups', we just display the list.
        // We will add a visual indicator that filtering is active.
    } else if (activeFilter === 'attendance') {
        // Sort Absent > Late > Present
    } else if (activeFilter === 'no-checkin') {
        // Filter where has_checkin is false
    }

    return result;
  }, [groups, loadingGroups, activeFilter]);


  if (selectedAthlete) {
    return (
      <div className="bg-white dark:bg-gray-900 min-h-screen">
         <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-4 sticky top-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur z-10">
            <button 
              onClick={() => setSelectedAthlete(null)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft size={24} className="text-gray-600 dark:text-gray-300"/>
            </button>
            <h2 className="text-xl font-bold dark:text-white">Détails Athlète</h2>
         </div>
         <AthleteDetails 
           athleteId={selectedAthlete.id} 
           athleteName={`${selectedAthlete.first_name} ${selectedAthlete.last_name}`}
         />
      </div>
    )
  }

  return (
    <div className="p-4 pb-24 min-h-screen bg-gray-50 dark:bg-gray-900">
      
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={onBack} 
          className="p-2 -ml-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft size={24} className="text-gray-700 dark:text-gray-200" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-none">
            Mes Athlètes
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {processedAthletes.length} athlètes suivis
          </p>
        </div>
      </div>

      {/* FILTRES RAPIDES (Tabs) */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        <FilterTab 
          label="Tous" 
          active={activeFilter === 'all'} 
          onClick={() => setActiveFilter('all')} 
          icon={Users}
        />
        <FilterTab 
          label="Santé" 
          active={activeFilter === 'wellness'} 
          onClick={() => setActiveFilter('wellness')} 
          icon={HeartPulse}
          alert={activeFilter === 'wellness'} // Highlight if active
        />
        <FilterTab 
          label="Présence" 
          active={activeFilter === 'attendance'} 
          onClick={() => setActiveFilter('attendance')} 
          icon={Calendar}
        />
        <FilterTab 
          label="Check-in Manquant" 
          active={activeFilter === 'no-checkin'} 
          onClick={() => setActiveFilter('no-checkin')} 
          icon={ClipboardCheck}
        />
      </div>

      {/* LISTE DES ATHLÈTES */}
      <div className="space-y-3">
        {processedAthletes.length === 0 ? (
           <div className="text-center py-12">
             <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
               <Users className="text-gray-400" size={32} />
             </div>
             <p className="text-gray-500 font-medium">Aucun athlète trouvé</p>
           </div>
        ) : (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          processedAthletes.map((athlete: any) => (
            <div 
              key={athlete.id}
              onClick={() => setSelectedAthlete(athlete)}
              className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4 active:scale-[0.98] transition-all cursor-pointer"
            >
              {/* Avatar */}
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                  {athlete.photo_url ? (
                    <img src={athlete.photo_url} alt={athlete.first_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">
                      {athlete.first_name[0]}{athlete.last_name[0]}
                    </div>
                  )}
                </div>
                {/* Status Indicator (Mocked for now) */}
                {activeFilter === 'wellness' && (
                   <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full flex items-center justify-center">
                     <HeartPulse size={10} className="text-white" />
                   </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 dark:text-white truncate">
                  {athlete.first_name} {athlete.last_name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                   {athlete.groups.map((g: string) => (
                     <span key={g} className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300">
                       {g}
                     </span>
                   ))}
                </div>
              </div>

              {/* Chevron */}
              <ArrowLeft className="rotate-180 text-gray-300" size={20} />
            </div>
          ))
        )}
      </div>

    </div>
  );
};

// Composant Tab Helper
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FilterTab: React.FC<{ label: string, active: boolean, onClick: () => void, icon: any, alert?: boolean }> = ({ label, active, onClick, icon: Icon, alert }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
      active 
        ? 'bg-black dark:bg-white text-white dark:text-black border-transparent shadow-lg transform scale-105' 
        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
    }`}
  >
    <Icon size={16} className={alert ? 'text-red-500' : ''} />
    {label}
  </button>
);

export default MyFollowUpsPage;
