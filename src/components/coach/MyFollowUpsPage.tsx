import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Users, Calendar, HeartPulse, ClipboardCheck } from 'lucide-react';
import { useGroups } from '../../hooks/useGroups';
import { AthleteDetails } from '../groups/AthleteDetails';

// Types de filtres supportés par le composant
type FilterType = 'all' | 'wellness' | 'attendance' | 'no-checkin';

interface MyFollowUpsPageProps {
  onBack: () => void;
  // Accepte aussi 'health' comme alias de 'wellness' pour compatibilité avec KPIGrid
  initialFilter?: FilterType | 'health';
}

const MyFollowUpsPage: React.FC<MyFollowUpsPageProps> = ({ onBack, initialFilter }) => {
  const { groups, loading: loadingGroups } = useGroups();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedAthlete, setSelectedAthlete] = useState<any>(null);
  
  // Normaliser le filtre initial: 'health' devient 'wellness'
  const normalizeFilter = (filter?: string): FilterType => {
    if (filter === 'health') return 'wellness';
    if (filter === 'wellness' || filter === 'attendance' || filter === 'no-checkin') return filter;
    return 'all';
  };
  
  const [activeFilter, setActiveFilter] = useState<FilterType>(normalizeFilter(initialFilter));
  
  // Update filter if prop changes
  useEffect(() => {
    if (initialFilter) {
      setActiveFilter(normalizeFilter(initialFilter));
    }
  }, [initialFilter]);

  // --- EXTRACTION ET TRI DES ATHLÈTES ---
  const processedAthletes = useMemo(() => {
    if (loadingGroups) return [];

    const athletesMap = new Map();

    groups.forEach(group => {
      if (group.members) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        group.members.forEach((member: any) => {
          const athleteId = member.athlete_id;
          
          // --- SMART MOCK DATA (Pour test UX) ---
          // Génère un statut aléatoire stable basé sur l'ID pour simuler la réalité
          // En production, remplace ceci par member.wellness_status venant de la DB
          const mockWellness = ['healthy', 'healthy', 'healthy', 'tired', 'injured'];
          const randomWellness = mockWellness[athleteId.charCodeAt(0) % mockWellness.length];
          
          const mockAttendance = ['present', 'present', 'present', 'late', 'absent'];
          const randomAttendance = mockAttendance[athleteId.charCodeAt(athleteId.length - 1) % mockAttendance.length];

          // Récupération des données basiques
          const baseData = {
             id: athleteId,
             first_name: member.athlete?.first_name || member.profiles?.first_name || 'Prénom',
             last_name: member.athlete?.last_name || member.profiles?.last_name || 'Nom',
             photo_url: member.athlete?.photo_url || member.profiles?.photo_url,
             joined_at: member.joined_at,
             groups: [group.name],
             
             // Utilisation du Mock "Smart" pour voir les couleurs changer
             wellness_status: member.wellness_status || randomWellness, 
             attendance_status: member.attendance_status || randomAttendance,
             has_checkin: Math.random() > 0.3 // 30% n'ont pas checkin
          };

          if (!athletesMap.has(athleteId)) {
             athletesMap.set(athleteId, baseData);
          } else {
             const existing = athletesMap.get(athleteId);
             // Avoid duplicate group names
             if (!existing.groups.includes(group.name)) {
                existing.groups.push(group.name);
             }
          }
        });
      }
    });

    let result = Array.from(athletesMap.values());

    // --- APPLICATION DU FILTRE ET TRI ---
    if (activeFilter === 'wellness') {
        // Tri par statut de santé: Injured (0) > Tired (1) > Healthy (2)
        const statusOrder: Record<string, number> = { 'injured': 0, 'tired': 1, 'healthy': 2 };
        result = result.sort((a, b) => 
          (statusOrder[a.wellness_status] ?? 2) - (statusOrder[b.wellness_status] ?? 2)
        );
    } else if (activeFilter === 'attendance') {
        // Tri par statut de présence: Absent (0) > Late (1) > Present (2)
        const statusOrder: Record<string, number> = { 'absent': 0, 'late': 1, 'present': 2 };
        result = result.sort((a, b) => 
          (statusOrder[a.attendance_status] ?? 2) - (statusOrder[b.attendance_status] ?? 2)
        );
    } else if (activeFilter === 'no-checkin') {
        // Filtrer uniquement ceux sans check-in
        result = result.filter(a => !a.has_checkin);
    } else {
        // Tri par défaut (Alphabétique)
        result = result.sort((a, b) => a.last_name.localeCompare(b.last_name));
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
            {processedAthletes.length} athlètes {activeFilter !== 'all' ? `(filtre: ${getFilterLabel(activeFilter)})` : 'suivis'}
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
          alert={activeFilter === 'wellness'}
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
             {activeFilter !== 'all' && (
               <button 
                 onClick={() => setActiveFilter('all')}
                 className="mt-2 text-sm text-sprint-primary hover:underline"
               >
                 Voir tous les athlètes
               </button>
             )}
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
                {/* Status Indicator based on active filter */}
                {(activeFilter === 'wellness' || activeFilter === 'all') && athlete.wellness_status !== 'healthy' && (
                   <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${getWellnessColor(athlete.wellness_status)} border-2 border-white dark:border-gray-800 rounded-full flex items-center justify-center`}>
                     <HeartPulse size={10} className="text-white" />
                   </div>
                )}
                {activeFilter === 'attendance' && (
                   <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${getAttendanceColor(athlete.attendance_status)} border-2 border-white dark:border-gray-800 rounded-full flex items-center justify-center`}>
                     <Calendar size={10} className="text-white" />
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

// Helper: Obtenir le label du filtre actif
const getFilterLabel = (filter: FilterType): string => {
  switch (filter) {
    case 'wellness': return 'Santé';
    case 'attendance': return 'Présence';
    case 'no-checkin': return 'Sans check-in';
    default: return '';
  }
};

// Helper: Couleur selon le statut de bien-être
const getWellnessColor = (status: string): string => {
  switch (status) {
    case 'injured': return 'bg-red-500';
    case 'tired': return 'bg-orange-500';
    case 'healthy': return 'bg-green-500';
    default: return 'bg-gray-400';
  }
};

// Helper: Couleur selon le statut de présence
const getAttendanceColor = (status: string): string => {
  switch (status) {
    case 'absent': return 'bg-red-500';
    case 'late': return 'bg-orange-500';
    case 'present': return 'bg-green-500';
    default: return 'bg-gray-400';
  }
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