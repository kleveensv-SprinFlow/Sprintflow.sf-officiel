import React, { useState, useEffect } from 'react'
import { ArrowLeft, Trophy, User, Dumbbell, Calendar, Clock, MapPin, Weight, Target, Trash2, TrendingUp, TrendingDown, Minus, Filter } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { supabase } from '../../lib/supabase'
import useAuth from '../../hooks/useAuth'
import { AthleteWorkoutCalendar } from './AthleteWorkoutCalendar'

interface AthleteDetailsProps {
  athlete: {
    id: string
    first_name: string
    last_name: string
    photo_url?: string
    joined_at: string
  }
  onBack: () => void
}

// Types pour les données de l'athlète
interface AthleteRecord {
  id: string
  type: 'run' | 'exercise'
  name: string
  value: number
  unit: string
  date: string
}

interface AthleteWorkout {
  id: string
  date: string
  runs: Array<{
    id: string
    distance: number
    time: number
  }>
  exercises: Array<{
    id: string
    name: string
    sets: number
    reps: number
    weight?: number
  }>
  notes?: string
}

interface AthleteBodyComp {
  id: string
  date: string
  weight: number
  height: number
  water_percentage: number
  total_muscle: number
  skeletal_muscle: number
  body_fat_percentage: number
}

export const AthleteDetails: React.FC<AthleteDetailsProps> = ({ athlete, onBack }) => {
  const [records, setRecords] = useState<AthleteRecord[]>([])
  const [workouts, setWorkouts] = useState<AthleteWorkout[]>([])
  const [bodyComps, setBodyComps] = useState<AthleteBodyComp[]>([])
  const [activeTab, setActiveTab] = useState<'records' | 'workouts' | 'bodycomp'>('records')
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'run' | 'jump' | 'throw' | 'exercise'>('all')
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    loadAthleteData()
  }, [athlete.id])

  const loadAthleteData = async () => {
    if (!athlete.id) return
    
    setLoading(true)
    
    try {
      console.log('🔍 === DÉBUT CHARGEMENT DONNÉES ATHLÈTE ===')
      console.log('📊 Athlète ID:', athlete.id)
      console.log('👨‍🏫 Coach ID:', user?.id)
      
      // Charger les records réels
      const { data: recordsData, error: recordsError } = await supabase
        .from('records')
        .select('*')
        .eq('user_id', athlete.id)
        .order('date', { ascending: false })
      
      console.log('📋 Records - Données:', recordsData?.length || 0, 'records trouvés')
      console.log('📋 Records - Erreur:', recordsError?.message || 'Aucune')
      
      if (recordsError) {
        console.error('❌ ERREUR RECORDS RLS:', {
          message: recordsError.message,
          code: recordsError.code,
          details: recordsError.details,
          hint: recordsError.hint
        })
        setRecords([])
      } else {
        console.log('✅ RECORDS CHARGÉS:', recordsData?.length || 0)
        
        const mappedRecords: AthleteRecord[] = recordsData?.map(item => ({
          id: item.id,
          type: (item.exercise_name.includes('m') && !item.exercise_name.toLowerCase().includes('saut')) ? 'run' : 
                (item.exercise_name.toLowerCase().includes('saut')) ? 'jump' : 'exercise',
          name: item.exercise_name,
          value: parseFloat(item.value),
          unit: (item.exercise_name.includes('m') && !item.exercise_name.toLowerCase().includes('saut')) ? 's' : 
                (item.exercise_name.toLowerCase().includes('saut')) ? 'm' : 'kg',
          date: item.date
        })) || []
        
        setRecords(mappedRecords)
      }
      
      // Charger les workouts réels
      const { data: workoutsData, error: workoutsError } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', athlete.id)
        .order('date', { ascending: false })
        .limit(10)
      
      if (workoutsError) {
        console.error('❌ ERREUR WORKOUTS RLS:', {
          message: workoutsError.message,
          code: workoutsError.code,
          details: workoutsError.details
        })
        setWorkouts([])
      } else {
        console.log('✅ WORKOUTS CHARGÉS:', workoutsData?.length || 0)
        // Mapper les workouts avec le contenu JSON
        const mappedWorkouts: AthleteWorkout[] = workoutsData?.map(item => ({
          id: item.id,
          date: item.date,
          runs: item.runs ? (typeof item.runs === 'string' ? JSON.parse(item.runs) : item.runs) : [],
          jumps: item.jumps ? (typeof item.jumps === 'string' ? JSON.parse(item.jumps) : item.jumps) : [],
          throws: item.throws ? (typeof item.throws === 'string' ? JSON.parse(item.throws) : item.throws) : [],
          exercises: item.exercises ? (typeof item.exercises === 'string' ? JSON.parse(item.exercises) : item.exercises) : [],
          notes: item.notes
        })) || []
        setWorkouts(mappedWorkouts)
      }
      
      // Charger les compositions corporelles réelles
      const { data: bodyCompsData, error: bodyCompsError } = await supabase
        .from('body_compositions')
        .select('*')
        .eq('user_id', athlete.id)
        .order('date', { ascending: false })
      
      console.log('📊 Body Compositions - Données:', bodyCompsData?.length || 0, 'mesures trouvées')
      console.log('📊 Body Compositions - Erreur:', bodyCompsError?.message || 'Aucune')
      
      if (bodyCompsError) {
        console.error('❌ ERREUR BODY COMPOSITIONS RLS:', {
          message: bodyCompsError.message,
          code: bodyCompsError.code,
          details: bodyCompsError.details
        })
        setBodyComps([])
      } else {
        console.log('✅ BODY COMPOSITIONS CHARGÉES:', bodyCompsData?.length || 0)
        
        const mappedBodyComps: AthleteBodyComp[] = bodyCompsData?.map(item => ({
          id: item.id,
          date: item.date,
          weight: parseFloat(item.weight_kg) || 0,
          height: 180, // Valeur par défaut, à récupérer du profil si disponible
          water_percentage: 60, // Valeur par défaut
          total_muscle: parseFloat(item.muscle_mass_kg) || 0,
          skeletal_muscle: parseFloat(item.muscle_mass_kg) || 0,
          body_fat_percentage: parseFloat(item.body_fat_percentage) || 0
        })) || []
        
        setBodyComps(mappedBodyComps)
      }
      
    } catch (error) {
      console.error('💥 ERREUR RÉSEAU chargement données athlète:', error)
      setRecords([])
      setWorkouts([])
      setBodyComps([])
    } finally {
      console.log('🔍 === FIN CHARGEMENT DONNÉES ATHLÈTE ===')
      setLoading(false)
    }
  }

  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds.toFixed(2)}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toFixed(2).padStart(5, '0')}`;
  };

  const formatDistance = (meters: number): string => {
    return `${meters.toFixed(2)}m`;
  };

  const getEvolutionTrend = (recordsGroup: AthleteRecord[]) => {
    if (recordsGroup.length < 2) return 'stable'
    const first = recordsGroup[0]
    const last = recordsGroup[recordsGroup.length - 1]
    if (first.type === 'run') {
      return last.value < first.value ? 'improving' : last.value > first.value ? 'declining' : 'stable'
    }
    if (first.type === 'jump') {
      return last.value > first.value ? 'improving' : last.value < first.value ? 'declining' : 'stable'
    }
    return last.value > first.value ? 'improving' : last.value < first.value ? 'declining' : 'stable'
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-500" />
      default: return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  // Statistiques par catégorie
  const categoryStats = React.useMemo(() => {
    if (!records) return { run: 0, jump: 0, throw: 0, exercise: 0 }
    
    return {
      run: records.filter(r => r.type === 'run').length,
      jump: records.filter(r => r.type === 'jump').length,
      throw: records.filter(r => r.type === 'throw').length,
      exercise: records.filter(r => r.type === 'exercise').length
    }
  }, [records])
  const getBestValue = (recordsGroup: AthleteRecord[]) => {
    const recordType = recordsGroup[0].type
    return recordType === 'run'
      ? Math.min(...recordsGroup.map(r => r.value))
      : Math.max(...recordsGroup.map(r => r.value))
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce record ?')) {
      // Pour la démo, on supprime juste localement
      setRecords(prev => prev.filter(r => r.id !== id))
    }
  }

  // Grouper les records par discipline pour les graphiques
  const groupedRecords = React.useMemo(() => {
    // Filtrer par catégorie sélectionnée
    const filteredRecords = selectedCategory === 'all' 
      ? records 
      : records.filter(record => record.type === selectedCategory)
    
    const groups: { [key: string]: AthleteRecord[] } = {}
    
    filteredRecords.forEach(record => {
      // Créer une clé unique incluant le type de chaussures pour les courses/sauts/lancers
      const key = (record.type === 'run' || record.type === 'jump' || record.type === 'throw') && record.shoe_type
        ? `${record.name} (${record.shoe_type === 'spikes' ? 'Pointes' : 'Baskets'})`
        : record.name
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(record)
    })
    
    // Trier chaque groupe par date
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    })
    
    return groups
  }, [records, selectedCategory])

  const recentWorkouts = workouts.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)

  const bodyCompData = bodyComps
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(comp => ({
      ...comp,
      dateFormatted: format(new Date(comp.date), 'dd/MM', { locale: fr }),
      bmi: comp.weight / Math.pow(comp.height / 100, 2)
    }))

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header avec retour */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>
        
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center overflow-hidden">
            {athlete.photo_url ? (
              <img 
                src={athlete.photo_url} 
                alt={`${athlete.first_name} ${athlete.last_name}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl font-medium text-primary-600 dark:text-primary-400">
                {athlete.first_name[0]}{athlete.last_name[0]}
              </span>
            )}
          </div>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {athlete.first_name} {athlete.last_name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Membre depuis le {format(new Date(athlete.joined_at), 'd MMMM yyyy', { locale: fr })}
            </p>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="border-b border-gray-200 dark:border-gray-700 overflow-hidden">
        <nav className="flex flex-col sm:flex-row gap-2 sm:gap-4 px-2 sm:px-0">
          <button
            onClick={() => setActiveTab('records')}
            className={`py-3 px-4 border-b-2 font-medium text-sm transition-colors w-full sm:w-auto rounded-t-lg button-3d ${
              activeTab === 'records'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Trophy className="h-4 w-4" />
              <span>Records</span>
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('workouts')}
            className={`py-3 px-4 border-b-2 font-medium text-sm transition-colors w-full sm:w-auto rounded-t-lg button-3d ${
              activeTab === 'workouts'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Dumbbell className="h-4 w-4" />
              <span>Entraînements</span>
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('bodycomp')}
            className={`py-3 px-4 border-b-2 font-medium text-sm transition-colors w-full sm:w-auto rounded-t-lg button-3d ${
              activeTab === 'bodycomp'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center space-x-1 sm:space-x-2">
              <User className="h-4 w-4" />
              <span>Composition corporelle</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'records' && (
        <div className="space-y-6">
          {/* Filtre par catégorie */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Catégorie :
              </label>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">🏆 Tous les records ({records?.length || 0})</option>
              <option value="run">🏃 Courses ({categoryStats.run})</option>
              <option value="jump">🦘 Sauts ({categoryStats.jump})</option>
              <option value="throw">🎯 Lancers ({categoryStats.throw})</option>
              <option value="exercise">💪 Exercices ({categoryStats.exercise})</option>
            </select>
          </div>

          {/* Debug info */}
          {records.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center shadow-lg border border-gray-200 dark:border-gray-700">
              <Trophy className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Aucun record</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Cet athlète n'a pas encore enregistré de records personnels.
              </p>
            </div>
          ) : Object.keys(groupedRecords).length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center shadow-lg border border-gray-200 dark:border-gray-700">
              <Filter className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                Aucun record dans cette catégorie
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Sélectionnez une autre catégorie pour voir les records de cet athlète.
              </p>
              <button
                onClick={() => setSelectedCategory('all')}
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg text-white transition-colors"
              >
                Voir tous les records
              </button>
            </div>
          ) : (
            Object.entries(groupedRecords).map(([disciplineName, disciplineRecords]) => {
            const recordType = disciplineRecords[0].type
            const isRunning = recordType === 'run'
            const isJumping = recordType === 'jump'
            const chartData = disciplineRecords.map((record, index) => ({
              date: format(new Date(record.date), 'dd/MM', { locale: fr }),
              value: record.value,
              fullDate: record.date,
              attempt: index + 1
            }))
            
            const bestValue = recordType === 'run'
              ? Math.min(...disciplineRecords.map(r => r.value))
              : Math.max(...disciplineRecords.map(r => r.value))
            
            const getRecordIcon = () => {
              if (isRunning) return <Clock className="h-6 w-6 text-primary-500" />
              if (isJumping) return <MapPin className="h-6 w-6 text-green-500" />
              return <Weight className="h-6 w-6 text-secondary-500" />
            }
            
            const getRecordColor = () => {
              if (isRunning) return 'text-primary-500'
              if (isJumping) return 'text-green-500'
              return 'text-secondary-500'
            }
            
            const formatValue = (value: number) => {
              if (isRunning) return formatTime(value)
              if (isJumping) return formatDistance(value)
              return `${value.toFixed(2)}kg`
            }
            
            return (
              <div key={disciplineName} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                {/* Header de la discipline */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getRecordIcon()}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {disciplineName}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {disciplineRecords.length} tentative{disciplineRecords.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getRecordColor()}`}>
                      {formatValue(bestValue)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {isRunning ? 'Meilleur temps' : isJumping ? 'Meilleure distance' : 'Record max'}
                    </div>
                  </div>
                </div>

                {/* Graphique d'évolution si plusieurs tentatives */}
                {disciplineRecords.length > 1 && (
                  <div className="mb-4">
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                          <XAxis 
                            dataKey="date" 
                            stroke="#6B7280"
                            fontSize={12}
                          />
                          <YAxis 
                            stroke="#6B7280"
                            fontSize={12}
                            domain={isRunning ? ['dataMin - 0.5', 'dataMax + 0.5'] : 
                                   isJumping ? ['dataMin - 0.2', 'dataMax + 0.2'] : 
                                   ['dataMin - 5', 'dataMax + 5']}
                          />
                          {/* Ligne de référence pour le record */}
                          <ReferenceLine 
                            y={bestValue} 
                            stroke={isRunning ? "#10B981" : isJumping ? "#22C55E" : "#F59E0B"} 
                            strokeDasharray="5 5"
                            strokeWidth={2}
                            label={{ 
                              value: `Record: ${formatValue(bestValue)}`, 
                              position: "topRight",
                              style: { 
                                fill: isRunning ? "#10B981" : isJumping ? "#22C55E" : "#F59E0B", 
                                fontWeight: 'bold',
                                fontSize: '12px'
                              }
                            }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '1px solid #E5E7EB',
                              borderRadius: '8px',
                              color: '#1F2937',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                            formatter={(value: number) => [
                              formatValue(value),
                              `${disciplineName} ${value === bestValue ? '🏆 RECORD' : ''}`
                            ]}
                            labelFormatter={(label, payload) => {
                              if (payload && payload[0]) {
                                return format(new Date(payload[0].payload.fullDate), 'd MMMM yyyy', { locale: fr })
                              }
                              return label
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke={isRunning ? "#7c6df2" : isJumping ? "#22c55e" : "#f97316"}
                            strokeWidth={3}
                            dot={{ 
                              fill: isRunning ? "#7c6df2" : isJumping ? "#22c55e" : "#f97316", 
                              strokeWidth: 2, 
                              r: 5
                            }}
                            activeDot={{ 
                              r: 8, 
                              stroke: isRunning ? "#7c6df2" : isJumping ? "#22c55e" : "#f97316",
                              strokeWidth: 3,
                              fill: 'white'
                            }}
                            label={({ x, y, value, payload }) => {
                              // Afficher la valeur sur les points records
                              if (value === bestValue) {
                                return (
                                  <text 
                                    x={x} 
                                    y={y - 15} 
                                    fill={isRunning ? "#10B981" : isJumping ? "#22C55E" : "#F59E0B"}
                                    textAnchor="middle" 
                                    fontSize="11" 
                                    fontWeight="bold"
                                  >
                                    🏆 {formatValue(value)}
                                  </text>
                                );
                              }
                              return null;
                            }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Dernières tentatives */}
                <div>
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                    <Target className="h-4 w-4 mr-2" />
                    Historique des performances
                  </h5>
                  <div className="space-y-2">
                    {disciplineRecords
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .slice(0, 5)
                      .map((record) => {
                        const isBest = record.value === bestValue
                        
                        return (
                          <div key={record.id} className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                            isBest 
                              ? 'bg-gradient-to-r from-green-50 to-yellow-50 dark:from-green-900/20 dark:to-yellow-900/20 border-green-200 dark:border-green-700' 
                              : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                          }`}>
                            <div className="flex items-center space-x-3">
                              {isBest && <Trophy className="h-4 w-4 text-green-500" />}
                              <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                              {format(new Date(record.date), 'd MMM', { locale: fr })}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`font-medium ${
                                isBest ? 'text-green-600 dark:text-green-400' : 
                                getRecordColor()
                              } text-lg`}>
                                {formatValue(record.value)}
                              </span>
                              <button
                                onClick={(e) => handleDelete(record.id, e)}
                                className="p-1 text-red-400 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                                title="Supprimer ce record"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>
                
                {/* Statistiques de progression */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 card-3d">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-green-500">
                        {formatValue(bestValue)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Record absolu</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-blue-500">
                        {disciplineRecords.length}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Tentatives</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold flex justify-center">
                        {getTrendIcon(getEvolutionTrend(disciplineRecords))}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Tendance</div>
                    </div>
                  </div>
                </div>
              </div>
            )
          }))}
        </div>
      )}

      {activeTab === 'workouts' && (
        <div className="space-y-4">
          <AthleteWorkoutCalendar 
            workouts={workouts}
            athleteName={`${athlete.first_name} ${athlete.last_name}`}
          />
        </div>
      )}

      {activeTab === 'bodycomp' && (
        <div className="space-y-6">
          {bodyCompData.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 sm:p-8 text-center shadow-lg border border-gray-200 dark:border-gray-700">
              <User className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 dark:text-gray-500 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white mb-2">Aucune donnée corporelle</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Cet athlète n'a pas encore enregistré de données de composition corporelle.</p>
            </div>
          ) : (
            <>
              {/* Stats actuelles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {bodyCompData.length > 0 && (
                  <>
                    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                      <div className="text-lg sm:text-2xl font-bold text-accent-500">{bodyCompData[bodyCompData.length - 1].weight.toFixed(1)}kg</div>
                      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Poids actuel</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                      <div className="text-lg sm:text-2xl font-bold text-primary-500">{bodyCompData[bodyCompData.length - 1].bmi.toFixed(1)}</div>
                      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">IMC</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                      <div className="text-lg sm:text-2xl font-bold text-red-500">{bodyCompData[bodyCompData.length - 1].body_fat_percentage.toFixed(1)}%</div>
                      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Masse grasse</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 col-span-2 sm:col-span-1">
                      <div className="text-lg sm:text-2xl font-bold text-secondary-500">{bodyCompData[bodyCompData.length - 1].skeletal_muscle.toFixed(1)}kg</div>
                      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Muscle squelettique</div>
                    </div>
                  </>
                )}
              </div>

              {/* Graphique d'évolution */}
              {bodyCompData.length > 1 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                    Évolution de la composition corporelle
                  </h3>
                  <div className="h-48 sm:h-64 overflow-x-auto">
                    <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={bodyCompData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="dateFormatted" stroke="#6B7280" />
                      <YAxis stroke="#6B7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px',
                          color: '#1F2937'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="body_fat_percentage" 
                        stroke="#EF4444" 
                        strokeWidth={2}
                        name="Masse grasse (%)"
                        dot={{ fill: '#EF4444', strokeWidth: 2, r: 3 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="skeletal_muscle" 
                        stroke="#f97316" 
                        strokeWidth={2}
                        name="Muscle squelettique (kg)"
                        dot={{ fill: '#f97316', strokeWidth: 2, r: 3 }}
                      />
                    </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}