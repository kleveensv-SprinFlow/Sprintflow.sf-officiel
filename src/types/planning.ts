export type PhaseType = 'volume' | 'intensite' | 'recuperation' | 'competition';

export interface PlanningPhase {
  id: string;
  coach_id: string;
  group_id?: string;
  athlete_id?: string;
  name: string;
  type: PhaseType;
  start_date: string; // ISO date string YYYY-MM-DD
  end_date: string;   // ISO date string YYYY-MM-DD
  color_hex: string;
  created_at?: string;
}

export interface PhaseCreationPayload {
  name: string;
  type: PhaseType;
  start_date: string;
  end_date: string;
  color_hex: string;
  coach_id: string;
  group_id?: string;
  athlete_id?: string;
}
