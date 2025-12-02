// src/components/dashboard/command-center/types.ts

export interface PresenceKPI {
  planned: number;
  checked_in: number;
  total_athletes: number;
}

export interface HealthKPI {
  injured: number;
  fatigued: number;
}

export interface LoadKPI {
  planned: number;
  realized: number;
  unit: string;
}

export interface NextUpItem {
  title: string;
  athlete_count: number;
  time?: string; // Optional if we parse it later
}

export interface ActionKPI {
  pending_wellness: number;
  pending_review: number;
}

export interface CommandCenterData {
  presence: PresenceKPI;
  health: HealthKPI;
  load: LoadKPI;
  next_up: NextUpItem[];
  actions: ActionKPI;
}
