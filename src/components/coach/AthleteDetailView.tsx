import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Profile } from '../../types';
import { TrackRecordsCarousel } from '../dashboard/TrackRecordsCarousel';
import { StrengthRecordsCarousel } from '../dashboard/StrengthRecordsCarousel';
import { WellnessChart } from './WellnessChart';
import { RecentWorkouts } from '../dashboard/RecentWorkouts';

interface AthleteDetailViewProps {
  athlete: Profile;
  onBack: () => void;
}

export const AthleteDetailView: React.FC<AthleteDetailViewProps> = ({ athlete, onBack }) => {
  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
        <ArrowLeft className="w-5 h-5" />
        Retour à la liste
      </button>

      <div>
        <h2 className="text-2xl font-bold">{athlete.first_name} {athlete.last_name}</h2>
        <p className="text-gray-500">{athlete.email}</p>
      </div>

      <WellnessChart userId={athlete.id} />
      
      <TrackRecordsCarousel userId={athlete.id} onNavigate={() => {}} />
      <StrengthRecordsCarousel userId={athlete.id} onNavigate={() => {}} />

      <RecentWorkouts userId={athlete.id} onNavigate={() => {}} />

    </div>
  );
};
