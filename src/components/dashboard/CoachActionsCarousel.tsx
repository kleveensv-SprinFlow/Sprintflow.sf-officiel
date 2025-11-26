import React from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Calendar } from 'lucide-react';

type ActionType = 'my-follow-ups' | 'my-athletes-360' | 'manage-planning';

interface ActionCardProps {
  title: string;
  Icon: React.ElementType;
  onClick: () => void;
  colorClass: string;
}

const ActionCard: React.FC<ActionCardProps> = ({ title, Icon, onClick, colorClass }) => (
  <motion.div
    onClick={onClick}
    className="flex-shrink-0 w-48 h-64 rounded-2xl p-4 flex flex-col justify-between items-start cursor-pointer shadow-lg"
    style={{ background: colorClass }}
    whileTap={{ scale: 0.95 }}
  >
    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white">
      <Icon size={24} />
    </div>
    <h3 className="font-bold text-xl text-white leading-tight">{title}</h3>
  </motion.div>
);

interface CoachActionsCarouselProps {
  onAction: (action: ActionType) => void;
}

const CoachActionsCarousel: React.FC<CoachActionsCarouselProps> = ({ onAction }) => {
  const actions = [
    { id: 'my-follow-ups', title: "Mes suivis", Icon: Users, color: "bg-gradient-to-br from-blue-500 to-blue-600" },
    { id: 'my-athletes-360', title: "Mes athlètes 360", Icon: Search, color: "bg-gradient-to-br from-green-500 to-green-600" },
    { id: 'manage-planning', title: "Gestion de planning", Icon: Calendar, color: "bg-gradient-to-br from-yellow-500 to-orange-500" },
  ];

  return (
    <div className="p-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Actions rapides</h2>
        <div className="flex space-x-4 overflow-x-auto pb-4">
            {actions.map((action, index) => (
                <ActionCard 
                    key={index}
                    title={action.title}
                    Icon={action.Icon}
                    onClick={() => onAction(action.id as ActionType)}
                    colorClass={action.color}
                />
            ))}
        </div>
    </div>
  );
};

export default CoachActionsCarousel;
