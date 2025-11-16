import React from 'react';
import { motion } from 'framer-motion';

interface QuickRepliesProps {
  onSelectReply: (reply: string) => void;
}

const QUICK_REPLIES = [
  'Mon Planning',
  'Mes Records Récents',
  'Analyse Nutritionnelle',
  'Comment ça va ?',
];

const QuickReplies: React.FC<QuickRepliesProps> = ({ onSelectReply }) => {
  return (
    <div className="px-2 pt-2 bg-light-background dark:bg-dark-background">
      <div className="flex gap-2 pb-2 overflow-x-auto">
        {QUICK_REPLIES.map((reply, index) => (
          <motion.button
            key={reply}
            onClick={() => onSelectReply(reply)}
            className="px-4 py-2 text-sm font-medium text-accent bg-accent/10 rounded-full whitespace-nowrap hover:bg-accent/20"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {reply}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default QuickReplies;