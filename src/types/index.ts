export interface Record {
  id: string;
  type: 'run' | 'exercise' | 'jump' | 'throw';
  name: string;
  value: number;
  unit: string;
  date: string;
  timing_method?: 'manual' | 'automatic';
  distance_method?: 'decameter' | 'theodolite';
  wind_speed?: number;
  is_hill?: boolean;
  hill_location?: string;
  shoe_type?: 'spikes' | 'sneakers';
  exercice_reference_id?: string;
  exercice_personnalise_id?: string;
}