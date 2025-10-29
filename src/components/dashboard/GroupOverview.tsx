// src/components/dashboard/GroupOverview.tsx
import React from 'react';
import { useGroups } from '../../hooks/useGroups';
import { Loader, Users, Crown } from 'lucide-react';

export const GroupOverview: React.FC = () => {
  const { groups, loading } = useGroups();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader className="animate-spin text-green-500" size={32} />
      </div>
    );
  }

  const group = groups[0]; // On ne gère que le premier groupe pour cet aperçu

  if (!group) {
    return (
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
          Mon Groupe
        </h2>
        <div className="text-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <Users className="mx-auto text-gray-400" size={40}/>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Vous n'êtes dans aucun groupe.</p>
        </div>
      </div>
    );
  }

  const coach = group.coach;
  const athletes = group.members || [];

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
        {group.name}
      </h2>
      <div className="relative flex flex-col items-center justify-center p-4 h-48">
        {coach && (
          <div className="relative z-10 flex flex-col items-center text-center">
            <img
              src={coach.avatar_url || `https://ui-avatars.com/api/?name=${coach.first_name}+${coach.last_name}`}
              alt="Coach"
              className="w-24 h-24 rounded-full border-4 border-secondary-500 shadow-lg"
            />
            <h3 className="mt-2 text-lg font-semibold">{`${coach.first_name} ${coach.last_name}`}</h3>
            <p className="text-sm text-secondary-500 flex items-center"><Crown size={14} className="mr-1"/> Coach</p>
          </div>
        )}

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex justify-center items-center w-full mt-8">
          {athletes.map((member, index) => (
            <img
              key={member.athlete.id}
              src={member.athlete.avatar_url || `https://ui-avatars.com/api/?name=${member.athlete.first_name}+${member.athlete.last_name}`}
              alt={`Athlète ${index + 1}`}
              className="w-12 h-12 rounded-full border-2 border-gray-300 absolute"
              style={{
                transform: `rotate(${index * (360 / athletes.length)}deg) translateY(-100px) rotate(-${index * (360 / athletes.length)}deg)`,
                opacity: 0.8,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};