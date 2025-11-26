import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Zap, Trophy, Bot, Video } from 'lucide-react';

type ActionType = 'new-workout' | 'live-workout' | 'new-record' | 'nutrition' | 'video-analysis';

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

interface ActionsCarouselProps {
  onAction: (action: ActionType) => void;
}

const ActionsCarousel: React.FC<ActionsCarouselProps> = ({ onAction }) => {
  const actions = [
    { id: 'new-workout', title: "Ajouter un entraînement", Icon: Plus, color: "bg-gradient-to-br from-blue-500 to-blue-600" },
    { id: 'live-workout', title: "Entraînement live", Icon: Zap, color: "bg-gradient-to-br from-green-500 to-green-600" },
    { id: 'new-record', title: "Ajouter un record", Icon: Trophy, color: "bg-gradient-to-br from-yellow-500 to-orange-500" },
    { id: 'nutrition', title: "Nutrition", Icon: Bot, color: "bg-gradient-to-br from-purple-500 to-purple-600" },
    { id: 'video-analysis', title: "Analyse vidéo", Icon: Video, color: "bg-gradient-to-br from-red-500 to-red-600" },
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

export default ActionsCarousel;
